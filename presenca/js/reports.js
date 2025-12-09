/**
 * Reports Module
 * Handles reports generation and display
 */

// Load reports on page load
document.addEventListener('DOMContentLoaded', () => {
    setDefaultDates();
    loadReports();
});

// Set default date range (current year)
function setDefaultDates() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
    document.getElementById('reportPeriodStart').value = startOfYear.toISOString().split('T')[0];
    document.getElementById('reportPeriodEnd').value = endOfYear.toISOString().split('T')[0];
}

// Load all reports
function loadReports() {
    loadAlerts();
    loadOverview();
    loadModuleStats();
    loadStudentReports();
}

// Load and display alerts
function loadAlerts() {
    const alerts = Calculator.getAllAlerts();
    
    // Critical alerts
    const criticalList = document.getElementById('criticalAlertsList');
    if (alerts.critical.length > 0) {
        criticalList.innerHTML = alerts.critical.map(item => `
            <div class="alert-item critical">
                <strong>${escapeHtml(item.student.name)}</strong>
                <span class="alert-details">
                    ${item.stats.absencePercentage}% de faltas 
                    (${item.stats.absent}/${item.stats.total} aulas)
                    - Módulo ${item.moduleNumber}
                </span>
                <span class="alert-action">Deve repetir o módulo</span>
            </div>
        `).join('');
    } else {
        criticalList.innerHTML = '<p class="no-alerts">Nenhum alerta crítico no momento.</p>';
    }
    
    // Warning alerts
    const warningList = document.getElementById('warningAlertsList');
    if (alerts.warning.length > 0) {
        warningList.innerHTML = alerts.warning.map(item => {
            const remaining = Math.ceil((40 - item.stats.absencePercentage) / 100 * item.stats.total);
            return `
                <div class="alert-item warning">
                    <strong>${escapeHtml(item.student.name)}</strong>
                    <span class="alert-details">
                        ${item.stats.absencePercentage}% de faltas 
                        (${item.stats.absent}/${item.stats.total} aulas)
                        - Módulo ${item.moduleNumber}
                    </span>
                    <span class="alert-action">${remaining} faltas até crítico</span>
                </div>
            `;
        }).join('');
    } else {
        warningList.innerHTML = '<p class="no-alerts">Nenhum aviso no momento.</p>';
    }
    
    // Success (regular) students
    const successList = document.getElementById('successAlertsList');
    if (alerts.ok.length > 0) {
        successList.innerHTML = `
            <p class="success-summary">
                ${alerts.ok.length} aluno(s) em situação regular (menos de 25% de faltas)
            </p>
        `;
    } else {
        successList.innerHTML = '<p class="no-alerts">Nenhum aluno em situação regular.</p>';
    }
}

// Load overview statistics
function loadOverview() {
    const students = DataManager.getStudents();
    const attendance = DataManager.getAttendance();
    const alerts = Calculator.getAllAlerts();
    
    // Get unique dates
    const uniqueDates = [...new Set(attendance.map(a => a.date))];
    
    // Calculate average attendance
    let totalAttendancePercentage = 0;
    students.forEach(student => {
        const stats = Calculator.calculateOverallAttendance(student.id);
        totalAttendancePercentage += stats.attendancePercentage;
    });
    const avgAttendance = students.length > 0 
        ? Math.round(totalAttendancePercentage / students.length) 
        : 0;
    
    // Update overview cards
    document.getElementById('overviewTotalStudents').textContent = students.length;
    document.getElementById('overviewTotalClasses').textContent = uniqueDates.length;
    document.getElementById('overviewAvgAttendance').textContent = `${avgAttendance}%`;
    document.getElementById('overviewCriticalCount').textContent = alerts.critical.length;
}

// Load module statistics
function loadModuleStats() {
    const moduleStats = Calculator.getModuleStatistics();
    const container = document.getElementById('moduleStatsContainer');
    
    container.innerHTML = moduleStats.map(stat => {
        const progressWidth = stat.avgAttendance;
        const hasAlerts = stat.criticalCount > 0 || stat.warningCount > 0;
        
        return `
            <div class="module-stat-card">
                <div class="module-stat-header">
                    <h3>${stat.module.name}</h3>
                    <span class="student-count">${stat.studentCount} aluno(s)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    <span class="progress-label">${stat.avgAttendance}% média de presença</span>
                </div>
                ${hasAlerts ? `
                    <div class="module-alerts">
                        ${stat.criticalCount > 0 ? `
                            <span class="badge badge-critical">🚨 ${stat.criticalCount} crítico(s)</span>
                        ` : ''}
                        ${stat.warningCount > 0 ? `
                            <span class="badge badge-warning">⚠️ ${stat.warningCount} aviso(s)</span>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Load student reports
function loadStudentReports() {
    const students = DataManager.getStudents();
    const container = document.getElementById('studentReportsContainer');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum aluno cadastrado.</p>';
        return;
    }
    
    container.innerHTML = students.map(student => {
        const overallStats = Calculator.calculateOverallAttendance(student.id);
        const currentModuleStats = Calculator.calculateModuleAttendance(student.id, student.currentModule);
        const alertStatus = Calculator.getAlertStatus(student.id, student.currentModule);
        
        return `
            <div class="student-report-card ${alertStatus.level.toLowerCase()}" data-student-name="${student.name.toLowerCase()}">
                <div class="student-report-header">
                    <div class="student-info">
                        ${alertStatus.icon}
                        <h3>${escapeHtml(student.name)}</h3>
                        <span class="student-module">Módulo ${student.currentModule}</span>
                    </div>
                    <button class="btn btn-small btn-secondary" onclick="showStudentDetail(${student.id})">
                        Ver Detalhes
                    </button>
                </div>
                <div class="student-report-stats">
                    <div class="stat-item">
                        <span class="stat-label">Presença Geral:</span>
                        <span class="stat-value">${overallStats.attendancePercentage}%</span>
                        <span class="stat-detail">(${overallStats.present}/${overallStats.total})</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Módulo Atual:</span>
                        <span class="stat-value">${currentModuleStats.attendancePercentage}%</span>
                        <span class="stat-detail">(${currentModuleStats.present}/${currentModuleStats.total})</span>
                    </div>
                    <div class="stat-item status">
                        <span class="stat-label">Status:</span>
                        <span class="stat-value ${alertStatus.level.toLowerCase()}">${alertStatus.message}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show student detail modal
function showStudentDetail(studentId) {
    const student = DataManager.getStudent(studentId);
    if (!student) return;
    
    const progress = Calculator.getStudentProgress(studentId);
    
    document.getElementById('modalStudentName').textContent = `${student.name} - Histórico Completo`;
    
    const content = document.getElementById('studentDetailContent');
    content.innerHTML = `
        <div class="student-detail-info">
            <p><strong>ID:</strong> #${student.id}</p>
            <p><strong>Telefone:</strong> ${student.phone}</p>
            <p><strong>Cadastro:</strong> ${formatDate(student.enrollmentDate)}</p>
            <p><strong>Módulo Atual:</strong> Módulo ${student.currentModule}</p>
        </div>
        
        <h4>Histórico por Módulo</h4>
        <div class="module-history">
            ${progress.map(module => {
                const statusClass = module.stats.total === 0 ? 'not-started' :
                    module.alert && module.alert.level === 'CRITICAL' ? 'critical' :
                    module.alert && module.alert.level === 'WARNING' ? 'warning' : 'ok';
                
                return `
                    <div class="module-history-item ${statusClass}">
                        <div class="module-history-header">
                            <h5>Módulo ${module.moduleNumber}</h5>
                            ${module.stats.total > 0 ? `
                                <span class="module-status">${module.stats.attendancePercentage}% presença</span>
                            ` : `
                                <span class="module-status not-started">Não iniciado</span>
                            `}
                        </div>
                        
                        ${module.stats.total > 0 ? `
                            <div class="phase-breakdown">
                                <h6>Por Fase:</h6>
                                <div class="phases-grid">
                                    ${module.phases.map(phase => `
                                        <div class="phase-item">
                                            <span class="phase-label">Fase ${phase.phaseNumber}:</span>
                                            ${phase.total > 0 ? `
                                                <span class="phase-value ${phase.attendancePercentage >= 75 ? 'good' : phase.attendancePercentage >= 50 ? 'warning' : 'poor'}">
                                                    ${phase.attendancePercentage}% (${phase.present}/${phase.total})
                                                </span>
                                            ` : `
                                                <span class="phase-value empty">-</span>
                                            `}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${module.alert ? `
                                <div class="module-alert ${module.alert.level.toLowerCase()}">
                                    ${module.alert.icon} ${module.alert.message}
                                </div>
                            ` : ''}
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('studentDetailModal').style.display = 'flex';
}

// Close student detail modal
function closeStudentDetail() {
    document.getElementById('studentDetailModal').style.display = 'none';
}

// Filter student reports
function filterStudentReports() {
    const searchTerm = document.getElementById('searchReport').value.toLowerCase();
    const cards = document.querySelectorAll('.student-report-card');
    
    cards.forEach(card => {
        const studentName = card.getAttribute('data-student-name');
        card.style.display = studentName.includes(searchTerm) ? '' : 'none';
    });
}

// Export to JSON
function exportToJSON() {
    const data = DataManager.exportAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `presenca-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage('Dados exportados com sucesso!', 'success');
}

// Export to CSV
function exportToCSV() {
    const students = DataManager.getStudents();
    const attendance = DataManager.getAttendance();
    
    // Create CSV header
    let csv = 'ID,Nome,Telefone,Módulo Atual,Presença Geral,Faltas Geral,Taxa de Presença\n';
    
    // Add student rows
    students.forEach(student => {
        const stats = Calculator.calculateOverallAttendance(student.id);
        csv += `${student.id},"${student.name}","${student.phone}",${student.currentModule},${stats.present},${stats.absent},${stats.attendancePercentage}%\n`;
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-presenca-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
    showMessage('Relatório CSV exportado com sucesso!', 'success');
}

// Export reports to PDF
function exportReportsPDF() {
    const students = DataManager.getStudents();
    
    if (students.length === 0) {
        alert('Nenhum dado para exportar.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const alerts = Calculator.getAllAlerts();
    
    // Calculate students per module
    const module1Count = students.filter(s => s.currentModule === 1).length;
    const module2Count = students.filter(s => s.currentModule === 2).length;
    const module3Count = students.filter(s => s.currentModule === 3).length;
    const module4Count = students.filter(s => s.currentModule === 4).length;
    
    // Title
    doc.setFontSize(18);
    doc.text('Relatório de Presença', 14, 20);
    
    // Date and overview
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
    
    let yPosition = 50;
    
    // Alerts Summary
    if (alerts.critical.length > 0 || alerts.warning.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(220, 53, 69);
        doc.text('🚨 ALERTAS', 14, yPosition);
        yPosition += 8;
        
        doc.setFontSize(9);
        if (alerts.critical.length > 0) {
            doc.setTextColor(220, 53, 69);
            doc.text(`Críticos (40%+ faltas): ${alerts.critical.length} aluno(s)`, 14, yPosition);
            yPosition += 5;
        }
        if (alerts.warning.length > 0) {
            doc.setTextColor(255, 152, 0);
            doc.text(`Avisos (25-39% faltas): ${alerts.warning.length} aluno(s)`, 14, yPosition);
            yPosition += 5;
        }
        yPosition += 5;
    }
    
    // Reset color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Detalhes por Aluno', 14, yPosition);
    yPosition += 8;
    
    // Table data
    const tableData = students.map(student => {
        const overallStats = Calculator.calculateOverallAttendance(student.id);
        const currentModuleStats = Calculator.calculateModuleAttendance(student.id, student.currentModule);
        const alertStatus = Calculator.getAlertStatus(student.id, student.currentModule);
        
        let status = 'Regular';
        if (alertStatus.level === 'CRITICAL') status = 'CRÍTICO';
        else if (alertStatus.level === 'WARNING') status = 'AVISO';
        
        return [
            student.id,
            student.name,
            `M${student.currentModule}`,
            `${overallStats.attendancePercentage}%`,
            `${currentModuleStats.attendancePercentage}%`,
            status
        ];
    });
    
    // Generate table
    doc.autoTable({
        startY: yPosition,
        head: [['ID', 'Nome', 'Módulo', 'Presença Geral', 'Presença Módulo', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [102, 126, 234] },
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 12 },
            1: { cellWidth: 60 },
            2: { cellWidth: 20 },
            3: { cellWidth: 30 },
            4: { cellWidth: 32 },
            5: { cellWidth: 25 }
        },
        didParseCell: function(data) {
            if (data.column.index === 5 && data.cell.section === 'body') {
                if (data.cell.raw === 'CRÍTICO') {
                    data.cell.styles.textColor = [220, 53, 69];
                    data.cell.styles.fontStyle = 'bold';
                } else if (data.cell.raw === 'AVISO') {
                    data.cell.styles.textColor = [255, 152, 0];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text('Sistema de Presença - Aulas Musicais', doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    
    // Save
    doc.save(`relatorio-presenca-${new Date().toISOString().split('T')[0]}.pdf`);
    showMessage('Relatório PDF exportado com sucesso!', 'success');
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

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('studentDetailModal');
    if (event.target === modal) {
        closeStudentDetail();
    }
};
