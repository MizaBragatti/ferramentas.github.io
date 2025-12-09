/**
 * Students Management Module
 * Handles student registration, editing, and listing
 */

import DataManager from './data.js';

// Initialize students page
export async function initStudentsPage() {
    console.log('Initializing students page...');
    await loadStudents();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    document.getElementById('studentForm').addEventListener('submit', handleAddStudent);
    
    // Edit form submission
    document.getElementById('editStudentForm').addEventListener('submit', handleEditStudent);
    
    // Search functionality
    document.getElementById('searchStudent').addEventListener('keyup', filterStudents);
}

// Handle add student form submission
async function handleAddStudent(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const currentModule = document.getElementById('studentModule').value;
    
    if (!name || !phone) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const newStudent = await DataManager.addStudent({
        name,
        phone,
        currentModule
    });
    
    // Clear form
    clearForm();
    
    // Reload students list
    await loadStudents();
    
    // Show success message
    showMessage(`Aluno "${newStudent.name}" cadastrado com sucesso! ID: ${newStudent.id}`, 'success');
}

// Handle edit student form submission
async function handleEditStudent(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('editStudentId').value);
    const name = document.getElementById('editStudentName').value.trim();
    const phone = document.getElementById('editStudentPhone').value.trim();
    const currentModule = parseInt(document.getElementById('editStudentModule').value);
    
    await DataManager.updateStudent(id, {
        name,
        phone,
        currentModule
    });
    
    closeEditModal();
    await loadStudents();
    showMessage('Aluno atualizado com sucesso!', 'success');
}

// Load and display students
async function loadStudents() {
    console.log('Loading students...');
    const students = await DataManager.getStudents();
    console.log('Students loaded:', students);
    const tbody = document.getElementById('studentsTableBody');
    
    if (!students || students.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">Nenhum aluno cadastrado ainda. Adicione o primeiro aluno acima.</td>
            </tr>
        `;
        updateStats([]);
        return;
    }
    
    tbody.innerHTML = students.map(student => `
        <tr data-student-id="${student.id}">
            <td><strong>#${student.id}</strong></td>
            <td>${escapeHtml(student.name)}</td>
            <td>${escapeHtml(student.phone)}</td>
            <td>
                <span class="module-badge module-${student.currentModule}">
                    Módulo ${student.currentModule}
                </span>
            </td>
            <td>${formatDate(student.enrollmentDate)}</td>
            <td class="actions">
                <button class="btn-icon" onclick="editStudent(${student.id})" title="Editar">
                    ✏️
                </button>
                <button class="btn-icon" onclick="deleteStudent(${student.id})" title="Excluir">
                    🗑️
                </button>
            </td>
        </tr>
    `).join('');
    
    updateStats(students);
}

// Update statistics
function updateStats(students) {
    if (!students) students = [];
    document.getElementById('totalStudents').textContent = students.length;
    
    for (let i = 1; i <= 4; i++) {
        const count = students.filter(s => s.currentModule === i).length;
        document.getElementById(`module${i}Count`).textContent = count;
    }
}

// Edit student
async function editStudent(id) {
    const student = await DataManager.getStudent(id);
    
    if (!student) {
        alert('Aluno não encontrado.');
        return;
    }
    
    document.getElementById('editStudentId').value = student.id;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentPhone').value = student.phone;
    document.getElementById('editStudentModule').value = student.currentModule;
    
    document.getElementById('editModal').style.display = 'flex';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editStudentForm').reset();
}

// Delete student
async function deleteStudent(id) {
    const student = await DataManager.getStudent(id);
    
    if (!student) {
        alert('Aluno não encontrado.');
        return;
    }
    
    const confirmDelete = confirm(
        `Tem certeza que deseja excluir o aluno "${student.name}"?\n\n` +
        `Esta ação também removerá todos os registros de presença associados e não pode ser desfeita.`
    );
    
    if (confirmDelete) {
        await DataManager.deleteStudent(id);
        await loadStudents();
        showMessage(`Aluno "${student.name}" excluído com sucesso.`, 'info');
    }
}

// Clear form
function clearForm() {
    document.getElementById('studentForm').reset();
}

// Filter students by search
function filterStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr[data-student-id]');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'info') {
    // Create message element
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
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageEl.remove(), 300);
    }, 3000);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
};

// Handle import file
async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            if (fileExtension === 'json') {
                await importStudentsJSON(e.target.result);
            } else if (fileExtension === 'csv') {
                await importStudentsCSV(e.target.result);
            } else {
                alert('Formato de arquivo não suportado. Use JSON ou CSV.');
            }
        } catch (error) {
            alert('Erro ao importar arquivo: ' + error.message);
            console.error('Import error:', error);
        }
        // Reset input
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Import students from JSON
async function importStudentsJSON(jsonString) {
    const data = JSON.parse(jsonString);
    
    let studentsToImport = [];
    
    // Check if it's a full export (with students array) or just students array
    if (data.students && Array.isArray(data.students)) {
        studentsToImport = data.students;
    } else if (Array.isArray(data)) {
        studentsToImport = data;
    } else {
        alert('Formato JSON inválido.');
        return;
    }
    
    if (studentsToImport.length === 0) {
        alert('Nenhum aluno encontrado no arquivo.');
        return;
    }
    
    const confirmImport = confirm(
        `Deseja importar ${studentsToImport.length} aluno(s)?\n\n` +
        `ATENÇÃO: Isto irá SUBSTITUIR todos os alunos cadastrados atualmente.\n` +
        `Recomendamos fazer um backup antes de continuar.`
    );
    
    if (!confirmImport) return;
    
    // Validate and import students
    const currentStudents = await DataManager.getStudents();
    const maxId = currentStudents.length > 0 ? Math.max(...currentStudents.map(s => s.id)) : 0;
    
    const validStudents = [];
    let nextId = maxId + 1;
    
    studentsToImport.forEach(student => {
        if (student.name && student.phone) {
            validStudents.push({
                id: student.id || nextId++,
                name: student.name,
                phone: student.phone,
                currentModule: parseInt(student.currentModule) || 1,
                enrollmentDate: student.enrollmentDate || new Date().toISOString(),
                status: student.status || 'active'
            });
        }
    });
    
    if (validStudents.length === 0) {
        alert('Nenhum aluno válido encontrado no arquivo.');
        return;
    }
    
    // Replace students
    await DataManager.setData(DataManager.KEYS.STUDENTS, validStudents);
    await loadStudents();
    showMessage(`${validStudents.length} aluno(s) importado(s) com sucesso!`, 'success');
}

// Import students from CSV
async function importStudentsCSV(csvString) {
    const lines = csvString.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
        alert('Arquivo CSV vazio ou inválido.');
        return;
    }
    
    // Parse CSV (simple parsing, assumes no commas in quoted fields)
    const students = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Simple CSV parsing (handles quoted fields)
        const matches = line.match(/(?:"([^"]*)"|([^,]+))(?:,|$)/g);
        if (!matches || matches.length < 3) continue;
        
        const fields = matches.map(m => m.replace(/^"(.*)",$/, '$1').replace(/,$/, '').trim());
        
        const id = parseInt(fields[0]) || null;
        const name = fields[1];
        const phone = fields[2];
        const currentModule = parseInt(fields[3]) || 1;
        const enrollmentDate = fields[4] || new Date().toISOString();
        const status = fields[5] || 'active';
        
        if (name && phone) {
            students.push({
                id,
                name,
                phone,
                currentModule,
                enrollmentDate,
                status
            });
        }
    }
    
    if (students.length === 0) {
        alert('Nenhum aluno válido encontrado no arquivo CSV.');
        return;
    }
    
    const confirmImport = confirm(
        `Deseja importar ${students.length} aluno(s)?\n\n` +
        `ATENÇÃO: Isto irá SUBSTITUIR todos os alunos cadastrados atualmente.\n` +
        `Recomendamos fazer um backup antes de continuar.`
    );
    
    if (!confirmImport) return;
    
    // Reassign IDs if needed
    const currentStudents = await DataManager.getStudents();
    const maxId = currentStudents.length > 0 ? Math.max(...currentStudents.map(s => s.id)) : 0;
    let nextId = maxId + 1;
    
    students.forEach(student => {
        if (!student.id) {
            student.id = nextId++;
        }
    });
    
    // Replace students
    await DataManager.setData(DataManager.KEYS.STUDENTS, students);
    await loadStudents();
    showMessage(`${students.length} aluno(s) importado(s) com sucesso!`, 'success');
}

// Export students to JSON
function exportStudentsJSON() {
    const students = DataManager.getStudents();
    
    if (students.length === 0) {
        alert('Nenhum aluno cadastrado para exportar.');
        return;
    }
    
    const data = {
        students: students,
        exportedAt: new Date().toISOString(),
        totalStudents: students.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `alunos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage(`${students.length} aluno(s) exportado(s) em JSON!`, 'success');
}

// Export students to CSV
function exportStudentsCSV() {
    const students = DataManager.getStudents();
    
    if (students.length === 0) {
        alert('Nenhum aluno cadastrado para exportar.');
        return;
    }
    
    // Create CSV header
    let csv = 'ID,Nome,Telefone,Módulo Atual,Data de Cadastro,Status\n';
    
    // Add student rows
    students.forEach(student => {
        const enrollmentDate = formatDate(student.enrollmentDate);
        csv += `${student.id},"${student.name}","${student.phone}",${student.currentModule},"${enrollmentDate}","${student.status || 'active'}"\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `alunos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage(`${students.length} aluno(s) exportado(s) em CSV!`, 'success');
}

// Export students to PDF
function exportStudentsPDF() {
    const students = DataManager.getStudents();
    
    if (students.length === 0) {
        alert('Nenhum aluno cadastrado para exportar.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Calculate students per module
    const module1Count = students.filter(s => s.currentModule === 1).length;
    const module2Count = students.filter(s => s.currentModule === 2).length;
    const module3Count = students.filter(s => s.currentModule === 3).length;
    const module4Count = students.filter(s => s.currentModule === 4).length;
    
    // Title
    doc.setFontSize(18);
    doc.text('Lista de Alunos Cadastrados', 14, 20);
    
    // Date and totals
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`Total de alunos: ${students.length}`, 14, 36);
    
    // Module breakdown
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Módulo 1: ${module1Count} aluno(s)`, 14, 43);
    doc.text(`Módulo 2: ${module2Count} aluno(s)`, 60, 43);
    doc.text(`Módulo 3: ${module3Count} aluno(s)`, 106, 43);
    doc.text(`Módulo 4: ${module4Count} aluno(s)`, 152, 43);
    
    // Table data
    const tableData = students.map(student => [
        student.id,
        student.name,
        student.phone,
        `Módulo ${student.currentModule}`,
        formatDate(student.enrollmentDate)
    ]);
    
    // Generate table
    doc.autoTable({
        startY: 50,
        head: [['ID', 'Nome', 'Telefone', 'Módulo', 'Data Cadastro']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 60 },
            2: { cellWidth: 35 },
            3: { cellWidth: 30 },
            4: { cellWidth: 35 }
        }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text('Sistema de Presença - Aulas Musicais', doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
    // Save
    doc.save(`alunos-${new Date().toISOString().split('T')[0]}.pdf`);
    showMessage(`${students.length} aluno(s) exportado(s) em PDF!`, 'success');
}

// Export functions to window for HTML onclick handlers
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.closeEditModal = closeEditModal;
window.handleImportFile = handleImportFile;
window.exportStudentsJSON = exportStudentsJSON;
window.exportStudentsCSV = exportStudentsCSV;
window.exportStudentsPDF = exportStudentsPDF;
