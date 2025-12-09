/**
 * Modules Management
 * Handles module and phase configuration
 */

import DataManager from './data.js';

// Initialize modules page
export async function initModulesPage() {
    console.log('Initializing modules page...');
    await loadModules();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('phaseEditForm').addEventListener('submit', handlePhaseEdit);
}

// Load and display modules
async function loadModules() {
    const modules = await DataManager.getModules();
    
    modules.forEach(module => {
        const container = document.getElementById(`module${module.number}Phases`);
        
        container.innerHTML = module.phases.map(phase => {
            const startDate = phase.startDate ? formatDate(phase.startDate) : 'Não definida';
            const endDate = phase.endDate ? formatDate(phase.endDate) : 'Não definida';
            
            return `
                <div class="phase-item">
                    <div class="phase-header">
                        <h4>${phase.name}</h4>
                        <button class="btn-icon" onclick="editPhase(${module.number}, ${phase.number})" title="Editar">
                            ✏️
                        </button>
                    </div>
                    <div class="phase-details">
                        <p><strong>Início:</strong> ${startDate}</p>
                        <p><strong>Término:</strong> ${endDate}</p>
                        <p><strong>Sábados esperados:</strong> ${phase.expectedClasses}</p>
                    </div>
                </div>
            `;
        }).join('');
    });
}

// Edit phase
async function editPhase(moduleNumber, phaseNumber) {
    const phase = await DataManager.getPhase(moduleNumber, phaseNumber);
    
    if (!phase) return;
    
    document.getElementById('phaseModalTitle').textContent = `Editar ${phase.name} - Módulo ${moduleNumber}`;
    document.getElementById('editPhaseModule').value = moduleNumber;
    document.getElementById('editPhaseNumber').value = phaseNumber;
    document.getElementById('phaseName').value = phase.name;
    document.getElementById('phaseStartDate').value = phase.startDate || '';
    document.getElementById('phaseEndDate').value = phase.endDate || '';
    document.getElementById('phaseExpectedClasses').value = phase.expectedClasses;
    
    document.getElementById('phaseEditModal').style.display = 'flex';
}

// Handle phase edit
async function handlePhaseEdit(e) {
    e.preventDefault();
    
    const moduleNumber = parseInt(document.getElementById('editPhaseModule').value);
    const phaseNumber = parseInt(document.getElementById('editPhaseNumber').value);
    const name = document.getElementById('phaseName').value;
    const startDate = document.getElementById('phaseStartDate').value;
    const endDate = document.getElementById('phaseEndDate').value;
    const expectedClasses = parseInt(document.getElementById('phaseExpectedClasses').value);
    
    await DataManager.updatePhase(moduleNumber, phaseNumber, {
        name,
        startDate,
        endDate,
        expectedClasses
    });
    
    closePhaseEdit();
    await loadModules();
    showMessage('Fase atualizada com sucesso!', 'success');
}

// Close phase edit modal
function closePhaseEdit() {
    document.getElementById('phaseEditModal').style.display = 'none';
    document.getElementById('phaseEditForm').reset();
}

// Toggle module edit
function toggleModuleEdit(moduleNumber) {
    showMessage('Use os botões de editar em cada fase para configurá-las.', 'info');
}

// Initialize default modules
async function initializeDefaultModules() {
    const confirm = window.confirm(
        'Isto irá criar/resetar a estrutura padrão de 4 módulos com 4 fases cada. Deseja continuar?'
    );
    
    if (!confirm) return;
    
    await DataManager.initializeDefaultModules();
    await loadModules();
    showMessage('Estrutura padrão inicializada!', 'success');
}

// Reset all modules
async function resetModules() {
    const confirm = window.confirm(
        'ATENÇÃO: Isto irá resetar TODOS os módulos e fases, mas não afetará os dados de alunos e presença. Deseja continuar?'
    );
    
    if (!confirm) return;
    
    await DataManager.initializeDefaultModules();
    await loadModules();
    showMessage('Módulos resetados!', 'info');
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
    const modal = document.getElementById('phaseEditModal');
    if (event.target === modal) {
        closePhaseEdit();
    }
};

// Export functions to window for onclick handlers
if (typeof window !== 'undefined') {
    window.editPhase = editPhase;
    window.closePhaseEdit = closePhaseEdit;
    window.initializeDefaultModules = initializeDefaultModules;
    window.resetModules = resetModules;
}
