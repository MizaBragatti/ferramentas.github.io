class TranscritorWeb {
    constructor() {
        this.initializeElements();
        
        // Web Speech API
        this.recognition = null;
        this.isListening = false;
        this.isProcessingResult = false;
        
        // Transcrição
        this.finalTranscriptions = [];
        this.lastResultIndex = 0;
        this.sessionStartTime = null;
        this.restartTimeout = null;
        
        // Proteção contra duplicatas
        this.processedResults = new Set();
        this.lastProcessedText = '';
        
        // Tradução
        this.isTranslationEnabled = false;
        this.translationQueue = [];
        this.isTranslating = false;
        
        // Inicializar
        this.checkBrowserSupport();
        this.setupEventListeners();
        this.loadSettings();
        this.updateTimestamp();
        this.loadHistory();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        this.languageSelect = document.getElementById('languageSelect');
        this.continuousMode = document.getElementById('continuousMode');
        this.interimResults = document.getElementById('interimResults');
        this.translationMode = document.getElementById('translationMode');
        this.targetLanguageSelect = document.getElementById('targetLanguageSelect');
        this.targetLanguageGroup = document.getElementById('targetLanguageGroup');
        
        this.transcriptionArea = document.getElementById('transcriptionArea');
        this.translationArea = document.getElementById('translationArea');
        this.originalColumn = document.getElementById('originalColumn');
        this.translationColumn = document.getElementById('translationColumn');
        this.originalLanguageLabel = document.getElementById('originalLanguageLabel');
        this.translationLanguageLabel = document.getElementById('translationLanguageLabel');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.browserSupport = document.getElementById('browserSupport');
        
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        this.timestamp = document.getElementById('timestamp');
        this.historyList = document.getElementById('historyList');
        
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.closeErrorModal = document.getElementById('closeErrorModal');
        this.dismissError = document.getElementById('dismissError');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    checkBrowserSupport() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.browserSupport.innerHTML = '<i class="fas fa-check-circle"></i> <span>Navegador compatível!</span>';
            this.browserSupport.classList.add('supported');
            this.recognition = new SpeechRecognition();
            this.setupSpeechRecognition();
        } else {
            this.browserSupport.innerHTML = '<i class="fas fa-times-circle"></i> <span>Navegador não suporta reconhecimento de voz</span>';
            this.browserSupport.classList.add('not-supported');
            this.startBtn.disabled = true;
            this.showError('Seu navegador não suporta a Web Speech API. Use Chrome, Edge ou Safari.');
        }
    }

    setupSpeechRecognition() {
        if (!this.recognition) return;
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.sessionStartTime = new Date();
            this.lastResultIndex = 0;
            this.processedResults.clear();
            this.updateUI();
            this.hideLoading();
        };
        
        this.recognition.onresult = (event) => {
            if (this.isProcessingResult) return;
            this.isProcessingResult = true;
            
            try {
                this.processResults(event);
            } finally {
                this.isProcessingResult = false;
            }
        };
        
        this.recognition.onerror = (event) => {
            if (event.error !== 'no-speech') {
                console.error('Erro:', event.error);
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI();
        };
    }

    processResults(event) {
        let interimText = '';
        let finalTranscript = '';
        
        for (let i = this.lastResultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                if (!this.isDuplicate(transcript)) {
                    finalTranscript += transcript + ' ';
                    this.processedResults.add(transcript.toLowerCase().trim());
                }
                this.lastResultIndex = i + 1;
            } else {
                interimText += transcript + ' ';
            }
        }
        
        if (interimText.trim()) {
            this.displayInterim(interimText);
        }
        
        if (finalTranscript.trim()) {
            this.addTranscription(finalTranscript.trim());
        }
    }

    isDuplicate(text) {
        const clean = text.toLowerCase().trim();
        return this.processedResults.has(clean);
    }

    displayInterim(text) {
        const placeholder = this.transcriptionArea.querySelector('.placeholder');
        if (placeholder) placeholder.remove();
        
        let interim = this.transcriptionArea.querySelector('.interim');
        
        if (text.trim()) {
            if (!interim) {
                interim = document.createElement('div');
                interim.className = 'transcription-text interim';
                this.transcriptionArea.appendChild(interim);
            }
            interim.innerHTML = `
                <div class="timestamp">Escutando...</div>
                <div>${this.escapeHtml(text)}</div>
            `;
            this.scrollToBottom();
        } else if (interim) {
            interim.remove();
        }
    }

    addTranscription(text) {
        const interim = this.transcriptionArea.querySelector('.interim');
        if (interim) interim.remove();
        
        const placeholder = this.transcriptionArea.querySelector('.placeholder');
        if (placeholder) placeholder.remove();
        
        const transcription = {
            text: text,
            timestamp: new Date().toLocaleTimeString(),
            id: Date.now() + Math.random()
        };
        
        this.finalTranscriptions.push(transcription);
        this.appendTranscription(transcription);
        
        if (this.isTranslationEnabled) {
            this.queueTranslation(transcription);
        }
    }

    appendTranscription(t) {
        const div = document.createElement('div');
        div.className = 'transcription-text';
        div.id = `transcription-${t.id}`;
        div.innerHTML = `
            <div class="timestamp">${t.timestamp}</div>
            <div>${this.escapeHtml(t.text)}</div>
        `;
        this.transcriptionArea.appendChild(div);
        this.scrollToBottom();
    }

    queueTranslation(transcription) {
        this.translationQueue.push(transcription);
        this.processTranslations();
    }

    async processTranslations() {
        if (this.isTranslating || this.translationQueue.length === 0) return;
        
        this.isTranslating = true;
        
        while (this.translationQueue.length > 0) {
            const t = this.translationQueue.shift();
            await this.translate(t);
            await new Promise(r => setTimeout(r, 300));
        }
        
        this.isTranslating = false;
    }

    async translate(t) {
        try {
            // Remover placeholder na primeira tradução
            const placeholderElement = this.translationArea.querySelector('.placeholder');
            if (placeholderElement) placeholderElement.remove();
            
            const placeholder = document.createElement('div');
            placeholder.className = 'transcription-text translation-loading';
            placeholder.id = `translation-${t.id}`;
            placeholder.innerHTML = `
                <div class="timestamp">${t.timestamp}</div>
                <div><i class="fas fa-spinner fa-spin"></i> Traduzindo...</div>
            `;
            this.translationArea.appendChild(placeholder);
            
            const from = this.languageSelect.value.split('-')[0];
            const to = this.targetLanguageSelect.value;
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t.text)}&langpair=${from}|${to}`;
            
            const response = await fetch(url);
            const data = await response.json();
            const translated = data.responseData?.translatedText || '[Erro na tradução]';
            
            placeholder.className = 'transcription-text';
            placeholder.innerHTML = `
                <div class="timestamp">${t.timestamp}</div>
                <div>${this.escapeHtml(translated)}</div>
            `;
            
            this.translationArea.scrollTop = this.translationArea.scrollHeight;
        } catch (error) {
            console.error('Erro na tradução:', error);
        }
    }

    scrollToBottom() {
        const container = this.transcriptionArea;
        const isBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1;
        
        if (isBottom || container.children.length <= 1) {
            container.scrollTop = container.scrollHeight;
            if (this.isTranslationEnabled) {
                this.translationArea.scrollTop = this.translationArea.scrollHeight;
            }
        }
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.downloadBtn.addEventListener('click', () => this.download());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        this.languageSelect.addEventListener('change', () => {
            if (this.recognition) this.recognition.lang = this.languageSelect.value;
            this.saveSettings();
        });
        
        this.continuousMode.addEventListener('change', () => this.saveSettings());
        this.interimResults.addEventListener('change', () => {
            if (this.recognition) this.recognition.interimResults = this.interimResults.checked;
            this.saveSettings();
        });
        
        this.translationMode.addEventListener('change', () => this.toggleTranslation());
        this.targetLanguageSelect.addEventListener('change', () => this.saveSettings());
        
        this.closeErrorModal.addEventListener('click', () => this.hideError());
        this.dismissError.addEventListener('click', () => this.hideError());
        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) this.hideError();
        });
    }

    start() {
        if (!this.recognition || this.isListening) return;
        
        this.showLoading('Iniciando...');
        
        try {
            this.recognition.lang = this.languageSelect.value;
            this.recognition.continuous = this.continuousMode.checked;
            this.recognition.interimResults = this.interimResults.checked;
            this.lastResultIndex = 0;
            this.recognition.start();
        } catch (error) {
            this.hideLoading();
            this.showError('Erro ao iniciar. Verifique as permissões do microfone.');
        }
    }

    stop() {
        if (!this.recognition || !this.isListening) return;
        
        try {
            this.recognition.stop();
            this.saveSession();
        } catch (error) {
            console.error('Erro ao parar:', error);
        }
    }

    clear() {
        this.transcriptionArea.innerHTML = '<p class="placeholder"><i class="fas fa-microphone-alt"></i> Clique em "Iniciar" e comece a falar...</p>';
        this.translationArea.innerHTML = '<p class="placeholder"><i class="fas fa-language"></i> Traduções aparecerão aqui...</p>';
        this.finalTranscriptions = [];
        this.lastResultIndex = 0;
        this.processedResults.clear();
        this.updateStats();
    }

    download() {
        if (this.finalTranscriptions.length === 0) {
            this.showError('Nenhuma transcrição para baixar.');
            return;
        }
        
        let content = `Transcrição - ${new Date().toLocaleString()}\n\n`;
        this.finalTranscriptions.forEach(t => content += `[${t.timestamp}] ${t.text}\n\n`);
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcricao_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    toggleTranslation() {
        this.isTranslationEnabled = this.translationMode.checked;
        
        if (this.isTranslationEnabled) {
            this.translationColumn.style.display = 'block';
            this.targetLanguageGroup.style.display = 'block';
            this.transcriptionArea.parentElement.parentElement.style.gridTemplateColumns = '1fr 1fr';
        } else {
            this.translationColumn.style.display = 'none';
            this.targetLanguageGroup.style.display = 'none';
            this.transcriptionArea.parentElement.parentElement.style.gridTemplateColumns = '1fr';
        }
        
        this.saveSettings();
    }

    updateUI() {
        if (this.isListening) {
            this.statusIndicator.classList.remove('stopped');
            this.statusIndicator.classList.add('listening');
            this.statusIndicator.innerHTML = '<i class="fas fa-microphone"></i>';
            this.statusText.textContent = 'Escutando...';
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
        } else {
            this.statusIndicator.classList.remove('listening');
            this.statusIndicator.classList.add('stopped');
            this.statusIndicator.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.statusText.textContent = 'Parado';
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
        }
        
        this.updateStats();
    }

    updateStats() {
        const words = this.finalTranscriptions.reduce((c, t) => c + t.text.trim().split(/\s+/).length, 0);
        const chars = this.finalTranscriptions.reduce((c, t) => c + t.text.length, 0);
        this.wordCount.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        this.charCount.textContent = `${chars} caractere${chars !== 1 ? 's' : ''}`;
    }

    saveSession() {
        if (this.finalTranscriptions.length === 0) return;
        
        const session = {
            timestamp: this.sessionStartTime || new Date(),
            language: this.languageSelect.value,
            transcriptions: this.finalTranscriptions,
            wordCount: this.finalTranscriptions.reduce((c, t) => c + t.text.trim().split(/\s+/).length, 0),
            charCount: this.finalTranscriptions.reduce((c, t) => c + t.text.length, 0)
        };
        
        const history = this.getHistory();
        history.unshift(session);
        if (history.length > 10) history.splice(10);
        
        localStorage.setItem('transcriptionHistory', JSON.stringify(history));
        this.loadHistory();
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('transcriptionHistory') || '[]');
        } catch {
            return [];
        }
    }

    loadHistory() {
        const history = this.getHistory();
        this.historyList.innerHTML = '';
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">Nenhuma sessão salva</p>';
            return;
        }
        
        history.forEach((s, i) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-info">
                    <div class="history-date">${new Date(s.timestamp).toLocaleString()}</div>
                    <div class="history-stats">${s.wordCount} palavras | ${s.charCount} caracteres</div>
                </div>
                <button class="btn btn-sm btn-primary" onclick="transcritor.loadSession(${i})">
                    <i class="fas fa-upload"></i> Carregar
                </button>
            `;
            this.historyList.appendChild(div);
        });
    }

    loadSession(index) {
        const history = this.getHistory();
        if (history[index]) {
            this.clear();
            this.finalTranscriptions = history[index].transcriptions;
            history[index].transcriptions.forEach(t => this.appendTranscription(t));
            this.updateStats();
        }
    }

    clearHistory() {
        if (confirm('Limpar todo o histórico?')) {
            localStorage.removeItem('transcriptionHistory');
            this.loadHistory();
        }
    }

    saveSettings() {
        localStorage.setItem('transcriptionSettings', JSON.stringify({
            language: this.languageSelect.value,
            continuous: this.continuousMode.checked,
            interimResults: this.interimResults.checked,
            translationEnabled: this.translationMode.checked,
            targetLanguage: this.targetLanguageSelect.value
        }));
    }

    loadSettings() {
        try {
            const s = JSON.parse(localStorage.getItem('transcriptionSettings'));
            if (s) {
                this.languageSelect.value = s.language || 'en-US';
                this.continuousMode.checked = s.continuous !== false;
                this.interimResults.checked = s.interimResults !== false;
                this.translationMode.checked = s.translationEnabled || false;
                this.targetLanguageSelect.value = s.targetLanguage || 'pt';
                this.toggleTranslation();
            }
        } catch {
            this.translationMode.checked = true;
            this.targetLanguageSelect.value = 'pt';
            this.toggleTranslation();
        }
    }

    updateTimestamp() {
        this.timestamp.textContent = new Date().toLocaleString('pt-BR');
        setTimeout(() => this.updateTimestamp(), 60000);
    }

    showError(msg) {
        this.errorMessage.textContent = msg;
        this.errorModal.style.display = 'flex';
    }

    hideError() {
        this.errorModal.style.display = 'none';
    }

    showLoading(msg = 'Carregando...') {
        this.loadingOverlay.style.display = 'flex';
        const text = this.loadingOverlay.querySelector('p');
        if (text) text.textContent = msg;
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

let transcritor;

document.addEventListener('DOMContentLoaded', () => {
    transcritor = new TranscritorWeb();
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(r => console.log('SW registrado'))
            .catch(e => console.log('SW erro:', e));
    });
}
