class PhraseListManager {
    constructor() {
        this.phrases = this.loadPhrases();
        this.currentFilter = { search: '', category: '' };
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderPhrases();
        this.updatePhrasesCount();
    }

    bindEvents() {
        const editForm = document.getElementById('edit-phrase-form');
        editForm.addEventListener('submit', (e) => this.handleEditSubmit(e));
    }

    renderPhrases(phrasesToRender = this.phrases) {
        const container = document.getElementById('phrases-list');
        
        if (phrasesToRender.length === 0) {
            if (this.phrases.length === 0) {
                container.innerHTML = '<p class="empty-state">Nenhuma frase cadastrada ainda. <a href="index.html">Comece adicionando sua primeira frase!</a></p>';
            } else {
                container.innerHTML = '<p class="empty-state">Nenhuma frase encontrada com os filtros aplicados.</p>';
            }
            return;
        }

        container.innerHTML = phrasesToRender.map(phrase => `
            <div class="phrase-item">
                <div class="phrase-actions">
                    <button class="btn-edit" onclick="phraseListManager.editPhrase(${phrase.id})">✏️</button>
                    <button class="btn-delete" onclick="phraseListManager.deletePhrase(${phrase.id})">🗑️</button>
                </div>
                <div class="phrase-text">"${phrase.text}"</div>
                <div class="phrase-meta">
                    <span class="phrase-author">${phrase.author || 'Anônimo'}</span>
                    <span class="phrase-category">${this.getCategoryDisplayName(phrase.category)}</span>
                </div>
                ${phrase.tags.length > 0 ? `
                    <div class="phrase-tags">
                        ${phrase.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                <div style="font-size: 12px; color: #999; margin-top: 10px;">
                    Cadastrada em: ${phrase.createdAt}
                    ${phrase.updatedAt ? `<br>Editada em: ${phrase.updatedAt}` : ''}
                </div>
            </div>
        `).join('');
    }

    editPhrase(id) {
        const phrase = this.phrases.find(p => p.id === id);
        if (!phrase) {
            this.showToast('Frase não encontrada!', 'error');
            return;
        }

        // Preencher o modal com os dados da frase
        document.getElementById('edit-phrase').value = phrase.text;
        document.getElementById('edit-author').value = phrase.author || '';
        document.getElementById('edit-category').value = phrase.category;
        document.getElementById('edit-tags').value = phrase.tags.join(', ');
        
        // Armazenar o ID da frase sendo editada
        document.getElementById('edit-phrase-form').dataset.phraseId = id;
        
        // Mostrar o modal
        document.getElementById('edit-modal').style.display = 'block';
    }

    handleEditSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const phraseId = parseInt(e.target.dataset.phraseId);
        
        const updatedData = {
            text: formData.get('phrase').trim(),
            author: formData.get('author').trim(),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (!updatedData.text || !updatedData.category) {
            this.showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }

        // Encontrar e atualizar a frase
        const phraseIndex = this.phrases.findIndex(p => p.id === phraseId);
        if (phraseIndex !== -1) {
            this.phrases[phraseIndex] = {
                ...this.phrases[phraseIndex],
                ...updatedData,
                updatedAt: new Date().toLocaleString('pt-BR')
            };
            
            this.savePhrases();
            this.searchPhrases(); // Re-aplicar filtros atuais
            this.closeEditModal();
            this.showToast('Frase atualizada com sucesso! ✨');
        } else {
            this.showToast('Erro ao atualizar a frase!', 'error');
        }
    }

    closeEditModal() {
        document.getElementById('edit-modal').style.display = 'none';
        document.getElementById('edit-phrase-form').reset();
        delete document.getElementById('edit-phrase-form').dataset.phraseId;
    }

    deletePhrase(id) {
        if (confirm('Tem certeza que deseja excluir esta frase?')) {
            this.phrases = this.phrases.filter(phrase => phrase.id !== id);
            this.savePhrases();
            this.searchPhrases(); // Re-aplicar filtros atuais
            this.updatePhrasesCount();
            this.showToast('Frase excluída com sucesso!');
        }
    }

    searchPhrases() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const categoryFilter = document.getElementById('filter-category').value;
        
        this.currentFilter = { search: searchTerm, category: categoryFilter };
        
        let filtered = this.phrases;
        
        if (searchTerm) {
            filtered = filtered.filter(phrase => 
                phrase.text.toLowerCase().includes(searchTerm) ||
                phrase.author.toLowerCase().includes(searchTerm) ||
                phrase.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (categoryFilter) {
            filtered = filtered.filter(phrase => phrase.category === categoryFilter);
        }
        
        this.renderPhrases(filtered);
        this.updatePhrasesCount(filtered);
    }

    filterByCategory() {
        this.searchPhrases();
    }

    updatePhrasesCount(filteredPhrases = null) {
        const count = filteredPhrases ? filteredPhrases.length : this.phrases.length;
        const total = this.phrases.length;
        
        let text = `${count} frase${count !== 1 ? 's' : ''}`;
        if (filteredPhrases && count !== total) {
            text += ` de ${total}`;
        }
        text += ' encontrada' + (count !== 1 ? 's' : '');
        
        document.getElementById('phrases-count').textContent = text;
    }

    getCategoryDisplayName(category) {
        const displayNames = {
            'motivacional': 'Motivacional',
            'inspiracional': 'Inspiracional', 
            'reflexao': 'Reflexão',
            'humor': 'Humor',
            'sabedoria': 'Sabedoria',
            'amor': 'Amor',
            'vida': 'Vida',
            'sucesso': 'Sucesso',
            'outros': 'Outros'
        };
        return displayNames[category] || category;
    }

    loadPhrases() {
        const stored = localStorage.getItem('phrases');
        return stored ? JSON.parse(stored) : [];
    }

    savePhrases() {
        localStorage.setItem('phrases', JSON.stringify(this.phrases));
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Funções globais para os event handlers inline
function searchPhrases() {
    phraseListManager.searchPhrases();
}

function filterByCategory() {
    phraseListManager.filterByCategory();
}

function closeEditModal() {
    phraseListManager.closeEditModal();
}

// Fechar modal clicando fora dele
window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Fechar modal com ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEditModal();
    }
});

// Inicializar a aplicação
const phraseListManager = new PhraseListManager();