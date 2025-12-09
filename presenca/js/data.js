/**
 * Data Management Module
 * Handles Firebase Realtime Database and localStorage operations
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

    // Initialize data structure
    async init() {
        try {
            // Try Firebase first
            const user = getCurrentUser();
            if (user && this.useFirebase) {
                await this.initFirebase(user.uid);
            } else {
                // Fallback to localStorage
                this.initLocalStorage();
            }
        } catch (error) {
            console.warn('Firebase init failed, using localStorage:', error);
            this.useFirebase = false;
            this.initLocalStorage();
        }
    },

    // Initialize Firebase
    async initFirebase(userId) {
        const modulesRef = ref(database, `users/${userId}/modules`);
        const modulesSnapshot = await get(modulesRef);
        
        if (!modulesSnapshot.exists()) {
            await this.initializeDefaultModules();
        }
    },

    // Initialize localStorage
    initLocalStorage() {
        if (!this.getDataLocal(this.KEYS.MODULES)) {
            this.initializeDefaultModules();
        }
        if (!this.getDataLocal(this.KEYS.STUDENTS)) {
            this.setDataLocal(this.KEYS.STUDENTS, []);
        }
        if (!this.getDataLocal(this.KEYS.ATTENDANCE)) {
            this.setDataLocal(this.KEYS.ATTENDANCE, []);
        }
        if (!this.getDataLocal(this.KEYS.ALERTS)) {
            this.setDataLocal(this.KEYS.ALERTS, []);
        }
    },

    // Generic get data (Firebase or localStorage)
    async getData(key) {
        if (this.useFirebase) {
            try {
                const user = getCurrentUser();
                if (!user) return this.getDataLocal(key);
                
                const dataRef = ref(database, `users/${user.uid}/${key}`);
                const snapshot = await get(dataRef);
                return snapshot.exists() ? snapshot.val() : null;
            } catch (error) {
                console.warn('Firebase get failed, using localStorage:', error);
                return this.getDataLocal(key);
            }
        }
        return this.getDataLocal(key);
    },

    // Generic set data (Firebase or localStorage)
    async setData(key, value) {
        if (this.useFirebase) {
            try {
                const user = getCurrentUser();
                if (!user) {
                    this.setDataLocal(key, value);
                    return;
                }
                
                const dataRef = ref(database, `users/${user.uid}/${key}`);
                await set(dataRef, value);
                
                // Also save to localStorage for offline access
                this.setDataLocal(key, value);
            } catch (error) {
                console.warn('Firebase set failed, using localStorage:', error);
                this.setDataLocal(key, value);
            }
        } else {
            this.setDataLocal(key, value);
        }
    },

    // Local storage helpers
    getDataLocal(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    setDataLocal(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Real-time listener for data changes
    onDataChange(key, callback) {
        if (!this.useFirebase) return;
        
        try {
            const user = getCurrentUser();
            if (!user) return;
            
            const dataRef = ref(database, `users/${user.uid}/${key}`);
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
        return await this.getData(this.KEYS.ATTENDANCE) || [];
    },

    async getAttendanceByDate(date) {
        const attendance = await this.getAttendance();
        return attendance.filter(a => a.date === date);
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
        const attendance = await this.getAttendance();
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
        
        attendance.push(newRecord);
        await this.setData(this.KEYS.ATTENDANCE, attendance);
        return newRecord;
    },

    async updateAttendanceRecord(id, updates) {
        const attendance = await this.getAttendance();
        const index = attendance.findIndex(a => a.id === id);
        
        if (index !== -1) {
            attendance[index] = { ...attendance[index], ...updates };
            await this.setData(this.KEYS.ATTENDANCE, attendance);
            return attendance[index];
        }
        return null;
    },

    // Check if attendance exists for student on date
    async getAttendanceRecord(studentId, date) {
        const attendance = await this.getAttendance();
        return attendance.find(a => a.studentId === studentId && a.date === date);
    },

    // Save or update attendance
    async saveAttendance(studentId, date, moduleNumber, phaseNumber, present) {
        const existing = await this.getAttendanceRecord(studentId, date);
        
        if (existing) {
            return await this.updateAttendanceRecord(existing.id, {
                moduleNumber,
                phaseNumber,
                present
            });
        } else {
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
        if (data.attendance) await this.setData(this.KEYS.ATTENDANCE, data.attendance);
        if (data.alerts) await this.setData(this.KEYS.ALERTS, data.alerts);
    },

    // Clear all data
    async clearAllData() {
        if (this.useFirebase) {
            try {
                const user = getCurrentUser();
                if (user) {
                    for (const key of Object.values(this.KEYS)) {
                        const dataRef = ref(database, `users/${user.uid}/${key}`);
                        await remove(dataRef);
                    }
                }
            } catch (error) {
                console.warn('Firebase clear failed:', error);
            }
        }
        
        // Also clear localStorage
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        await this.init();
    },

    // Migrate data from localStorage to Firebase
    async migrateToFirebase() {
        if (!this.useFirebase) {
            console.error('Firebase não está habilitado');
            return { success: false, message: 'Firebase não está habilitado' };
        }

        const user = getCurrentUser();
        if (!user) {
            console.error('Usuário não autenticado');
            return { success: false, message: 'Usuário não autenticado' };
        }

        try {
            console.log('Iniciando migração do localStorage para Firebase...');
            let migratedCount = 0;

            // Migrate each data type
            for (const key of Object.values(this.KEYS)) {
                const localData = this.getDataLocal(key);
                
                if (localData && (Array.isArray(localData) ? localData.length > 0 : true)) {
                    console.log(`Migrando ${key}:`, localData);
                    
                    // Check if Firebase already has data
                    const firebaseData = await this.getData(key);
                    
                    if (!firebaseData || (Array.isArray(firebaseData) && firebaseData.length === 0)) {
                        // Firebase is empty, migrate from localStorage
                        const dataRef = ref(database, `users/${user.uid}/${key}`);
                        await set(dataRef, localData);
                        migratedCount++;
                        console.log(`✓ ${key} migrado com sucesso`);
                    } else {
                        console.log(`⊘ ${key} já existe no Firebase, pulando...`);
                    }
                }
            }

            const message = migratedCount > 0 
                ? `Migração concluída! ${migratedCount} conjunto(s) de dados migrado(s) para Firebase.`
                : 'Nenhum dado novo para migrar. Firebase já contém os dados.';
            
            console.log(message);
            return { success: true, message, migratedCount };

        } catch (error) {
            console.error('Erro durante a migração:', error);
            return { success: false, message: 'Erro durante a migração: ' + error.message };
        }
    },

    // Check if localStorage has data that Firebase doesn't
    async hasLocalDataToMigrate() {
        if (!this.useFirebase) return false;

        const user = getCurrentUser();
        if (!user) return false;

        try {
            for (const key of Object.values(this.KEYS)) {
                const localData = this.getDataLocal(key);
                const firebaseData = await this.getData(key);
                
                // If localStorage has data but Firebase doesn't
                if (localData && (Array.isArray(localData) ? localData.length > 0 : true)) {
                    if (!firebaseData || (Array.isArray(firebaseData) && firebaseData.length === 0)) {
                        return true;
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('Erro ao verificar dados locais:', error);
            return false;
        }
    }
};

// Export for use in other modules
export default DataManager;

// Also export as global for backward compatibility with non-module scripts
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
