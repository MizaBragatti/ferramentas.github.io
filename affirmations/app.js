// Classe para gerenciar afirmações
class AffirmationsManager {
    constructor() {
        this.affirmations = this.loadFromStorage();
        this.initEventListeners();
        this.render();
    }

    // Carregar afirmações do localStorage
    loadFromStorage() {
        const stored = localStorage.getItem('affirmations');
        return stored ? JSON.parse(stored) : [];
    }

    // Salvar afirmações no localStorage
    saveToStorage() {
        localStorage.setItem('affirmations', JSON.stringify(this.affirmations));
    }

    // Inicializar event listeners
    initEventListeners() {
        const editBtn = document.getElementById('editAllBtn');
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleEdit();
        });
        
        const copyBtn = document.getElementById('copyAllBtn');
        copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.copyAll();
        });
        
        // Auto-resize do textarea
        const textarea = document.getElementById('affirmationsList');
        textarea.addEventListener('input', () => this.autoResize(textarea));
    }

    // Alternar entre edição e leitura
    toggleEdit() {
        const textarea = document.getElementById('affirmationsList');
        const editBtn = document.getElementById('editAllBtn');
        
        if (textarea.hasAttribute('readonly')) {
            // Modo edição
            textarea.removeAttribute('readonly');
            
            // Adiciona linha vazia no topo para nova afirmação
            const currentContent = textarea.value.trim();
            if (currentContent) {
                textarea.value = '\n' + currentContent;
            } else {
                textarea.value = '';
            }
            
            // Posiciona o cursor no início
            textarea.setSelectionRange(0, 0);
            textarea.focus();
            textarea.scrollTop = 0;
            
            textarea.style.borderColor = 'var(--primary-color)';
            editBtn.textContent = '💾 Salvar';
            editBtn.dataset.mode = 'save';
        } else {
            // Modo salvar
            this.saveAll();
        }
    }

    // Auto-redimensionar textarea
    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, window.innerHeight * 0.7) + 'px';
    }

    // Copiar todas as afirmações
    async copyAll() {
        const textarea = document.getElementById('affirmationsList');
        const content = textarea.value.trim();
        
        if (!content) {
            console.log('Não há afirmações para copiar');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(content);
            console.log('Afirmações copiadas! 📋');
        } catch (err) {
            // Fallback para navegadores antigos
            textarea.select();
            document.execCommand('copy');
            console.log('Afirmações copiadas! 📋');
        }
    }

    // Salvar todas as afirmações
    saveAll() {
        const textarea = document.getElementById('affirmationsList');
        const editBtn = document.getElementById('editAllBtn');
        const content = textarea.value.trim();
        
        if (!content) {
            this.affirmations = [];
        } else {
            // Divide por linhas vazias (duas quebras de linha)
            const affirmationsText = content.split(/\n\s*\n/).filter(text => text.trim());
            
            // Cria afirmações com a primeira sendo a mais recente (topo)
            this.affirmations = affirmationsText.map((text, index) => ({
                id: Date.now() + index,
                text: text.trim(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
        }
        
        this.saveToStorage();
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.borderColor = '';
        
        editBtn.textContent = '✏️ Editar';
        editBtn.dataset.mode = 'edit';
        
        this.render();
        console.log('Afirmações atualizadas! 📝');
    }

    // Renderizar afirmações
    render() {
        const textarea = document.getElementById('affirmationsList');

        if (this.affirmations.length === 0) {
            textarea.value = '';
            this.autoResize(textarea);
            return;
        }

        // Renderizar todas as afirmações como texto simples
        textarea.value = this.affirmations.map(affirmation => affirmation.text).join('\n\n');
        this.autoResize(textarea);
    }
}

// Inicializar o gerenciador
const manager = new AffirmationsManager();
