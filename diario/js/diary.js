// diary.js - Gerenciamento das funcionalidades do diário

import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc,
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { db } from '../config/firebase-config.js';

class DiaryManager {
    constructor() {
        this.entries = [];
        this.editingEntryId = null;
        this.unsubscribe = null;
        this.setupEventListeners();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Formulário de nova entrada
        document.getElementById('entry-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Botão de cancelar edição
        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Barra de pesquisa
        document.getElementById('search-entries').addEventListener('input', (e) => {
            this.searchEntries(e.target.value);
        });
    }

    // Carregar entradas do usuário
    loadEntries() {
        const userId = window.authManager.getCurrentUserId();
        if (!userId) {
            console.log('Usuário não logado');
            return;
        }

        console.log('Carregando entradas para o usuário:', userId);

        // Se já existe um listener, cancelar
        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Criar query para buscar entradas do usuário (sem orderBy para evitar necessidade de índice)
        const entriesRef = collection(db, 'diary_entries');
        const q = query(
            entriesRef, 
            where('userId', '==', userId)
        );

        // Configurar listener em tempo real
        this.unsubscribe = onSnapshot(q, (querySnapshot) => {
            this.entries = [];
            
            querySnapshot.forEach((doc) => {
                this.entries.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Ordenar no lado do cliente (mais recentes primeiro)
            this.entries.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.seconds || 0 : 0;
                const timeB = b.createdAt ? b.createdAt.seconds || 0 : 0;
                return timeB - timeA;
            });

            console.log('Entradas carregadas:', this.entries.length);
            this.renderEntries();
        }, (error) => {
            console.error('Erro ao carregar entradas:', error);
            this.showError('Erro ao carregar entradas do diário.');
        });
    }

    // Salvar nova entrada ou atualizar existente
    async saveEntry() {
        const title = document.getElementById('entry-title').value.trim();
        const content = document.getElementById('entry-content').value.trim();
        const userId = window.authManager.getCurrentUserId();

        console.log('SaveEntry chamado:', { 
            title: title ? 'Preenchido' : 'Vazio', 
            content: content ? 'Preenchido' : 'Vazio',
            editingEntryId: this.editingEntryId 
        });

        if (!title || !content) {
            this.showError('Por favor, preencha o título e o conteúdo.');
            return;
        }

        if (!userId) {
            this.showError('Você precisa estar logado para salvar entradas.');
            return;
        }

        try {
            if (this.editingEntryId) {
                // Atualizar entrada existente
                console.log('Atualizando entrada:', this.editingEntryId);
                await this.updateEntry(this.editingEntryId, title, content);
            } else {
                // Criar nova entrada
                console.log('Criando nova entrada');
                await this.createEntry(userId, title, content);
            }

            // Limpar formulário
            this.clearForm();
            
        } catch (error) {
            console.error('Erro ao salvar entrada:', error);
            this.showError('Erro ao salvar entrada. Tente novamente.');
        }
    }

    // Criar nova entrada
    async createEntry(userId, title, content) {
        const entriesRef = collection(db, 'diary_entries');
        
        const newEntry = {
            userId: userId,
            title: title,
            content: content,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await addDoc(entriesRef, newEntry);
        console.log('Nova entrada criada');
        this.showSuccess('✅ Nova entrada criada com sucesso!');
    }

    // Atualizar entrada existente
    async updateEntry(entryId, title, content) {
        const entryRef = doc(db, 'diary_entries', entryId);
        
        await updateDoc(entryRef, {
            title: title,
            content: content,
            updatedAt: serverTimestamp()
        });

        console.log('Entrada atualizada:', entryId);
        this.showSuccess('✅ Entrada atualizada com sucesso!');
        this.resetEditMode();
    }

    // Editar entrada
    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) {
            this.showError('Entrada não encontrada.');
            return;
        }

        // Preencher formulário com dados da entrada
        document.getElementById('entry-title').value = entry.title;
        document.getElementById('entry-content').value = entry.content;
        
        // Atualizar estado de edição
        this.editingEntryId = entryId;
        
        // Mostrar botão de cancelar
        document.getElementById('cancel-edit').style.display = 'inline-block';
        
        // Alterar texto do botão de salvar
        const submitButton = document.querySelector('#entry-form button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Atualizar Entrada';

        // Scroll para o formulário
        document.getElementById('entry-form').scrollIntoView({ behavior: 'smooth' });
        
        this.showSuccess('Modo de edição ativado. Faça suas alterações e clique em "Atualizar Entrada".');
    }

    // Resetar modo de edição (sem mensagem)
    resetEditMode() {
        this.editingEntryId = null;
        this.clearForm();
        
        // Esconder botão de cancelar
        document.getElementById('cancel-edit').style.display = 'none';
        
        // Restaurar texto do botão de salvar
        const submitButton = document.querySelector('#entry-form button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Salvar Entrada';
    }

    // Cancelar edição
    cancelEdit() {
        this.resetEditMode();
        this.showSuccess('Edição cancelada.');
    }

    // Excluir entrada
    async deleteEntry(entryId) {
        if (!confirm('Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const entryRef = doc(db, 'diary_entries', entryId);
            await deleteDoc(entryRef);
            
            console.log('Entrada excluída:', entryId);
            this.showSuccess('Entrada excluída com sucesso!');
            
        } catch (error) {
            console.error('Erro ao excluir entrada:', error);
            this.showError('Erro ao excluir entrada. Tente novamente.');
        }
    }

    // Pesquisar entradas
    searchEntries(searchTerm) {
        const filteredEntries = searchTerm
            ? this.entries.filter(entry => 
                entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.content.toLowerCase().includes(searchTerm.toLowerCase())
              )
            : this.entries;

        this.renderEntries(filteredEntries);
    }

    // Renderizar entradas na tela
    renderEntries(entriesToRender = this.entries) {
        const entriesList = document.getElementById('entries-list');
        const entriesCount = document.getElementById('entries-count');

        // Atualizar contador
        entriesCount.textContent = `${entriesToRender.length} entradas`;

        if (entriesToRender.length === 0) {
            entriesList.innerHTML = `
                <div class="text-center text-muted empty-state">
                    <i class="fas fa-book-open fa-3x mb-3"></i>
                    <p>Nenhuma entrada encontrada.</p>
                    ${this.entries.length === 0 
                        ? '<p>Que tal escrever a primeira?</p>' 
                        : '<p>Tente pesquisar por outros termos.</p>'
                    }
                </div>
            `;
            return;
        }

        const entriesHTML = entriesToRender.map(entry => {
            const createdDate = entry.createdAt ? 
                new Date(entry.createdAt.seconds * 1000).toLocaleString('pt-BR') : 
                'Data não disponível';
            
            const updatedDate = entry.updatedAt && entry.updatedAt !== entry.createdAt ? 
                ` (editado em ${new Date(entry.updatedAt.seconds * 1000).toLocaleString('pt-BR')})` : 
                '';

            return `
                <div class="entry-item fade-in" data-entry-id="${entry.id}">
                    <div class="entry-title">${this.escapeHtml(entry.title)}</div>
                    <div class="entry-date">
                        <i class="fas fa-calendar me-1"></i>
                        ${createdDate}${updatedDate}
                    </div>
                    <div class="entry-content">${this.escapeHtml(entry.content)}</div>
                    <div class="entry-actions">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="window.diaryManager.editEntry('${entry.id}')">
                            <i class="fas fa-edit me-1"></i>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.diaryManager.deleteEntry('${entry.id}')">
                            <i class="fas fa-trash me-1"></i>
                            Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        entriesList.innerHTML = entriesHTML;
    }

    // Limpar formulário
    clearForm() {
        document.getElementById('entry-form').reset();
        document.getElementById('entry-title').focus();
    }

    // Escape HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostrar mensagem de sucesso
    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    // Mostrar mensagem de erro
    showError(message) {
        this.showAlert(message, 'danger');
    }

    // Mostrar alerta
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
        
        alertDiv.innerHTML = `
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

    // Cleanup ao sair
    cleanup() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}

// Exportar instância do DiaryManager
export const diaryManager = new DiaryManager();

// Tornar disponível globalmente para os botões inline
window.diaryManager = diaryManager;