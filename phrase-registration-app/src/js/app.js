class PhraseManager {
    constructor() {
        this.phrases = this.loadPhrases();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStats();
    }

    bindEvents() {
        const form = document.getElementById('phrase-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const phrase = {
            id: Date.now(),
            text: formData.get('phrase').trim(),
            author: formData.get('author').trim(),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            createdAt: new Date().toLocaleString('pt-BR')
        };

        if (!phrase.text || !phrase.category) {
            this.showToast('Por favor, preencha todos os campos obrigatórios!', 'error');
            return;
        }

        this.phrases.unshift(phrase);
        this.savePhrases();
        this.updateStats();
        e.target.reset();
        this.showToast('Frase cadastrada com sucesso! 🎉');
        
        // Mostrar estatísticas após cadastro
        document.getElementById('success-stats').style.display = 'block';
    }

    updateStats() {
        const totalPhrases = this.phrases.length;
        
        if (totalPhrases === 0) return;
        
        // Contar categorias
        const categories = {};
        this.phrases.forEach(phrase => {
            categories[phrase.category] = (categories[phrase.category] || 0) + 1;
        });
        
        // Encontrar categoria favorita
        const favoriteCategory = Object.keys(categories).reduce((a, b) => 
            categories[a] > categories[b] ? a : b
        );
        
        // Atualizar display
        document.getElementById('total-phrases').textContent = totalPhrases;
        document.getElementById('favorite-category').textContent = this.getCategoryDisplayName(favoriteCategory);
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
function clearForm() {
    document.getElementById('phrase-form').reset();
    document.getElementById('success-stats').style.display = 'none';
    phraseManager.showToast('Formulário limpo!');
}

// Inicializar a aplicação
const phraseManager = new PhraseManager();