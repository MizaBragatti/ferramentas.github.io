/**
 * Calculations Module
 * Handles attendance percentage calculations and alert generation
 */

const Calculator = {
    // Calculate attendance statistics for a student in a specific module
    calculateModuleAttendance(studentId, moduleNumber) {
        const attendance = DataManager.getAttendanceByStudent(studentId)
            .filter(a => a.moduleNumber === moduleNumber);

        const total = attendance.length;
        const present = attendance.filter(a => a.present).length;
        const absent = attendance.filter(a => !a.present).length;

        return {
            total,
            present,
            absent,
            attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
            absencePercentage: total > 0 ? Math.round((absent / total) * 100) : 0
        };
    },

    // Calculate attendance for a specific phase
    calculatePhaseAttendance(studentId, moduleNumber, phaseNumber) {
        const attendance = DataManager.getAttendanceByStudent(studentId)
            .filter(a => a.moduleNumber === moduleNumber && a.phaseNumber === phaseNumber);

        const total = attendance.length;
        const present = attendance.filter(a => a.present).length;
        const absent = attendance.filter(a => !a.present).length;

        return {
            total,
            present,
            absent,
            attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
            absencePercentage: total > 0 ? Math.round((absent / total) * 100) : 0
        };
    },

    // Calculate overall attendance for a student
    calculateOverallAttendance(studentId) {
        const attendance = DataManager.getAttendanceByStudent(studentId);

        const total = attendance.length;
        const present = attendance.filter(a => a.present).length;
        const absent = attendance.filter(a => !a.present).length;

        return {
            total,
            present,
            absent,
            attendancePercentage: total > 0 ? Math.round((present / total) * 100) : 0,
            absencePercentage: total > 0 ? Math.round((absent / total) * 100) : 0
        };
    },

    // Check and generate alert for a student in a module
    checkAlert(studentId, moduleNumber) {
        const stats = this.calculateModuleAttendance(studentId, moduleNumber);

        // Clear previous alerts for this student/module
        DataManager.clearAlertsForStudent(studentId, moduleNumber);

        let alert = null;

        if (stats.total === 0) {
            return null; // No attendance records yet
        }

        if (stats.absencePercentage >= 40) {
            alert = {
                level: 'CRITICAL',
                type: 'critical',
                message: 'Aluno deve repetir o módulo (40% ou mais de faltas)',
                color: 'red',
                icon: '🔴',
                threshold: 40,
                absenceRate: stats.absencePercentage
            };
            
            DataManager.saveAlert({
                studentId,
                moduleNumber,
                type: 'critical',
                absenceRate: stats.absencePercentage
            });
        } else if (stats.absencePercentage >= 25) {
            alert = {
                level: 'WARNING',
                type: 'warning',
                message: 'Atenção: Taxa de faltas atingiu 25%',
                color: 'orange',
                icon: '🟠',
                threshold: 25,
                absenceRate: stats.absencePercentage
            };
            
            DataManager.saveAlert({
                studentId,
                moduleNumber,
                type: 'warning',
                absenceRate: stats.absencePercentage
            });
        }

        return alert;
    },

    // Get alert status for student
    getAlertStatus(studentId, moduleNumber) {
        const stats = this.calculateModuleAttendance(studentId, moduleNumber);

        if (stats.total === 0) {
            return {
                level: 'NONE',
                status: 'No data',
                icon: '⚪',
                color: 'gray'
            };
        }

        if (stats.absencePercentage >= 40) {
            return {
                level: 'CRITICAL',
                status: `${stats.attendancePercentage}% (CRÍTICO)`,
                icon: '🔴',
                color: 'red',
                message: 'Deve repetir o módulo'
            };
        } else if (stats.absencePercentage >= 25) {
            const remaining = Math.ceil((40 - stats.absencePercentage) / 100 * stats.total);
            return {
                level: 'WARNING',
                status: `${stats.attendancePercentage}% (AVISO)`,
                icon: '🟠',
                color: 'orange',
                message: `${remaining} faltas restantes até crítico`
            };
        } else {
            return {
                level: 'OK',
                status: `${stats.attendancePercentage}% ✓`,
                icon: '✅',
                color: 'green',
                message: 'Situação regular'
            };
        }
    },

    // Get all students with alerts
    getAllAlerts() {
        const students = DataManager.getStudents();
        const alerts = {
            critical: [],
            warning: [],
            ok: []
        };

        students.forEach(student => {
            const stats = this.calculateModuleAttendance(student.id, student.currentModule);
            
            if (stats.total > 0) {
                const alertData = {
                    student,
                    stats,
                    moduleNumber: student.currentModule
                };

                if (stats.absencePercentage >= 40) {
                    alerts.critical.push(alertData);
                } else if (stats.absencePercentage >= 25) {
                    alerts.warning.push(alertData);
                } else {
                    alerts.ok.push(alertData);
                }
            }
        });

        return alerts;
    },

    // Calculate statistics for all modules
    getModuleStatistics() {
        const modules = DataManager.getModules();
        const stats = [];

        modules.forEach(module => {
            const studentsInModule = DataManager.getStudents()
                .filter(s => s.currentModule === module.number);

            const attendances = studentsInModule.map(student => 
                this.calculateModuleAttendance(student.id, module.number)
            );

            const avgAttendance = attendances.length > 0
                ? Math.round(
                    attendances.reduce((sum, a) => sum + a.attendancePercentage, 0) / 
                    attendances.length
                )
                : 0;

            const criticalCount = attendances.filter(a => a.absencePercentage >= 40).length;
            const warningCount = attendances.filter(a => a.absencePercentage >= 25 && a.absencePercentage < 40).length;

            stats.push({
                module,
                studentCount: studentsInModule.length,
                avgAttendance,
                criticalCount,
                warningCount
            });
        });

        return stats;
    },

    // Calculate phase-by-phase breakdown for a student
    getPhaseBreakdown(studentId, moduleNumber) {
        const phases = [];

        for (let i = 1; i <= 4; i++) {
            const stats = this.calculatePhaseAttendance(studentId, moduleNumber, i);
            phases.push({
                phaseNumber: i,
                ...stats
            });
        }

        return phases;
    },

    // Format percentage for display
    formatPercentage(value) {
        return `${Math.round(value)}%`;
    },

    // Get student progress across all modules
    getStudentProgress(studentId) {
        const modules = [1, 2, 3, 4];
        const progress = [];

        modules.forEach(moduleNum => {
            const stats = this.calculateModuleAttendance(studentId, moduleNum);
            const phases = this.getPhaseBreakdown(studentId, moduleNum);
            const alert = this.checkAlert(studentId, moduleNum);

            progress.push({
                moduleNumber: moduleNum,
                stats,
                phases,
                alert,
                status: stats.total > 0 ? 'in-progress' : 'not-started'
            });
        });

        return progress;
    }
};
