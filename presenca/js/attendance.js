/**
 * Attendance Module
 * Handles attendance marking and display
 */

import DataManager from './data.js';
import Calculator from './calculations.js';

let currentDate = '';
let currentModuleFilter = 'all';
let currentPhaseFilter = 'all';

// Initialize attendance page
export async function initAttendancePage() {
    console.log('Initializing attendance page...');
    setToday();
    await loadAttendance();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('attendanceDate').addEventListener('change', loadAttendance);
    document.getElementById('moduleFilter').addEventListener('change', handleModuleFilterChange);
    document.getElementById('phaseFilter').addEventListener('change', loadAttendance);
    document.getElementById('searchAttendance').addEventListener('keyup', filterAttendanceList);
}

// Set date to today (Saturday)
function setToday() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = dateStr;
    currentDate = dateStr;
}

// Handle module filter change
function handleModuleFilterChange() {
    currentModuleFilter = document.getElementById('moduleFilter').value;
    loadAttendance();
}

// Load attendance list
async function loadAttendance() {
    currentDate = document.getElementById('attendanceDate').value;
    currentModuleFilter = document.getElementById('moduleFilter').value;
    currentPhaseFilter = document.getElementById('phaseFilter').value;
    
    if (!currentDate) {
        return;
    }
    
    const students = await DataManager.getStudents();
    
    if (students.length === 0) {
        document.getElementById('attendanceTableBody').innerHTML = `
            <tr class="empty-state">
                <td colspan="6">Nenhum aluno cadastrado. Cadastre alunos primeiro.</td>
            </tr>
        `;
        return;
    }
    
    // Filter students by module if needed
    let filteredStudents = students;
    if (currentModuleFilter !== 'all') {
        filteredStudents = students.filter(s => s.currentModule === parseInt(currentModuleFilter));
    }
    
    // Get existing attendance records for this date
    const existingRecords = await DataManager.getAttendanceByDate(currentDate);
    
    // Display alerts summary
    await displayAlertsSummary(filteredStudents);
    
    // Render attendance list
    await renderAttendanceList(filteredStudents, existingRecords);
}

// Display alerts summary
async function displayAlertsSummary(students) {
    const alerts = {
        critical: [],
        warning: []
    };
    
    for (const student of students) {
        const alertStatus = await Calculator.getAlertStatus(student.id, student.currentModule);
        if (alertStatus.level === 'CRITICAL') {
            alerts.critical.push({ student, alertStatus });
        } else if (alertStatus.level === 'WARNING') {
            alerts.warning.push({ student, alertStatus });
        }
    }
    
    const summaryEl = document.getElementById('alertsSummary');
    
    if (alerts.critical.length > 0 || alerts.warning.length > 0) {
        summaryEl.style.display = 'block';
        summaryEl.innerHTML = `
            ${alerts.critical.length > 0 ? `
                <div class="alert-banner critical">
                    🚨 <strong>${alerts.critical.length} aluno(s) com alertas críticos</strong> (40% ou mais de faltas)
                </div>
            ` : ''}
            ${alerts.warning.length > 0 ? `
                <div class="alert-banner warning">
                    ⚠️ <strong>${alerts.warning.length} aluno(s) com avisos</strong> (25% a 39% de faltas)
                </div>
            ` : ''}
        `;
    } else {
        summaryEl.style.display = 'none';
    }
}

// Render attendance list
async function renderAttendanceList(students, existingRecords) {
    const tbody = document.getElementById('attendanceTableBody');
    
    const rows = [];
    for (let index = 0; index < students.length; index++) {
        const student = students[index];
        const record = existingRecords.find(r => r.studentId === student.id);
        const isPresent = record ? record.present : null;
        
        // Get alert status for this student
        const alertStatus = await Calculator.getAlertStatus(student.id, student.currentModule);
        const stats = await Calculator.calculateModuleAttendance(student.id, student.currentModule);
        
        // Determine current phase (simplified - based on filter or default to 1)
        const currentPhase = currentPhaseFilter !== 'all' ? parseInt(currentPhaseFilter) : 1;
        
        rows.push(`
            <tr data-student-id="${student.id}" class="${alertStatus.level.toLowerCase()}">
                <td>${index + 1}</td>
                <td>
                    ${alertStatus.icon} <strong>${escapeHtml(student.name)}</strong>
                    ${alertStatus.level !== 'OK' && alertStatus.level !== 'NONE' ? `
                        <br><small class="alert-message ${alertStatus.level.toLowerCase()}">${alertStatus.message}</small>
                    ` : ''}
                </td>
                <td>M${student.currentModule}</td>
                <td>F${currentPhase}</td>
                <td class="attendance-buttons">
                    <button 
                        class="btn-attendance btn-present ${isPresent === true ? 'active' : ''}" 
                        onclick="markAttendance(${student.id}, ${student.currentModule}, ${currentPhase}, true)"
                        title="Presente">
                        P
                    </button>
                    <button 
                        class="btn-attendance btn-absent ${isPresent === false ? 'active' : ''}" 
                        onclick="markAttendance(${student.id}, ${student.currentModule}, ${currentPhase}, false)"
                        title="Faltou">
                        F
                    </button>
                </td>
                <td>
                    ${stats.total > 0 ? alertStatus.status : 'Sem dados'}
                </td>
            </tr>
        `);
    }
    
    tbody.innerHTML = rows.join('');
    
    await updateAttendanceSummary();
}

// Mark attendance for a student
async function markAttendance(studentId, moduleNumber, phaseNumber, present) {
    // Update UI immediately for instant feedback
    updateButtonState(studentId, present);
    
    // Save to DataManager (localStorage first, Firebase background)
    await DataManager.saveAttendance(studentId, currentDate, moduleNumber, phaseNumber, present);
    
    // Recalculate alerts in background (don't block UI)
    Calculator.checkAlert(studentId, moduleNumber).catch(err => 
        console.warn('Alert calculation delayed:', err)
    );
    
    // Update summary without full reload
    await updateAttendanceSummary();
}

// Update button state immediately (optimistic UI update)
function updateButtonState(studentId, present) {
    const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
    if (!row) return;
    
    const presentBtn = row.querySelector('.btn-present');
    const absentBtn = row.querySelector('.btn-absent');
    
    if (present === true) {
        presentBtn.classList.add('active');
        absentBtn.classList.remove('active');
    } else if (present === false) {
        presentBtn.classList.remove('active');
        absentBtn.classList.add('active');
    }
}

// Mark all present
async function markAllPresent() {
    const confirmMark = confirm('Marcar todos os alunos como presentes?');
    
    if (!confirmMark) return;
    
    const students = await DataManager.getStudents();
    const currentPhase = currentPhaseFilter !== 'all' ? parseInt(currentPhaseFilter) : 1;
    
    for (const student of students) {
        if (currentModuleFilter === 'all' || student.currentModule === parseInt(currentModuleFilter)) {
            await DataManager.saveAttendance(student.id, currentDate, student.currentModule, currentPhase, true);
            await Calculator.checkAlert(student.id, student.currentModule);
        }
    }
    
    await loadAttendance();
    showMessage('Todos os alunos marcados como presentes!', 'success');
}

// Clear all marks
async function clearAllMarks() {
    const confirmClear = confirm('Limpar todas as marcações de presença desta data?');
    
    if (!confirmClear) return;
    
    const attendance = await DataManager.getAttendance();
    const filtered = attendance.filter(a => a.date !== currentDate);
    await DataManager.setData(DataManager.KEYS.ATTENDANCE, filtered);
    
    await loadAttendance();
    showMessage('Marcações limpas!', 'info');
}

// Save attendance (just a confirmation)
function saveAttendance() {
    showMessage('Presença salva automaticamente!', 'success');
    updateAttendanceSummary();
}

// Update attendance summary
async function updateAttendanceSummary() {
    const existingRecords = await DataManager.getAttendanceByDate(currentDate);
    const students = await DataManager.getStudents();
    
    let filteredStudents = students;
    if (currentModuleFilter !== 'all') {
        filteredStudents = students.filter(s => s.currentModule === parseInt(currentModuleFilter));
    }
    
    const total = filteredStudents.length;
    const present = existingRecords.filter(r => r.present && 
        filteredStudents.some(s => s.id === r.studentId)).length;
    const absent = existingRecords.filter(r => !r.present && 
        filteredStudents.some(s => s.id === r.studentId)).length;
    const unmarked = total - present - absent;
    
    document.getElementById('totalCount').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('unmarkedCount').textContent = unmarked;
    
    if (total > 0) {
        document.getElementById('attendanceSummary').style.display = 'block';
    }
}

// Filter attendance list
function filterAttendanceList() {
    const searchTerm = document.getElementById('searchAttendance').value.toLowerCase();
    const rows = document.querySelectorAll('#attendanceTableBody tr[data-student-id]');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// Export functions to window for onclick handlers
if (typeof window !== 'undefined') {
    window.markAttendance = markAttendance;
    window.markAllPresent = markAllPresent;
    window.clearAllMarks = clearAllMarks;
    window.saveAttendance = saveAttendance;
}
