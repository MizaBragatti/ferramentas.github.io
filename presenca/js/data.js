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
    lastBackgroundSyncAt: {},
    syncThrottleMs: 20000,

    // Helper to get Firebase path (shared data vs per-user data)
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

    isSharedKey(key) {
        return key === this.KEYS.STUDENTS || key === this.KEYS.ATTENDANCE;
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

        // Attendance uses local-first with background sync throttling
        if (key === this.KEYS.ATTENDANCE) {
            if (localData !== null) {
                if (this.useFirebase && this.shouldBackgroundSync(key)) {
                    this.syncFromFirebase(key).catch(err =>
                        console.warn(`Background sync failed for ${key}:`, err)
                    );
                }
                return this.normalizeAttendanceData(localData);
            }

            const firebaseAttendance = await this.getDataFromFirebase(key);
            if (firebaseAttendance && firebaseAttendance.length > 0) {
                return firebaseAttendance;
            }

            return [];
        }
        
        // If we have local data, return it immediately
        if (localData !== null) {
            console.log(`getData(${key}) from localStorage cache:`, this.summarizeForLog(localData));
            
            // Sync with Firebase in background (don't wait)
            if (this.useFirebase && this.shouldBackgroundSync(key)) {
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
                
                // Normalize attendance structure (supports nested year/month/day export)
                if (key === this.KEYS.ATTENDANCE) {
                    const normalizedAttendance = this.normalizeAttendanceData(data);
                    this.setDataLocal(key, normalizedAttendance);
                    return normalizedAttendance;
                }

                // Convert Firebase numeric-key object to array if needed
                if (data && typeof data === 'object' && !Array.isArray(data)) {
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

    // Force read directly from Firebase (bypasses local cache)
    async getDataFromFirebase(key) {
        if (!this.useFirebase) return [];

        try {
            const user = getCurrentUser();
            if (!user) {
                console.log(`getDataFromFirebase(${key}): No user, returning empty array`);
                return [];
            }

            if (key === this.KEYS.ATTENDANCE) {
                const attendance = await this.fetchAttendanceFromFirebase(user.uid);
                if (attendance.length > 0) {
                    this.setDataLocal(key, attendance);
                    return attendance;
                }

                const localCache = this.getDataLocal(key);
                return this.normalizeAttendanceData(localCache);
            }

            const path = this.getFirebasePath(key, user.uid);
            const dataRef = ref(database, path);
            const snapshot = await get(dataRef);

            if (!snapshot.exists()) {
                this.setDataLocal(key, []);
                return [];
            }

            const data = snapshot.val();
            let processedData = data;

            if (data && typeof data === 'object' && !Array.isArray(data)) {
                const keys = Object.keys(data);
                if (keys.every(k => !isNaN(k))) {
                    processedData = Object.values(data);
                }
            }

            this.setDataLocal(key, processedData);
            return processedData || [];
        } catch (error) {
            console.error(`getDataFromFirebase(${key}) error:`, error);
            return [];
        }
    },

    // Background sync from Firebase
    async syncFromFirebase(key) {
        const user = getCurrentUser();
        if (!user) return;

        if (key === this.KEYS.ATTENDANCE) {
            const attendance = await this.fetchAttendanceFromFirebase(user.uid);
            if (attendance.length > 0) {
                this.setDataLocal(key, attendance);
                console.log(`Background sync completed for ${key}`);
            }
            return;
        }
        
        const path = this.getFirebasePath(key, user.uid);
        const dataRef = ref(database, path);
        const snapshot = await get(dataRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Convert object to array if needed
            let processedData = data;
            if (data && typeof data === 'object' && !Array.isArray(data)) {
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
        const valueForLocal = key === this.KEYS.ATTENDANCE
            ? this.normalizeAttendanceData(value)
            : value;

        // Save to localStorage immediately for instant response
        this.setDataLocal(key, valueForLocal);
        console.log(`setData(${key}): Saved to localStorage cache`);
        
        // Sync to Firebase in background (don't block UI)
        if (this.useFirebase) {
            this.syncToFirebase(key, valueForLocal).catch(err => {
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
            const valueForFirebase = key === this.KEYS.ATTENDANCE
                ? this.serializeAttendanceForFirebase(value)
                : value;

            await set(dataRef, valueForFirebase);
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

    summarizeForLog(value) {
        if (Array.isArray(value)) {
            return `${value.length} items`;
        }
        if (value && typeof value === 'object') {
            return `${Object.keys(value).length} keys`;
        }
        return value;
    },

    shouldBackgroundSync(key) {
        const now = Date.now();
        const last = this.lastBackgroundSyncAt[key] || 0;
        if (now - last >= this.syncThrottleMs) {
            this.lastBackgroundSyncAt[key] = now;
            return true;
        }
        return false;
    },

    isAttendanceRecord(value) {
        return !!(
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            typeof value.studentId !== 'undefined' &&
            typeof value.date === 'string' &&
            typeof value.present === 'boolean'
        );
    },

    normalizeAttendanceData(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;

        const records = [];
        const walk = (node) => {
            if (!node) return;

            if (Array.isArray(node)) {
                node.forEach(walk);
                return;
            }

            if (this.isAttendanceRecord(node)) {
                records.push(node);
                return;
            }

            if (typeof node === 'object') {
                Object.values(node).forEach(walk);
            }
        };

        walk(data);
        return records;
    },

    getAttendanceDateParts(dateString) {
        if (!dateString || typeof dateString !== 'string') return null;

        const parts = dateString.split('-');
        if (parts.length !== 3) return null;

        const [year, month, day] = parts;
        if (!year || !month || !day) return null;

        return { year, month, day };
    },

    getAttendanceRecordKey(record) {
        const rawId = record && record.id != null
            ? String(record.id)
            : `${Date.now()}_${Math.random().toString().slice(2, 8)}`;

        return rawId.replace(/\./g, '_');
    },

    serializeAttendanceForFirebase(attendanceData) {
        const records = this.normalizeAttendanceData(attendanceData);
        const tree = {};

        for (const record of records) {
            if (!this.isAttendanceRecord(record)) continue;

            const dateParts = this.getAttendanceDateParts(record.date);
            if (!dateParts) continue;

            const { year, month, day } = dateParts;
            if (!tree[year]) tree[year] = {};
            if (!tree[year][month]) tree[year][month] = {};
            if (!tree[year][month][day]) tree[year][month][day] = {};

            const recordKey = this.getAttendanceRecordKey(record);
            tree[year][month][day][recordKey] = record;
        }

        return tree;
    },

    getAttendanceCandidatePaths(userId) {
        return [
            this.getFirebasePath(this.KEYS.ATTENDANCE, userId),
            `shared/attendanceRecords`,
            `shared/attendance/records`,
            `users/${userId}/attendanceRecords`,
            `users/${userId}/attendance/records`
        ];
    },

    getAttendanceDayCandidatePaths(userId, dateString) {
        const dateParts = this.getAttendanceDateParts(dateString);
        if (!dateParts) return [];

        const { year, month, day } = dateParts;
        const monthNoLeading = String(parseInt(month, 10));
        const dayNoLeading = String(parseInt(day, 10));

        return [
            `shared/attendance_records/${year}/${month}/${day}`,
            `shared/attendance_records/${year}/${monthNoLeading}/${dayNoLeading}`,
            `users/${userId}/attendance_records/${year}/${month}/${day}`,
            `users/${userId}/attendance_records/${year}/${monthNoLeading}/${dayNoLeading}`
        ];
    },

    getCanonicalAttendanceDayPath(dateString) {
        const dateParts = this.getAttendanceDateParts(dateString);
        if (!dateParts) return null;

        const { year, month, day } = dateParts;
        return `shared/attendance_records/${year}/${month}/${day}`;
    },

    async fetchAttendanceByDateFromFirebase(userId, dateString) {
        const candidatePaths = this.getAttendanceDayCandidatePaths(userId, dateString);

        for (const path of candidatePaths) {
            try {
                const dataRef = ref(database, path);
                const snapshot = await get(dataRef);
                if (!snapshot.exists()) continue;

                const normalized = this.normalizeAttendanceData(snapshot.val())
                    .filter(record => record.date === dateString);

                if (normalized.length > 0) {
                    console.log(`Attendance day loaded from Firebase path: ${path} (${normalized.length} registros)`);
                    return normalized;
                }
            } catch (error) {
                const message = String(error?.message || error || '');
                if (!message.toLowerCase().includes('permission denied')) {
                    console.warn(`Failed reading attendance day from ${path}:`, error);
                }
            }
        }

        return [];
    },

    async fetchAttendanceFromFirebase(userId) {
        const candidatePaths = this.getAttendanceCandidatePaths(userId);

        for (const path of candidatePaths) {
            try {
                const dataRef = ref(database, path);
                const snapshot = await get(dataRef);
                if (!snapshot.exists()) continue;

                const normalized = this.normalizeAttendanceData(snapshot.val());
                if (normalized.length > 0) {
                    console.log(`Attendance loaded from Firebase path: ${path} (${normalized.length} registros)`);
                    return normalized;
                }
            } catch (error) {
                const message = String(error?.message || error || '');
                if (message.toLowerCase().includes('permission denied')) {
                    console.log(`Attendance path not accessible: ${path}`);
                } else {
                    console.warn(`Failed reading attendance from ${path}:`, error);
                }
            }
        }

        return [];
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
        const attendance = await this.getAttendance();
        const filteredAttendance = attendance.filter(a => a.studentId !== id);
        await this.setData(this.KEYS.ATTENDANCE, filteredAttendance);
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

    // Attendance CRUD
    async getAttendance() {
        const attendance = await this.getData(this.KEYS.ATTENDANCE);
        return this.normalizeAttendanceData(attendance);
    },

    // Current academic period helpers (current year + current semester)
    getCurrentPeriod() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const semester = month <= 6 ? 1 : 2;

        const startDate = semester === 1
            ? `${year}-01-01`
            : `${year}-07-01`;
        const endDate = semester === 1
            ? `${year}-06-30`
            : `${year}-12-31`;

        return {
            year,
            semester,
            startDate,
            endDate,
            label: `${year} - ${semester}º semestre`
        };
    },

    isDateInCurrentPeriod(dateString) {
        if (!dateString) return false;
        const { startDate, endDate } = this.getCurrentPeriod();
        return dateString >= startDate && dateString <= endDate;
    },

    filterAttendanceToCurrentPeriod(attendance = []) {
        return attendance.filter(record => this.isDateInCurrentPeriod(record.date));
    },

    async getAttendanceCurrentPeriod() {
        const attendance = await this.getAttendance();
        return this.filterAttendanceToCurrentPeriod(attendance);
    },

    async getAttendanceByDate(date) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.date === date);
    },

    async getAttendanceByDateFromFirebase(date) {
        const user = getCurrentUser();
        if (!user) return [];

        const dayAttendance = await this.fetchAttendanceByDateFromFirebase(user.uid, date);
        if (dayAttendance.length > 0) {
            return dayAttendance;
        }

        const attendance = await this.getDataFromFirebase(this.KEYS.ATTENDANCE);
        return attendance.filter(a => a.date === date);
    },

    async getAttendanceByStudent(studentId) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.studentId === studentId);
    },

    async getAttendanceByStudentCurrentPeriod(studentId) {
        const attendance = await this.getAttendanceCurrentPeriod();
        return attendance.filter(a => a.studentId === studentId);
    },

    async getAttendanceByModule(moduleNumber) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.moduleNumber === moduleNumber);
    },

    async getAttendanceByModuleCurrentPeriod(moduleNumber) {
        const attendance = await this.getAttendanceCurrentPeriod();
        return attendance.filter(a => a.moduleNumber === moduleNumber);
    },

    async getAttendanceByPhase(moduleNumber, phaseNumber) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => 
            a.moduleNumber === moduleNumber && 
            a.phaseNumber === phaseNumber
        );
    },

    async getAttendanceByPhaseCurrentPeriod(moduleNumber, phaseNumber) {
        const attendance = await this.getAttendanceCurrentPeriod();
        return attendance.filter(a => 
            a.moduleNumber === moduleNumber && 
            a.phaseNumber === phaseNumber
        );
    },

    async addAttendanceRecord(record) {
        const attendance = await this.getAttendance();
        const recordDate = record.date || new Date().toISOString().split('T')[0];
        const recordYear = parseInt(recordDate.split('-')[0], 10);
        const recordSemester = parseInt(recordDate.split('-')[1], 10) <= 6 ? 1 : 2;

        const newRecord = {
            id: Date.now() + Math.random(),
            studentId: record.studentId,
            date: recordDate,
            year: recordYear,
            semester: recordSemester,
            moduleNumber: record.moduleNumber,
            phaseNumber: record.phaseNumber,
            present: record.present,
            notes: record.notes || '',
            timestamp: new Date().toISOString()
        };
        
        console.log('addAttendanceRecord - Adicionando novo registro:', newRecord);
        attendance.push(newRecord);
        await this.setData(this.KEYS.ATTENDANCE, attendance);
        console.log('addAttendanceRecord - Total de registros agora:', attendance.length);
        return newRecord;
    },

    async updateAttendanceRecord(id, updates) {
        const attendance = await this.getAttendance();
        const index = attendance.findIndex(a => a.id === id);
        
        if (index !== -1) {
            console.log('updateAttendanceRecord - Atualizando registro:', attendance[index]);
            attendance[index] = { ...attendance[index], ...updates };
            console.log('updateAttendanceRecord - Registro atualizado:', attendance[index]);
            await this.setData(this.KEYS.ATTENDANCE, attendance);
            return attendance[index];
        }
        console.warn('updateAttendanceRecord - Registro não encontrado com id:', id);
        return null;
    },

    // Check if attendance exists for student on date
    async getAttendanceRecord(studentId, date) {
        const attendance = await this.getAttendance();
        return attendance.find(a => a.studentId === studentId && a.date === date);
    },

    // Save or update attendance
    async saveAttendance(studentId, date, moduleNumber, phaseNumber, present) {
        console.log(`saveAttendance chamado: studentId=${studentId}, date=${date}, module=${moduleNumber}, phase=${phaseNumber}, present=${present}`);

        const user = getCurrentUser();
        if (!user) {
            throw new Error('User must be authenticated to save attendance');
        }

        const dayPath = this.getCanonicalAttendanceDayPath(date);
        if (!dayPath) {
            throw new Error(`Invalid attendance date: ${date}`);
        }

        this.emitSyncStatus('syncing');

        try {
            const dayRef = ref(database, dayPath);
            const snapshot = await get(dayRef);
            const rawDayData = snapshot.exists() ? snapshot.val() : {};

            let existingKey = null;
            let existingRecord = null;

            Object.entries(rawDayData || {}).forEach(([key, value]) => {
                if (this.isAttendanceRecord(value) && value.studentId === studentId && value.date === date) {
                    existingKey = key;
                    existingRecord = value;
                }
            });

            const recordYear = parseInt(date.split('-')[0], 10);
            const recordSemester = parseInt(date.split('-')[1], 10) <= 6 ? 1 : 2;

            const recordToSave = existingRecord
                ? {
                    ...existingRecord,
                    moduleNumber,
                    phaseNumber,
                    present,
                    timestamp: new Date().toISOString()
                }
                : {
                    id: Date.now() + Math.random(),
                    studentId,
                    date,
                    year: recordYear,
                    semester: recordSemester,
                    moduleNumber,
                    phaseNumber,
                    present,
                    notes: '',
                    timestamp: new Date().toISOString()
                };

            const recordKey = existingKey || this.getAttendanceRecordKey(recordToSave);
            const recordRef = ref(database, `${dayPath}/${recordKey}`);
            await set(recordRef, recordToSave);

            // Update local cache incrementally
            const localAttendance = this.normalizeAttendanceData(this.getDataLocal(this.KEYS.ATTENDANCE));
            const localIndex = localAttendance.findIndex(r => r.studentId === studentId && r.date === date);

            if (localIndex !== -1) {
                localAttendance[localIndex] = recordToSave;
            } else {
                localAttendance.push(recordToSave);
            }

            this.setDataLocal(this.KEYS.ATTENDANCE, localAttendance);
            this.emitSyncStatus('synced');

            return recordToSave;
        } catch (error) {
            this.emitSyncStatus('error');
            console.error('saveAttendance failed:', error);
            throw error;
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
        if (data.attendance) await this.setData(this.KEYS.ATTENDANCE, data.attendance);
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
            // Clear Firebase data (skip shared keys)
            for (const key of Object.values(this.KEYS)) {
                if (this.isSharedKey(key)) continue; // Don't delete shared data
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
