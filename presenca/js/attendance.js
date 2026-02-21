/**
 * Attendance Module
 * Handles attendance marking and display
 */

import DataManager from './data.js';
import Calculator from './calculations.js';

let currentDate = '';
let currentModuleFilter = 'all';
let currentPhaseFilter = 'all';
let isUpdating = false; // Flag to prevent concurrent updates
let temporaryAttendance = {}; // Temporary storage for unsaved attendance marks
let hasUnsavedChanges = false; // Flag to track unsaved changes

// Initialize attendance page
export async function initAttendancePage() {
    console.log('Initializing attendance page...');
    setToday();
    await loadAttendance();
    setupEventListeners();
    setupBeforeUnloadWarning();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('attendanceDate').addEventListener('change', handleDateChange);
    document.getElementById('moduleFilter').addEventListener('change', handleModuleFilterChange);
    document.getElementById('phaseFilter').addEventListener('change', handleFilterChange);
    document.getElementById('searchAttendance').addEventListener('keyup', filterAttendanceList);
}

// Setup warning before leaving page with unsaved changes
function setupBeforeUnloadWarning() {
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'Você tem alterações não salvas. Deseja realmente sair?';
            return e.returnValue;
        }
    });
}

// Set date to today (Saturday)
function setToday() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = dateStr;
    currentDate = dateStr;
}

// Export setToday to window for onclick handler
if (typeof window !== 'undefined') {
    window.setToday = setToday;
}

// Handle date change with unsaved changes warning
async function handleDateChange() {
    if (hasUnsavedChanges) {
        const confirm = window.confirm('Você tem alterações não salvas. Deseja salvar antes de mudar a data?');
        if (confirm) {
            await saveAttendance();
        } else {
            temporaryAttendance = {};
            hasUnsavedChanges = false;
            updateSaveButtonState();
        }
    }
    await loadAttendance();
}

// Handle filter change with unsaved changes warning
async function handleFilterChange() {
    if (hasUnsavedChanges) {
        const confirm = window.confirm('Você tem alterações não salvas. Deseja salvar antes de mudar o filtro?');
        if (confirm) {
            await saveAttendance();
        } else {
            temporaryAttendance = {};
            hasUnsavedChanges = false;
            updateSaveButtonState();
        }
    }
    await loadAttendance();
}

// Handle module filter change
function handleModuleFilterChange() {
    currentModuleFilter = document.getElementById('moduleFilter').value;
    handleFilterChange();
}

// Load attendance list
async function loadAttendance(clearTemporary = true) {
    currentDate = document.getElementById('attendanceDate').value;
    currentModuleFilter = document.getElementById('moduleFilter').value;
    currentPhaseFilter = document.getElementById('phaseFilter').value;
    
    if (!currentDate) {
        return;
    }
    
    // Clear temporary storage when changing date/filters (only if specified)
    if (clearTemporary) {
        temporaryAttendance = {};
        hasUnsavedChanges = false;
        updateSaveButtonState();
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
    
    console.log(`loadAttendance: Carregados ${existingRecords.length} registros para a data ${currentDate}`, existingRecords);
    
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
        
        // Check temporary storage first, then saved record
        const tempKey = `${student.id}_${currentDate}`;
        const isPresent = temporaryAttendance.hasOwnProperty(tempKey) 
            ? temporaryAttendance[tempKey]
            : (record ? record.present : null);
        
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
    // Prevent concurrent updates
    if (isUpdating) {
        console.log('Update already in progress, queuing...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return markAttendance(studentId, moduleNumber, phaseNumber, present);
    }
    
    isUpdating = true;
    
    try {
        // Update UI immediately for instant feedback
        updateButtonState(studentId, present);
        
        // Save to temporary storage (local memory only)
        const tempKey = `${studentId}_${currentDate}`;
        temporaryAttendance[tempKey] = present;
        
        // Store module and phase info for later save
        temporaryAttendance[`${tempKey}_module`] = moduleNumber;
        temporaryAttendance[`${tempKey}_phase`] = phaseNumber;
        
        hasUnsavedChanges = true;
        updateSaveButtonState();
        
        // Update summary with temporary data
        await updateAttendanceSummary();
        
        console.log('Marcação temporária salva:', { studentId, present });
    } catch (error) {
        console.error('Error marking attendance:', error);
        showMessage('Erro ao marcar presença. Tente novamente.', 'error');
    } finally {
        isUpdating = false;
    }
}

// Export markAttendance to window for onclick handlers
if (typeof window !== 'undefined') {
    window.markAttendance = markAttendance;
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
    const confirmMark = confirm('Marcar todos os alunos como presentes? (Você precisará clicar em "Salvar Presença" depois)');
    
    if (!confirmMark) return;
    
    const students = await DataManager.getStudents();
    
    // Filter students based on current module filter
    let filteredStudents = students;
    if (currentModuleFilter !== 'all') {
        filteredStudents = students.filter(s => s.currentModule === parseInt(currentModuleFilter));
    }
    
    const currentPhase = currentPhaseFilter !== 'all' ? parseInt(currentPhaseFilter) : 1;
    
    let count = 0;
    for (const student of filteredStudents) {
        // Save to temporary storage
        const tempKey = `${student.id}_${currentDate}`;
        temporaryAttendance[tempKey] = true;
        temporaryAttendance[`${tempKey}_module`] = student.currentModule;
        temporaryAttendance[`${tempKey}_phase`] = currentPhase;
        count++;
    }
    
    hasUnsavedChanges = true;
    updateSaveButtonState();
    
    // Reload without clearing temporary storage
    await loadAttendance(false);
    showMessage(`${count} aluno(s) marcados como presentes. Clique em "Salvar Presença" para confirmar.`, 'success');
}

// Export markAllPresent to window for onclick handler
if (typeof window !== 'undefined') {
    window.markAllPresent = markAllPresent;
}

// Clear all marks
async function clearAllMarks() {
    const confirmClear = confirm('Limpar todas as marcações temporárias (não salvas)?');
    
    if (!confirmClear) return;
    
    // Clear only temporary storage, keep saved data
    temporaryAttendance = {};
    hasUnsavedChanges = false;
    updateSaveButtonState();
    
    // Reload with clearing (which is already done above)
    await loadAttendance(true);
    showMessage('Marcações temporárias limpas!', 'info');
}

// Export clearAllMarks to window for onclick handler
if (typeof window !== 'undefined') {
    window.clearAllMarks = clearAllMarks;
}

// Save attendance (save temporary marks to DataManager)
async function saveAttendance() {
    if (!hasUnsavedChanges) {
        showMessage('Não há alterações para salvar.', 'info');
        return;
    }
    
    try {
        const saveCount = Object.keys(temporaryAttendance).filter(k => !k.includes('_module') && !k.includes('_phase')).length;
        
        if (saveCount === 0) {
            showMessage('Não há marcações para salvar.', 'info');
            return;
        }
        
        // Show saving message
        showMessage(`Salvando ${saveCount} marcação(ões)...`, 'info');
        
        console.log('Iniciando salvamento. temporaryAttendance:', temporaryAttendance);
        
        // Save all temporary marks to DataManager (localStorage + Firebase)
        let savedCount = 0;
        for (const key in temporaryAttendance) {
            if (key.includes('_module') || key.includes('_phase')) continue;
            
            // Split key: "studentId_date" (date format: 2026-02-06)
            const parts = key.split('_');
            const studentId = parts[0];
            const date = parts.slice(1).join('_'); // Rejoin in case date has underscores
            
            const present = temporaryAttendance[key];
            const moduleNumber = temporaryAttendance[`${key}_module`];
            const phaseNumber = temporaryAttendance[`${key}_phase`];
            
            console.log(`Salvando: studentId=${studentId}, date=${date}, module=${moduleNumber}, phase=${phaseNumber}, present=${present}`);
            
            const result = await DataManager.saveAttendance(
                parseInt(studentId), 
                date, 
                moduleNumber, 
                phaseNumber, 
                present
            );
            
            console.log('Resultado do salvamento:', result);
            savedCount++;
            
            // Recalculate alerts
            Calculator.checkAlert(parseInt(studentId), moduleNumber).catch(err => 
                console.warn('Alert calculation delayed:', err)
            );
        }
        
        console.log(`${savedCount} registros salvos no DataManager`);
        
        // Clear temporary storage
        temporaryAttendance = {};
        hasUnsavedChanges = false;
        updateSaveButtonState();
        
        showMessage(`✓ ${saveCount} marcação(ões) salva(s) com sucesso!`, 'success');
        
        console.log('Todas as marcações foram salvas no banco de dados');
    } catch (error) {
        console.error('Error saving attendance:', error);
        showMessage('Erro ao salvar presença. Tente novamente.', 'error');
    }
}

// Export saveAttendance to window for onclick handler
if (typeof window !== 'undefined') {
    window.saveAttendance = saveAttendance;
}

// Update save button state to show unsaved changes
function updateSaveButtonState() {
    const saveButtons = document.querySelectorAll('button[onclick="saveAttendance()"]');
    saveButtons.forEach(btn => {
        if (hasUnsavedChanges) {
            btn.classList.add('has-changes');
            btn.textContent = '💾 Salvar Presença *';
            btn.style.background = '#ff9800'; // Orange color for unsaved
            btn.title = 'Há alterações não salvas! Clique para salvar.';
        } else {
            btn.classList.remove('has-changes');
            btn.textContent = '💾 Salvar Presença';
            btn.style.background = ''; // Reset to default
            btn.title = 'Salvar presença no banco de dados';
        }
    });
}

// Update attendance summary
async function updateAttendanceSummary() {
    try {
        const existingRecords = await DataManager.getAttendanceByDate(currentDate);
        const students = await DataManager.getStudents();
        
        let filteredStudents = students;
        if (currentModuleFilter !== 'all') {
            filteredStudents = students.filter(s => s.currentModule === parseInt(currentModuleFilter));
        }
        
        const total = filteredStudents.length;
        
        // Count students with records matching our filters
        // Check temporary storage first, then saved records
        let present = 0;
        let absent = 0;
        
        filteredStudents.forEach(student => {
            const tempKey = `${student.id}_${currentDate}`;
            let studentPresent = null;
            
            // Check temporary storage first
            if (temporaryAttendance.hasOwnProperty(tempKey)) {
                studentPresent = temporaryAttendance[tempKey];
            } else {
                // Fall back to saved record
                const record = existingRecords.find(r => r.studentId === student.id);
                if (record) {
                    studentPresent = record.present;
                }
            }
            
            if (studentPresent === true) {
                present++;
            } else if (studentPresent === false) {
                absent++;
            }
        });
        
        const unmarked = total - present - absent;
        
        // Force DOM update
        const totalEl = document.getElementById('totalCount');
        const presentEl = document.getElementById('presentCount');
        const absentEl = document.getElementById('absentCount');
        const unmarkedEl = document.getElementById('unmarkedCount');
        
        if (totalEl) totalEl.textContent = total;
        if (presentEl) presentEl.textContent = present;
        if (absentEl) absentEl.textContent = absent;
        if (unmarkedEl) unmarkedEl.textContent = unmarked;
        
        if (total > 0) {
            document.getElementById('attendanceSummary').style.display = 'block';
        }
        
        console.log('Summary updated:', { total, present, absent, unmarked });
    } catch (error) {
        console.error('Error updating summary:', error);
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
