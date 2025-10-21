// app.js - Arquivo principal da aplicação

import { authManager } from './auth.js';
import { diaryManager } from './diary.js';

class DiaryApp {
    constructor() {
        this.init();
    }

    async init() {
        console.log('Inicializando Diário Online...');
        
        try {
            // Tornar managers disponíveis globalmente
            window.authManager = authManager;
            window.diaryManager = diaryManager;
            
            // Configurar handlers globais
            this.setupGlobalHandlers();
            
            console.log('Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
            this.showError('Erro ao inicializar aplicação. Recarregue a página.');
        }
    }

    // Configurar handlers globais
    setupGlobalHandlers() {
        // Handler para erros não capturados
        window.addEventListener('error', (event) => {
            console.error('Erro não capturado:', event.error);
            this.showError('Ocorreu um erro inesperado. Recarregue a página se o problema persistir.');
        });

        // Handler para promessas rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rejeitada:', event.reason);
            this.showError('Erro de conexão. Verifique sua internet e tente novamente.');
        });

        // Handler para estado offline/online
        window.addEventListener('online', () => {
            this.showSuccess('Conexão restaurada!');
        });

        window.addEventListener('offline', () => {
            this.showWarning('Você está offline. Algumas funcionalidades podem não funcionar.');
        });

        // Cleanup ao fechar a página
        window.addEventListener('beforeunload', () => {
            if (diaryManager) {
                diaryManager.cleanup();
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    // Gerenciar atalhos de teclado
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter para salvar entrada
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const entryForm = document.getElementById('entry-form');
            const titleInput = document.getElementById('entry-title');
            const contentInput = document.getElementById('entry-content');
            
            // Se estiver focado no formulário, salvar
            if (document.activeElement === titleInput || document.activeElement === contentInput) {
                event.preventDefault();
                entryForm.dispatchEvent(new Event('submit'));
            }
        }

        // Escape para cancelar edição
        if (event.key === 'Escape') {
            if (diaryManager && diaryManager.editingEntryId) {
                diaryManager.cancelEdit();
            }
        }

        // Ctrl/Cmd + F para focar na pesquisa
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            const searchInput = document.getElementById('search-entries');
            if (searchInput && authManager.isLoggedIn()) {
                event.preventDefault();
                searchInput.focus();
            }
        }
    }

    // Utility methods para mostrar mensagens
    showError(message) {
        this.showAlert(message, 'danger');
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showWarning(message) {
        this.showAlert(message, 'warning');
    }

    showInfo(message) {
        this.showAlert(message, 'info');
    }

    showAlert(message, type) {
        // Remover alertas anteriores
        const existingAlerts = document.querySelectorAll('.alert-temporary');
        existingAlerts.forEach(alert => alert.remove());

        // Criar novo alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-temporary`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        
        const icon = this.getAlertIcon(type);
        
        alertDiv.innerHTML = `
            <i class="${icon} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (alertDiv && alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    getAlertIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            danger: 'fas fa-exclamation-triangle',
            warning: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-info-circle';
    }

    // Método para debug - remover em produção
    debug() {
        console.log('=== DEBUG INFO ===');
        console.log('Auth Manager:', authManager);
        console.log('Diary Manager:', diaryManager);
        console.log('Current User:', authManager.getCurrentUser());
        console.log('Entries:', diaryManager.entries);
        console.log('=================');
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.diaryApp = new DiaryApp();
});

// Tornar debug disponível globalmente (remover em produção)
window.debugDiary = () => {
    if (window.diaryApp) {
        window.diaryApp.debug();
    }
};