// Classe para gerenciar os gastos
class ExpenseManager {
    constructor() {
        this.expenses = this.loadExpenses();
        this.editingId = null;
        this.initializeEventListeners();
        this.applyFilters();
        this.updateSummary();
    }

    // Carrega gastos do localStorage
    loadExpenses() {
        const stored = localStorage.getItem('expenses');
        if (!stored) return [];
        
        try {
            const expenses = JSON.parse(stored);
            // Migra dados antigos que não têm dueDate ou isPaid
            return expenses.map(expense => ({
                ...expense,
                dueDate: expense.dueDate || new Date().toISOString().split('T')[0],
                isPaid: expense.isPaid !== undefined ? expense.isPaid : false
            }));
        } catch (error) {
            console.error('Erro ao carregar gastos do localStorage:', error);
            // Limpa dados corrompidos
            localStorage.removeItem('expenses');
            return [];
        }
    }

    // Salva gastos no localStorage
    saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    // Adiciona event listeners
    initializeEventListeners() {
        const form = document.getElementById('expense-form');
        const clearAllBtn = document.getElementById('clear-all-btn');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const filterStatus = document.getElementById('filter-status');
        const cancelBtn = document.getElementById('cancel-btn');

        if (form) form.addEventListener('submit', (e) => this.handleSubmit(e));
        if (clearAllBtn) clearAllBtn.addEventListener('click', () => this.clearAll());
        if (searchInput) searchInput.addEventListener('input', (e) => this.applyFilters());
        if (sortSelect) sortSelect.addEventListener('change', (e) => this.applyFilters());
        if (filterStatus) filterStatus.addEventListener('change', (e) => this.applyFilters());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancelEdit());

        // Modal de confirmação
        this.setupModal();
    }

    // Configura modal de confirmação
    setupModal() {
        const modal = document.getElementById('confirm-modal');
        const confirmBtn = document.getElementById('confirm-delete');
        const cancelBtn = document.getElementById('cancel-delete');

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.deleteId) {
                    this.deleteExpense(this.deleteId);
                    this.hideModal();
                }
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        if (modal) {
            // Fechar modal clicando fora
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
        const description = formData.get('description').trim();
        const value = parseFloat(formData.get('value')) || 0;
        const dueDate = formData.get('dueDate');
        let isPaid = false;
        if (formData.has('isPaid')) {
            isPaid = formData.get('isPaid') === 'on';
        }

        if (!description) {
            alert('Por favor, insira uma descrição válida.');
            return;
        }

        if (!dueDate) {
            alert('Por favor, insira uma data de vencimento.');
            return;
        }

        if (this.editingId) {
            this.updateExpense(this.editingId, description, value, dueDate, isPaid);
        } else {
            this.addExpense(description, value, dueDate, isPaid);
        }

        this.resetForm();
        this.applyFilters();
        this.updateSummary();

        // Se estiver na página de inserção, redireciona para a listagem
        if (window.location.pathname.includes('inserir.html')) {
            window.location.href = 'index.html';
        }
    }

    // Adiciona novo gasto
    addExpense(description, value, dueDate, isPaid) {
        const expense = {
            id: Date.now().toString(),
            description: description,
            value: value,
            dueDate: dueDate,
            isPaid: isPaid,
            createdAt: new Date().toISOString()
        };

        this.expenses.unshift(expense);
        this.saveExpenses();
        
        // Animação de sucesso
        this.showSuccessMessage('Gasto adicionado com sucesso!');
    }

    // Atualiza gasto existente
    updateExpense(id, description, value, dueDate, isPaid) {
        const index = this.expenses.findIndex(expense => expense.id === id);
        if (index !== -1) {
            this.expenses[index] = {
                ...this.expenses[index],
                description: description,
                value: value,
                dueDate: dueDate,
                isPaid: isPaid,
                updatedAt: new Date().toISOString()
            };
            this.saveExpenses();
            this.showSuccessMessage('Gasto atualizado com sucesso!');
        }
    }

    // Remove gasto
    deleteExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        this.saveExpenses();
        this.applyFilters();
        this.updateSummary();
        this.showSuccessMessage('Gasto removido com sucesso!');
    }

    // Inicia edição de um gasto
    editExpense(id) {
        const expense = this.expenses.find(expense => expense.id === id);
        if (expense) {
            // Se não há formulário na página (listagem), salva dados para edição e redireciona
            if (!document.getElementById('expense-form')) {
                localStorage.setItem('editingExpense', JSON.stringify(expense));
                window.location.href = 'inserir.html?edit=' + id;
                return;
            }
            
            // Se há formulário (página de inserção), preenche os campos
            this.editingId = id;
            
            // Preenche o formulário
            const descField = document.getElementById('description');
            const valueField = document.getElementById('value');
            const dueDateField = document.getElementById('dueDate');
            const isPaidField = document.getElementById('isPaid');
            
            if (descField) descField.value = expense.description;
            if (valueField) valueField.value = expense.value;
            if (dueDateField) dueDateField.value = expense.dueDate;
            if (isPaidField) isPaidField.checked = expense.isPaid;
            
            // Atualiza UI
            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) submitBtn.textContent = 'Atualizar Gasto';
            const cancelBtn = document.getElementById('cancel-btn');
            if (cancelBtn) cancelBtn.style.display = 'inline-block';
            
            // Destaca o item sendo editado
            document.querySelectorAll('.expense-item').forEach(item => {
                item.classList.remove('editing');
            });
            const itemToEdit = document.querySelector(`[data-id="${id}"]`);
            if (itemToEdit) itemToEdit.classList.add('editing');
            
            // Scroll para o formulário
            const formSection = document.querySelector('.form-section');
            if (formSection) formSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Cancela edição
    cancelEdit() {
        this.editingId = null;
        this.resetForm();
        
        // Remove destaque de edição
        document.querySelectorAll('.expense-item').forEach(item => {
            item.classList.remove('editing');
        });
    }

    // Reseta formulário
    resetForm() {
        const form = document.getElementById('expense-form');
        if (form) form.reset();
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) submitBtn.textContent = 'Adicionar Gasto';
        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) cancelBtn.style.display = 'none';
        this.editingId = null;
    }    // Renderiza lista de gastos
    renderExpenses(expensesToRender = null) {
        const expensesList = document.getElementById('expenses-list');
        const expenses = expensesToRender || this.expenses;

        if (!expensesList) return;

        if (expenses.length === 0) {
            expensesList.innerHTML = '<p class="no-expenses">Nenhum gasto cadastrado ainda.</p>';
            return;
        }

        // Atualiza contador
        const countElement = document.getElementById('expenses-count');
        if (countElement) {
            countElement.textContent = `${expenses.length} ${expenses.length === 1 ? 'item' : 'itens'}`;
        }

        expensesList.innerHTML = expenses.map(expense => {
            const status = this.getExpenseStatus(expense);
            const dueDateClass = this.getDueDateClass(expense);
            return `
            <div class="expense-item ${expense.isPaid ? 'paid' : ''} ${status === 'overdue' ? 'overdue' : ''}" data-id="${expense.id}">
                <div class="expense-checkbox">
                    <label class="checkbox-container">
                        <input type="checkbox" ${expense.isPaid ? 'checked' : ''} onchange="expenseManager.togglePayment('${expense.id}')">
                        <span class="checkmark-list"></span>
                    </label>
                </div>
                <div class="expense-info">
                    <div class="expense-main-info">
                        <div class="expense-description ${expense.isPaid ? 'paid-text' : ''}" title="${this.escapeHtml(expense.description)}">${this.escapeHtml(expense.description)}</div>
                        <div class="expense-meta">
                            <span class="expense-due-date ${dueDateClass} ${expense.isPaid ? 'paid-text' : ''}">
                                📅 ${this.formatDateOnly(expense.dueDate)}
                            </span>
                            <div class="expense-status ${status}">${this.getStatusText(status)}</div>
                        </div>
                    </div>
                    <div class="expense-value ${expense.value === 0 ? 'zero' : ''} ${expense.isPaid ? 'paid-text' : ''}">${this.formatCurrency(expense.value)}</div>
                </div>
                <div class="expense-actions">
                    <button class="btn-edit" onclick="expenseManager.editExpense('${expense.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-delete" onclick="expenseManager.confirmDelete('${expense.id}')" title="Excluir">
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
        document.getElementById('confirm-modal').style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Esconde modal
    hideModal() {
        document.getElementById('confirm-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.deleteId = null;
    }

    // Aplica filtros e ordenação
    applyFilters() {
        const filterStatus = document.getElementById('filter-status');
        const statusFilter = filterStatus ? filterStatus.value : 'all';

        let filteredExpenses = this.expenses.filter(expense => {
            const matchesStatus = this.matchesStatusFilter(expense, statusFilter);
            return matchesStatus;
        });

        // Ordenação automática: por data de vencimento (mais próximo primeiro)
        filteredExpenses.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        this.renderExpenses(filteredExpenses);
    }

    // Verifica se o gasto corresponde ao filtro de status
    matchesStatusFilter(expense, statusFilter) {
        if (statusFilter === 'all') return true;
        
        const status = this.getExpenseStatus(expense);
        return status === statusFilter;
    }

    // Limpa todos os gastos
    clearAll() {
        if (this.expenses.length === 0) {
            alert('Não há gastos para remover.');
            return;
        }

        if (confirm('Tem certeza que deseja remover TODOS os gastos? Esta ação não pode ser desfeita.')) {
            this.expenses = [];
            this.saveExpenses();
            this.applyFilters();
            this.updateSummary();
            this.showSuccessMessage('Todos os gastos foram removidos!');
        }
    }

    // Alterna o status de pagamento
    togglePayment(id) {
        const expense = this.expenses.find(expense => expense.id === id);
        if (expense) {
            expense.isPaid = !expense.isPaid;
            expense.updatedAt = new Date().toISOString();
            this.saveExpenses();
            this.applyFilters();
            this.updateSummary();
            
            const message = expense.isPaid ? 'Gasto marcado como pago!' : 'Gasto marcado como pendente!';
            this.showSuccessMessage(message);
        }
    }

    // Determina o status do gasto
    getExpenseStatus(expense) {
        if (expense.isPaid) return 'paid';
        
        if (!expense.dueDate) return 'pending';
        
        const today = new Date();
        const dueDate = new Date(expense.dueDate);
        
        if (isNaN(dueDate.getTime())) return 'pending';
        
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) return 'overdue';
        return 'pending';
    }

    // Determina a classe CSS para a data de vencimento
    getDueDateClass(expense) {
        if (expense.isPaid) return '';
        
        if (!expense.dueDate) return '';
        
        const today = new Date();
        const dueDate = new Date(expense.dueDate);
        
        if (isNaN(dueDate.getTime())) return '';
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'overdue';
        if (diffDays <= 3) return 'due-soon';
        return '';
    }

    // Texto do status
    getStatusText(status) {
        const statusTexts = {
            paid: '✅ Pago',
            pending: '⏳ Pendente',
            overdue: '🔴 Vencido'
        };
        return statusTexts[status] || 'Pendente';
    }

    // Atualiza resumo
    updateSummary() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.value, 0);
        const totalPaid = this.expenses.filter(expense => expense.isPaid).reduce((sum, expense) => sum + expense.value, 0);
        const totalPending = total - totalPaid;
        const count = this.expenses.length;

    const totalAmountEl = document.getElementById('total-amount');
    if (totalAmountEl) totalAmountEl.textContent = this.formatCurrency(total);
    const totalPaidEl = document.getElementById('total-paid');
    if (totalPaidEl) totalPaidEl.textContent = this.formatCurrency(totalPaid);
    const totalPendingEl = document.getElementById('total-pending');
    if (totalPendingEl) totalPendingEl.textContent = this.formatCurrency(totalPending);
    const totalItemsEl = document.getElementById('total-items');
    if (totalItemsEl) totalItemsEl.textContent = count;
    }

    // Formata moeda
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Formata data
    formatDate(dateString) {
        if (!dateString) return 'Data não definida';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Data inválida';
        
        return new Intl.DateTimeFormat('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Formata apenas a data (sem hora)
        formatDateOnly(dateString) {
            if (!dateString) return 'Data não definida';
            // Se for formato YYYY-MM-DD, exibe como DD/MM/YYYY sem converter para Date
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                const [year, month, day] = dateString.split('-');
                return `${day}/${month}/${year}`;
            }
            // Fallback para datas com hora
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
        // Cria elemento de notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove após 4 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Adiciona gastos de exemplo (para demonstração)
    addSampleData() {
        const today = new Date();
        const sampleExpenses = [
            { description: 'Cartão NuBank', value: 2437.63, dueDate: this.addDaysToDate(today, 5), isPaid: false },
            { description: 'Cartão Itaú', value: 1859.80, dueDate: this.addDaysToDate(today, 8), isPaid: true },
            { description: 'Cartão BB', value: 0, dueDate: this.addDaysToDate(today, 15), isPaid: false },
            { description: 'Internet(17)', value: 77.73, dueDate: this.addDaysToDate(today, -2), isPaid: false },
            { description: 'IPVA (22)', value: 0, dueDate: this.addDaysToDate(today, 30), isPaid: false },
            { description: 'Casa', value: 4000, dueDate: this.addDaysToDate(today, 1), isPaid: false },
            { description: 'Consórcio', value: 533.67, dueDate: this.addDaysToDate(today, 12), isPaid: true },
            { description: 'Água', value: 227.21, dueDate: this.addDaysToDate(today, 7), isPaid: false },
            { description: 'Luz - De', value: 191.66, dueDate: this.addDaysToDate(today, -5), isPaid: false },
            { description: 'Armazenamento', value: 0, dueDate: this.addDaysToDate(today, 20), isPaid: true },
            { description: 'Strava', value: 0, dueDate: this.addDaysToDate(today, 25), isPaid: false },
            { description: 'Smartnutri', value: 0, dueDate: this.addDaysToDate(today, 18), isPaid: false },
            { description: 'Celular', value: 59, dueDate: this.addDaysToDate(today, 3), isPaid: false },
            { description: 'Carro', value: 1759.47, dueDate: this.addDaysToDate(today, 10), isPaid: true }
        ];

        sampleExpenses.forEach(expense => {
            this.addExpense(expense.description, expense.value, expense.dueDate, expense.isPaid);
        });

        this.applyFilters();
        this.updateSummary();
    }

    // Adiciona dias a uma data
    addDaysToDate(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    }
}

// CSS já incluído no arquivo styles.css

// Inicializa o sistema quando a página carrega
let expenseManager;

document.addEventListener('DOMContentLoaded', () => {
    expenseManager = new ExpenseManager();
    
    // Verifica se há dados de edição na página de inserção
    const editingData = localStorage.getItem('editingExpense');
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editingData && editId && document.getElementById('expense-form')) {
        const expense = JSON.parse(editingData);
        expenseManager.editingId = editId;
        
        // Preenche formulário com dados para edição
        document.getElementById('description').value = expense.description;
        document.getElementById('value').value = expense.value;
        document.getElementById('dueDate').value = expense.dueDate;
        
        // Atualiza botões
        document.getElementById('submit-btn').textContent = 'Atualizar Gasto';
        document.getElementById('cancel-btn').style.display = 'inline-block';
        
        // Remove dados temporários
        localStorage.removeItem('editingExpense');
    }
    
    // Adiciona dados de exemplo se não houver gastos salvos
    if (expenseManager.expenses.length === 0) {
        // Mostra opção para adicionar dados de exemplo
        const addSampleBtn = document.createElement('button');
        addSampleBtn.textContent = '📝 Adicionar Dados de Exemplo';
        addSampleBtn.style.cssText = `
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            margin: 20px auto;
            display: block;
            transition: all 0.3s ease;
        `;
        
        addSampleBtn.addEventListener('click', () => {
            expenseManager.addSampleData();
            addSampleBtn.remove();
        });

        document.querySelector('.expenses-section').insertBefore(
            addSampleBtn, 
            document.getElementById('expenses-list')
        );
    }
});

// Adiciona atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para cancelar edição ou fechar modal
    if (e.key === 'Escape') {
        if (document.getElementById('confirm-modal').style.display === 'block') {
            expenseManager.hideModal();
        } else if (expenseManager.editingId) {
            expenseManager.cancelEdit();
        }
    }
    
    // Ctrl+N para novo gasto
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        document.getElementById('description').focus();
    }
});