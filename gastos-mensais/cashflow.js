// Classe para gerenciar o fluxo de caixa (entradas e saídas)
class CashFlowManager {
    constructor() {
        this.transactions = this.loadTransactions();
        this.editingId = null;
        this.initializeEventListeners();
        this.applyFilters();
        this.updateSummary();
    }

    // Carrega transações do localStorage
    loadTransactions() {
        const stored = localStorage.getItem('cashflow');
        if (!stored) return [];
        
        try {
            const transactions = JSON.parse(stored);
            return transactions.map(transaction => ({
                ...transaction,
                date: transaction.date || new Date().toISOString().split('T')[0],
                type: transaction.type || 'expense'
            }));
        } catch (error) {
            console.error('Erro ao carregar fluxo de caixa do localStorage:', error);
            localStorage.removeItem('cashflow');
            return [];
        }
    }

    // Salva transações no localStorage
    saveTransactions() {
        localStorage.setItem('cashflow', JSON.stringify(this.transactions));
    }

    // Adiciona event listeners
    initializeEventListeners() {
        const form = document.getElementById('cashflow-form');
        const filterType = document.getElementById('cf-filter-type');
        const cancelBtn = document.getElementById('cf-cancel-btn');

        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (filterType) filterType.addEventListener('change', (e) => this.applyFilters());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelEdit());

        // Modal de confirmação
        this.setupModal();
        
        // Define data atual como padrão
        const dateField = document.getElementById('cf-date');
        if (dateField) {
            dateField.value = new Date().toISOString().split('T')[0];
        }
    }

    // Configura modal de confirmação
    setupModal() {
        const modal = document.getElementById('cf-confirm-modal');
        const confirmBtn = document.getElementById('cf-confirm-delete');
        const cancelBtn = document.getElementById('cf-cancel-delete');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.deleteId) {
                    this.deleteTransaction(this.deleteId);
                    this.hideModal();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
    }

    // Manipula envio do formulário
    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const type = formData.get('type');
        const description = formData.get('description').trim();
        const value = parseFloat(formData.get('value')) || 0;
        const date = formData.get('date');

        if (!type) {
            alert('Por favor, selecione o tipo de movimentação.');
            return;
        }

        if (!description) {
            alert('Por favor, insira uma descrição válida.');
            return;
        }

        if (!date) {
            alert('Por favor, insira uma data.');
            return;
        }

        if (this.editingId) {
            this.updateTransaction(this.editingId, type, description, value, date);
        } else {
            this.addTransaction(type, description, value, date);
        }

        this.resetForm();
        this.applyFilters();
        this.updateSummary();
    }

    // Adiciona nova transação
    addTransaction(type, description, value, date) {
        const transaction = {
            id: Date.now().toString(),
            type: type,
            description: description,
            value: value,
            date: date,
            createdAt: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveTransactions();
        
        this.showSuccessMessage('Movimentação adicionada com sucesso!');
    }

    // Atualiza transação existente
    updateTransaction(id, type, description, value, date) {
        const index = this.transactions.findIndex(transaction => transaction.id === id);
        if (index !== -1) {
            this.transactions[index] = {
                ...this.transactions[index],
                type: type,
                description: description,
                value: value,
                date: date,
                updatedAt: new Date().toISOString()
            };
            this.saveTransactions();
            this.showSuccessMessage('Movimentação atualizada com sucesso!');
        }
    }

    // Remove transação
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveTransactions();
        this.applyFilters();
        this.updateSummary();
        this.showSuccessMessage('Movimentação removida com sucesso!');
    }

    // Inicia edição de uma transação
    editTransaction(id) {
        const transaction = this.transactions.find(transaction => transaction.id === id);
        if (transaction) {
            this.editingId = id;
            
            // Preenche o formulário
            const typeRadio = document.querySelector(`input[name="type"][value="${transaction.type}"]`);
            const descField = document.getElementById('cf-description');
            const valueField = document.getElementById('cf-value');
            const dateField = document.getElementById('cf-date');
            
            if (typeRadio) typeRadio.checked = true;
            if (descField) descField.value = transaction.description;
            if (valueField) valueField.value = transaction.value;
            if (dateField) dateField.value = transaction.date;
            
            // Atualiza UI
            const submitBtn = document.getElementById('cf-submit-btn');
            if (submitBtn) submitBtn.textContent = 'Atualizar Movimentação';
            const cancelBtn = document.getElementById('cf-cancel-btn');
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            // Scroll para o formulário
            const formSection = document.querySelector('.form-section');
            if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Cancela edição
    cancelEdit() {
        this.editingId = null;
        this.resetForm();
    }

    // Reseta formulário
    resetForm() {
        const form = document.getElementById('cashflow-form');
        if (form) form.reset();
        const submitBtn = document.getElementById('cf-submit-btn');
        if (submitBtn) submitBtn.textContent = 'Adicionar Movimentação';
        const cancelBtn = document.getElementById('cf-cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';
        this.editingId = null;
        
        // Define data atual novamente
        const dateField = document.getElementById('cf-date');
        if (dateField) {
            dateField.value = new Date().toISOString().split('T')[0];
        }
    }

    // Renderiza lista de transações
    renderTransactions(transactionsToRender = null) {
        const cashflowList = document.getElementById('cashflow-list');
        const transactions = transactionsToRender || this.transactions;

        if (!cashflowList) return;

        if (transactions.length === 0) {
            cashflowList.innerHTML = '<p class="no-expenses">Nenhuma movimentação cadastrada ainda.</p>';
            return;
        }

        cashflowList.innerHTML = transactions.map(transaction => {
            const isIncome = transaction.type === 'income';
            const typeIcon = isIncome ? '💰' : '💸';
            const typeClass = isIncome ? 'income' : 'expense';
            
            return `
            <div class="expense-item ${typeClass}" data-id="${transaction.id}">
                <div class="expense-info">
                    <div class="expense-main-info">
                        <div class="expense-description" title="${this.escapeHtml(transaction.description)}">
                            ${typeIcon} ${this.escapeHtml(transaction.description)}
                        </div>
                        <div class="expense-meta">
                            <span class="expense-due-date">
                                📅 ${this.formatDateOnly(transaction.date)}
                            </span>
                            <div class="expense-status ${typeClass}">${isIncome ? '💰 Entrada' : '💸 Saída'}</div>
                        </div>
                    </div>
                    <div class="expense-value ${typeClass}">${isIncome ? '+' : '-'}${this.formatCurrency(transaction.value)}</div>
                </div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="cashflowManager.editTransaction('${transaction.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-delete" onclick="cashflowManager.confirmDelete('${transaction.id}')" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
        `}).join('');
    }

    // Confirma exclusão (mostra modal)
    confirmDelete(id) {
        this.deleteId = id;
        this.showModal();
    }

    // Mostra modal
    showModal() {
        const modal = document.getElementById('cf-confirm-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    // Esconde modal
    hideModal() {
        const modal = document.getElementById('cf-confirm-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.deleteId = null;
    }

    // Aplica filtros
    applyFilters() {
        const filterType = document.getElementById('cf-filter-type');
        const typeFilter = filterType ? filterType.value : 'all';

        let filteredTransactions = this.transactions.filter(transaction => {
            if (typeFilter === 'all') return true;
            return transaction.type === typeFilter;
        });

        // Ordenação por data (mais recente primeiro)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.renderTransactions(filteredTransactions);
    }

    // Atualiza resumo
    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.value, 0);
        
        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.value, 0);
        
        const balance = totalIncome - totalExpenses;
        const count = this.transactions.length;

        const totalIncomeEl = document.getElementById('total-income');
        if (totalIncomeEl) totalIncomeEl.textContent = this.formatCurrency(totalIncome);
        
        const totalExpensesEl = document.getElementById('total-expenses');
        if (totalExpensesEl) totalExpensesEl.textContent = this.formatCurrency(totalExpenses);
        
        const totalBalanceEl = document.getElementById('total-balance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = this.formatCurrency(balance);
            totalBalanceEl.style.color = balance >= 0 ? '#10b981' : '#ef4444';
        }
        
        const totalItemsEl = document.getElementById('cf-total-items');
        if (totalItemsEl) totalItemsEl.textContent = count;
    }

    // Formata moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Formata apenas a data (sem hora)
    formatDateOnly(dateString) {
        if (!dateString) return 'Data não definida';
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    // Escapa HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostra mensagem de sucesso
    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Inicializa o sistema quando a página carrega
let cashflowManager;

document.addEventListener('DOMContentLoaded', () => {
    cashflowManager = new CashFlowManager();
});

// Adiciona atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para cancelar edição ou fechar modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('cf-confirm-modal');
        if (modal && modal.style.display === 'block') {
            cashflowManager.hideModal();
        } else if (cashflowManager.editingId) {
            cashflowManager.cancelEdit();
        }
    }
    
    // Ctrl+N para novo item
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const descField = document.getElementById('cf-description');
        if (descField) descField.focus();
    }
});