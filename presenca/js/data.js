/**
 * Data Management Module
 * Handles ONLY Firebase Realtime Database (localStorage is offline cache only)
 * All data operations require Firebase authentication
 */

import { database } from './firebase-config.js';
import { ref, set, get, update, remove, onValue, off } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getCurrentUser } from './auth.js';

const DataManager = {
    // Storage keys
    KEYS: {
        STUDENTS: 'attendance_students',
        MODULES: 'attendance_modules',
        ATTENDANCE: 'attendance_records',
        ALERTS: 'attendance_alerts',
        SETTINGS: 'attendance_settings'
    },

    // Firebase enabled flag
    useFirebase: true,
    listeners: {},

    // Helper to get Firebase path (shared students vs per-user data)
    getFirebasePath(key, userId) {
        // Shared data across all users
        if (key === this.KEYS.STUDENTS) {
            return `shared/students`;
        }
        if (key === this.KEYS.ATTENDANCE) {
            return `shared/attendance_records`;
        }
        // All other data is per-user
        return `users/${userId}/${key}`;
    },

    // Initialize data structure (Firebase only)
    async init() {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated to initialize data');
        }

        if (!this.useFirebase) {
            throw new Error('Firebase is required - localStorage is deprecated');
        }

        await this.initFirebase(user.uid);
        await this.migrateAttendanceToShared(user.uid);
        console.log('DataManager initialized with Firebase for user:', user.uid);
    },

    // Initialize Firebase
    async initFirebase(userId) {
        const modulesPath = this.getFirebasePath(this.KEYS.MODULES, userId);
        const modulesRef = ref(database, modulesPath);
        const modulesSnapshot = await get(modulesRef);
        
        if (!modulesSnapshot.exists()) {
            console.log('No modules found in Firebase, initializing default modules...');
            await this.initializeDefaultModules();
        } else {
            console.log('Modules found in Firebase');
        }
    },

    // Migrate attendance from user path to shared path
    async migrateAttendanceToShared(userId) {
        try {
            const legacyPath = `users/${userId}/${this.KEYS.ATTENDANCE}`;
            const sharedPath = this.getFirebasePath(this.KEYS.ATTENDANCE, userId);

            if (legacyPath === sharedPath) return;

            const legacyRef = ref(database, legacyPath);
            const sharedRef = ref(database, sharedPath);

            const legacySnapshot = await get(legacyRef);
            if (!legacySnapshot.exists()) return;

            const legacyData = legacySnapshot.val();
            const { data: legacyStructured } = this.sanitizeAttendanceKeys(legacyData);

            const sharedSnapshot = await get(sharedRef);
            const sharedData = sharedSnapshot.exists() ? sharedSnapshot.val() : {};
            const { data: sharedStructured } = this.sanitizeAttendanceKeys(sharedData);

            const merged = this.mergeAttendanceData(sharedStructured, legacyStructured);
            await set(sharedRef, merged);

            await remove(legacyRef);
            console.log('Attendance migration completed: user -> shared');
        } catch (error) {
            console.warn('Attendance migration failed:', error);
        }
    },

    // Initialize localStorage (deprecated - Firebase only)
    initLocalStorage() {
        // localStorage is now used only as offline cache
        // All data operations go through Firebase
        console.warn('initLocalStorage called - Firebase is the primary data source');
    },

    // Generic get data (localStorage cache first, then Firebase)
    async getData(key) {
        // Try localStorage first for instant response
        const localData = this.getDataLocal(key);
        
        // If we have local data, return it immediately
        if (localData !== null) {
            console.log(`getData(${key}) from localStorage cache:`, localData);
            
            // Sync with Firebase in background (don't wait)
            if (this.useFirebase) {
                this.syncFromFirebase(key).catch(err => 
                    console.warn(`Background sync failed for ${key}:`, err)
                );
            }
            
            return localData;
        }

        // No local data, try Firebase
        if (this.useFirebase) {
            try {
                const user = getCurrentUser();
                if (!user) {
                    console.log(`getData(${key}): No user, returning empty array`);
                    return [];
                }
                
                const path = this.getFirebasePath(key, user.uid);
                const dataRef = ref(database, path);
                const snapshot = await get(dataRef);
                const data = snapshot.exists() ? snapshot.val() : null;
                
                console.log(`getData(${key}) from Firebase:`, data);
                
                if (!data) {
                    console.log(`getData(${key}): No data in Firebase, returning empty array`);
                    return [];
                }
                
                // Convert Firebase object to array if needed (skip attendance structure)
                if (key !== this.KEYS.ATTENDANCE && data && typeof data === 'object' && !Array.isArray(data)) {
                    const keys = Object.keys(data);
                    if (keys.every(k => !isNaN(k))) {
                        const arr = Object.values(data);
                        console.log(`getData(${key}): Converted object to array`, arr);
                        // Cache locally
                        this.setDataLocal(key, arr);
                        return arr;
                    }
                }
                
                // Cache the data locally
                this.setDataLocal(key, data);
                return data;
            } catch (error) {
                console.error(`getData(${key}): Firebase error:`, error);
                return [];
            }
        }
        
        return [];
    },

    // Background sync from Firebase
    async syncFromFirebase(key) {
        const user = getCurrentUser();
        if (!user) return;
        
        const path = this.getFirebasePath(key, user.uid);
        const dataRef = ref(database, path);
        const snapshot = await get(dataRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Convert object to array if needed (skip attendance structure)
            let processedData = data;
            if (key !== this.KEYS.ATTENDANCE && data && typeof data === 'object' && !Array.isArray(data)) {
                const keys = Object.keys(data);
                if (keys.every(k => !isNaN(k))) {
                    processedData = Object.values(data);
                }
            }
            
            // Update localStorage cache
            this.setDataLocal(key, processedData);
            console.log(`Background sync completed for ${key}`);
        }
    },

    // Generic set data (localStorage immediate, Firebase background)
    async setData(key, value) {
        // Save to localStorage immediately for instant response
        this.setDataLocal(key, value);
        console.log(`setData(${key}): Saved to localStorage cache`);
        
        // Sync to Firebase in background (don't block UI)
        if (this.useFirebase) {
            this.syncToFirebase(key, value).catch(err => {
                console.warn(`Background Firebase sync failed for ${key}:`, err);
                // Data is still in localStorage, so operation appears successful to user
            });
        }
    },

    // Background sync to Firebase
    async syncToFirebase(key, value) {
        const user = getCurrentUser();
        if (!user) {
            console.warn('Cannot sync to Firebase: No authenticated user');
            return;
        }
        
        // Emit syncing event
        this.emitSyncStatus('syncing');
        
        try {
            const path = this.getFirebasePath(key, user.uid);
            const dataRef = ref(database, path);
            await set(dataRef, value);
            console.log(`Background sync to Firebase completed for ${key}`);
            
            // Emit synced event
            this.emitSyncStatus('synced');
        } catch (error) {
            console.error(`Background sync to Firebase failed for ${key}:`, error);
            
            // Emit error event
            this.emitSyncStatus('error');
            throw error;
        }
    },

    // Emit sync status event
    emitSyncStatus(status) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('firebase-sync', { 
                detail: { status } 
            }));
        }
    },

    // Local storage helpers (OFFLINE CACHE ONLY - DO NOT USE AS PRIMARY SOURCE)
    getDataLocal(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    setDataLocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        console.log(`localStorage.setItem(${key}):`, value.length ? `${value.length} items` : value);
    },

    // Real-time listener for data changes
    onDataChange(key, callback) {
        if (!this.useFirebase) return;
        
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            const path = this.getFirebasePath(key, user.uid);
            const dataRef = ref(database, path);
            const listener = onValue(dataRef, (snapshot) => {
                const data = snapshot.exists() ? snapshot.val() : null;
                callback(data);
            });
            
            this.listeners[key] = { ref: dataRef, unsubscribe: () => off(dataRef) };
        } catch (error) {
            console.warn('Firebase listener failed:', error);
        }
    },

    // Remove listener
    offDataChange(key) {
        if (this.listeners[key]) {
            this.listeners[key].unsubscribe();
            delete this.listeners[key];
        }
    },


    // Students CRUD
    async getStudents() {
        return await this.getData(this.KEYS.STUDENTS) || [];
    },

    async getStudent(id) {
        const students = await this.getStudents();
        return students.find(s => s.id === id);
    },

    async addStudent(student) {
        const students = await this.getStudents();
        const nextId = students.length > 0 
            ? Math.max(...students.map(s => s.id)) + 1 
            : 1;
        
        const newStudent = {
            id: nextId,
            name: student.name,
            phone: student.phone,
            currentModule: parseInt(student.currentModule),
            enrollmentDate: new Date().toISOString(),
            status: 'active'
        };
        
        students.push(newStudent);
        await this.setData(this.KEYS.STUDENTS, students);
        return newStudent;
    },

    async updateStudent(id, updates) {
        const students = await this.getStudents();
        const index = students.findIndex(s => s.id === id);
        
        if (index !== -1) {
            students[index] = { ...students[index], ...updates };
            await this.setData(this.KEYS.STUDENTS, students);
            return students[index];
        }
        return null;
    },

    async deleteStudent(id) {
        const students = await this.getStudents();
        const filtered = students.filter(s => s.id !== id);
        await this.setData(this.KEYS.STUDENTS, filtered);
        
        // Also delete related attendance records
        const attendance = await this.getAttendanceRaw();
        let changed = false;
        
        Object.keys(attendance).forEach(year => {
            Object.keys(attendance[year]).forEach(month => {
                Object.keys(attendance[year][month]).forEach(day => {
                    const dayBucket = attendance[year][month][day];
                    Object.keys(dayBucket).forEach(recordId => {
                        if (dayBucket[recordId].studentId === id) {
                            delete dayBucket[recordId];
                            changed = true;
                        }
                    });
                    if (Object.keys(dayBucket).length === 0) {
                        delete attendance[year][month][day];
                    }
                });
                if (Object.keys(attendance[year][month]).length === 0) {
                    delete attendance[year][month];
                }
            });
            if (Object.keys(attendance[year]).length === 0) {
                delete attendance[year];
            }
        });
        
        if (changed) {
            await this.setData(this.KEYS.ATTENDANCE, attendance);
        }
    },

    // Modules CRUD
    async getModules() {
        return await this.getData(this.KEYS.MODULES) || [];
    },

    async getModule(moduleNumber) {
        const modules = await this.getModules();
        return modules.find(m => m.number === moduleNumber);
    },

    async updateModule(moduleNumber, updates) {
        const modules = await this.getModules();
        const index = modules.findIndex(m => m.number === moduleNumber);
        
        if (index !== -1) {
            modules[index] = { ...modules[index], ...updates };
            await this.setData(this.KEYS.MODULES, modules);
            return modules[index];
        }
        return null;
    },

    async getPhase(moduleNumber, phaseNumber) {
        const module = await this.getModule(moduleNumber);
        if (module && module.phases) {
            return module.phases.find(p => p.number === phaseNumber);
        }
        return null;
    },

    async updatePhase(moduleNumber, phaseNumber, updates) {
        const modules = await this.getModules();
        const moduleIndex = modules.findIndex(m => m.number === moduleNumber);
        
        if (moduleIndex !== -1) {
            const phaseIndex = modules[moduleIndex].phases.findIndex(p => p.number === phaseNumber);
            if (phaseIndex !== -1) {
                modules[moduleIndex].phases[phaseIndex] = {
                    ...modules[moduleIndex].phases[phaseIndex],
                    ...updates
                };
                await this.setData(this.KEYS.MODULES, modules);
                return modules[moduleIndex].phases[phaseIndex];
            }
        }
        return null;
    },

    // Attendance helpers (Year -> Month -> Day)
    parseAttendanceDate(date) {
        const [year, month, day] = date.split('-');
        return { year, month, day };
    },

    makeAttendanceKey(id) {
        return String(id).replace(/\./g, '_');
    },

    sanitizeAttendanceKeys(attendanceData) {
        const structured = this.ensureAttendanceStructure(attendanceData);
        let changed = false;

        Object.keys(structured).forEach(year => {
            Object.keys(structured[year]).forEach(month => {
                Object.keys(structured[year][month]).forEach(day => {
                    const dayBucket = structured[year][month][day];
                    Object.keys(dayBucket).forEach(recordKey => {
                        const safeKey = this.makeAttendanceKey(recordKey);
                        if (safeKey !== recordKey) {
                            dayBucket[safeKey] = dayBucket[recordKey];
                            delete dayBucket[recordKey];
                            changed = true;
                        }
                    });
                });
            });
        });

        return { data: structured, changed };
    },

    mergeAttendanceData(baseData, incomingData) {
        const base = this.ensureAttendanceStructure(baseData);
        const incoming = this.ensureAttendanceStructure(incomingData);

        Object.keys(incoming).forEach(year => {
            if (!base[year]) base[year] = {};
            Object.keys(incoming[year]).forEach(month => {
                if (!base[year][month]) base[year][month] = {};
                Object.keys(incoming[year][month]).forEach(day => {
                    if (!base[year][month][day]) base[year][month][day] = {};
                    Object.keys(incoming[year][month][day]).forEach(recordKey => {
                        if (!base[year][month][day][recordKey]) {
                            base[year][month][day][recordKey] = incoming[year][month][day][recordKey];
                        }
                    });
                });
            });
        });

        return base;
    },

    ensureAttendanceStructure(attendanceData) {
        if (!attendanceData) return {};
        if (Array.isArray(attendanceData)) {
            const structured = {};
            attendanceData.forEach(record => {
                if (!record || !record.date) return;
                const { year, month, day } = this.parseAttendanceDate(record.date);
                if (!structured[year]) structured[year] = {};
                if (!structured[year][month]) structured[year][month] = {};
                if (!structured[year][month][day]) structured[year][month][day] = {};
                structured[year][month][day][record.id] = record;
            });
            return structured;
        }
        return attendanceData;
    },

    flattenAttendance(attendanceData) {
        const structured = this.ensureAttendanceStructure(attendanceData);
        const records = [];
        Object.keys(structured).forEach(year => {
            Object.keys(structured[year]).forEach(month => {
                Object.keys(structured[year][month]).forEach(day => {
                    const dayBucket = structured[year][month][day];
                    Object.values(dayBucket).forEach(record => records.push(record));
                });
            });
        });
        return records;
    },

    async getAttendanceRaw() {
        const data = await this.getData(this.KEYS.ATTENDANCE);
        const { data: structured, changed } = this.sanitizeAttendanceKeys(data);
        if (Array.isArray(data) || changed) {
            await this.setData(this.KEYS.ATTENDANCE, structured);
        }
        return structured;
    },

    findAttendanceRecordById(attendance, id) {
        for (const year of Object.keys(attendance)) {
            for (const month of Object.keys(attendance[year])) {
                for (const day of Object.keys(attendance[year][month])) {
                    const dayBucket = attendance[year][month][day];
                    for (const [recordKey, record] of Object.entries(dayBucket)) {
                        if (record.id === id) {
                            return { year, month, day, recordKey, record };
                        }
                    }
                }
            }
        }
        return null;
    },

    // Attendance CRUD
    async getAttendance() {
        const data = await this.getData(this.KEYS.ATTENDANCE);
        return this.flattenAttendance(data);
    },

    async getAttendanceByDate(date) {
        const attendance = await this.getAttendanceRaw();
        const { year, month, day } = this.parseAttendanceDate(date);
        const dayBucket = attendance?.[year]?.[month]?.[day] || {};
        return Object.values(dayBucket);
    },

    async getAttendanceByStudent(studentId) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.studentId === studentId);
    },

    async getAttendanceByModule(moduleNumber) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.moduleNumber === moduleNumber);
    },

    async getAttendanceByPhase(moduleNumber, phaseNumber) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => 
            a.moduleNumber === moduleNumber && 
            a.phaseNumber === phaseNumber
        );
    },

    async addAttendanceRecord(record) {
        const attendance = await this.getAttendanceRaw();
        const newRecord = {
            id: Date.now() + Math.random(),
            studentId: record.studentId,
            date: record.date,
            moduleNumber: record.moduleNumber,
            phaseNumber: record.phaseNumber,
            present: record.present,
            notes: record.notes || '',
            timestamp: new Date().toISOString()
        };
        
        console.log('addAttendanceRecord - Adicionando novo registro:', newRecord);
        const { year, month, day } = this.parseAttendanceDate(newRecord.date);
        if (!attendance[year]) attendance[year] = {};
        if (!attendance[year][month]) attendance[year][month] = {};
        if (!attendance[year][month][day]) attendance[year][month][day] = {};
        const recordKey = this.makeAttendanceKey(newRecord.id);
        attendance[year][month][day][recordKey] = newRecord;
        await this.setData(this.KEYS.ATTENDANCE, attendance);
        console.log('addAttendanceRecord - Registro adicionado na estrutura Ano/Mês/Dia');
        return newRecord;
    },

    async updateAttendanceRecord(id, updates) {
        const attendance = await this.getAttendanceRaw();
        const found = this.findAttendanceRecordById(attendance, id);
        
        if (found) {
            console.log('updateAttendanceRecord - Atualizando registro:', found.record);
            const updated = { ...found.record, ...updates };
            attendance[found.year][found.month][found.day][found.recordKey] = updated;
            console.log('updateAttendanceRecord - Registro atualizado:', updated);
            await this.setData(this.KEYS.ATTENDANCE, attendance);
            return updated;
        }
        console.warn('updateAttendanceRecord - Registro não encontrado com id:', id);
        return null;
    },

    // Check if attendance exists for student on date
    async getAttendanceRecord(studentId, date) {
        const attendance = await this.getAttendanceRaw();
        const { year, month, day } = this.parseAttendanceDate(date);
        const dayBucket = attendance?.[year]?.[month]?.[day] || {};
        return Object.values(dayBucket).find(a => a.studentId === studentId && a.date === date);
    },

    // Save or update attendance
    async saveAttendance(studentId, date, moduleNumber, phaseNumber, present) {
        console.log(`saveAttendance chamado: studentId=${studentId}, date=${date}, module=${moduleNumber}, phase=${phaseNumber}, present=${present}`);
        const existing = await this.getAttendanceRecord(studentId, date);
        
        if (existing) {
            console.log('Registro existente encontrado, atualizando:', existing);
            return await this.updateAttendanceRecord(existing.id, {
                moduleNumber,
                phaseNumber,
                present
            });
        } else {
            console.log('Nenhum registro existente, criando novo');
            return await this.addAttendanceRecord({
                studentId,
                date,
                moduleNumber,
                phaseNumber,
                present
            });
        }
    },

    // Alerts
    async getAlerts() {
        return await this.getData(this.KEYS.ALERTS) || [];
    },

    async saveAlert(alert) {
        const alerts = await this.getAlerts();
        const newAlert = {
            id: Date.now() + Math.random(),
            studentId: alert.studentId,
            moduleNumber: alert.moduleNumber,
            type: alert.type, // 'warning' or 'critical'
            absenceRate: alert.absenceRate,
            generatedAt: new Date().toISOString()
        };
        
        alerts.push(newAlert);
        await this.setData(this.KEYS.ALERTS, alerts);
        return newAlert;
    },

    async clearAlertsForStudent(studentId, moduleNumber) {
        const alerts = await this.getAlerts();
        const filtered = alerts.filter(a => 
            !(a.studentId === studentId && a.moduleNumber === moduleNumber)
        );
        await this.setData(this.KEYS.ALERTS, filtered);
    },

    // Initialize default modules structure
    async initializeDefaultModules() {
        const currentYear = new Date().getFullYear();
        const modules = [];

        for (let i = 1; i <= 4; i++) {
            const module = {
                number: i,
                name: `Módulo ${i}`,
                year: currentYear,
                phases: []
            };

            for (let j = 1; j <= 4; j++) {
                module.phases.push({
                    number: j,
                    name: `Fase ${j}`,
                    startDate: null,
                    endDate: null,
                    expectedClasses: 4
                });
            }

            modules.push(module);
        }

        await this.setData(this.KEYS.MODULES, modules);
        return modules;
    },

    // Export all data
    async exportAllData() {
        return {
            students: await this.getStudents(),
            modules: await this.getModules(),
            attendance: await this.getAttendance(),
            alerts: await this.getAlerts(),
            exportedAt: new Date().toISOString()
        };
    },

    // Import data
    async importData(data) {
        if (data.students) await this.setData(this.KEYS.STUDENTS, data.students);
        if (data.modules) await this.setData(this.KEYS.MODULES, data.modules);
        if (data.attendance) {
            const attendance = this.ensureAttendanceStructure(data.attendance);
            await this.setData(this.KEYS.ATTENDANCE, attendance);
        }
        if (data.alerts) await this.setData(this.KEYS.ALERTS, data.alerts);
    },

    // Clear all data (Firebase only)
    async clearAllData() {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated to clear data');
        }

        if (!this.useFirebase) {
            throw new Error('Firebase is required - localStorage is deprecated');
        }

        try {
            // Clear Firebase data (skip students as they're shared)
            for (const key of Object.values(this.KEYS)) {
                if (key === this.KEYS.STUDENTS) continue; // Don't delete shared students
                const path = this.getFirebasePath(key, user.uid);
                const dataRef = ref(database, path);
                await remove(dataRef);
            }
            console.log('All Firebase data cleared');
            
            // Also clear localStorage cache
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('localStorage cache cleared');
            
            // Reinitialize
            await this.init();
        } catch (error) {
            console.error('Failed to clear data:', error);
            throw error;
        }
    },

    // Clear old localStorage data (migration no longer needed - Firebase is primary)
    async clearLocalStorageCache() {
        console.log('Limpando cache localStorage antigo...');
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('Cache localStorage limpo');
        return { success: true, message: 'Cache localStorage removido' };
    },

    // Legacy migration function (redirects to cache clear)
    async migrateToFirebase() {
        console.warn('migrateToFirebase is deprecated - all data is now in Firebase');
        return { success: true, message: 'Todos os dados já estão no Firebase', migratedCount: 0 };
    },

    // Check if localStorage has old cache (for cleanup)
    hasLocalStorageCache() {
        for (const key of Object.values(this.KEYS)) {
            if (localStorage.getItem(key)) {
                return true;
            }
        }
        return false;
    }
};

// Export for use in other modules
export default DataManager;

// Also export as global for backward compatibility with non-module scripts
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
