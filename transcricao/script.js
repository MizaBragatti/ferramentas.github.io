class TranscritorWeb {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.currentTranscription = '';
        this.finalTranscriptions = [];
        this.translations = [];
        this.sessionStartTime = null;
        this.isTranslationEnabled = false;
        this.targetLanguage = 'pt';
        
        // Controles para fluidez
        this.lastResultIndex = 0;
        this.isProcessingResult = false;
        this.restartTimeout = null;
        this.translationQueue = [];
        this.isTranslating = false;
        
        this.initializeElements();
        this.checkBrowserSupport();
        this.setupEventListeners();
        this.loadSettings();
        this.loadHistory();
        this.updateTimestamp();
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();
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
            this.showError('Seu navegador não suporta a Web Speech API. Recomendamos usar Chrome, Edge ou Safari mais recentes.');
        }
    }

    setupSpeechRecognition() {
        if (!this.recognition) return;

        // Configurações otimizadas para fluidez
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            console.log('Reconhecimento iniciado');
            this.isListening = true;
            this.sessionStartTime = new Date();
            this.lastResultIndex = 0; // Reset do índice
            this.updateUI();
            this.hideLoading();
        };

        this.recognition.onresult = (event) => {
            if (this.isProcessingResult) return; // Evitar processamento simultâneo
            this.isProcessingResult = true;
            
            try {
                this.processResults(event);
            } finally {
                this.isProcessingResult = false;
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Erro no reconhecimento:', event.error);
            this.isProcessingResult = false;
            
            // Não mostrar erro para "no-speech" - é normal em pausas
            if (event.error !== 'no-speech') {
                this.handleRecognitionError(event.error);
            }
        };

        this.recognition.onend = () => {
            console.log('Reconhecimento encerrado');
            this.isListening = false;
            this.isProcessingResult = false;
            this.updateUI();
            
            // Reiniciar suavemente se estiver no modo contínuo
            if (this.continuousMode.checked && this.startBtn.disabled) {
                this.scheduleRestart();
            }
        };
    }

    processResults(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        let hasNewFinal = false;

        // Processar apenas resultados novos para evitar duplicação
        for (let i = this.lastResultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            
            if (result.isFinal) {
                finalTranscript += transcript + ' ';
                hasNewFinal = true;
                this.lastResultIndex = i + 1; // Atualizar índice para próxima vez
            } else {
                interimTranscript += transcript;
            }
        }

        // Processar texto final apenas se houver novo conteúdo
        if (hasNewFinal && finalTranscript.trim()) {
            this.addFinalTranscription(finalTranscript.trim());
        }

        // Mostrar resultado provisório
        this.displayInterimResult(interimTranscript);
        this.updateStats();
    }

    scheduleRestart() {
        // Limpar timeout anterior se existir
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
        }
        
        // Reiniciar após breve pausa para evitar conflitos
        this.restartTimeout = setTimeout(() => {
            if (!this.isListening && this.startBtn.disabled) {
                console.log('Reiniciando reconhecimento automaticamente...');
                this.startRecognition();
            }
        }, 500); // Reduzido para 500ms para mais fluidez
    }

    displayInterimResult(interimText) {
        if (!this.interimResults.checked) return;

        // Buscar elemento interim existente
        let interimElement = this.transcriptionArea.querySelector('.interim');
        
        if (interimText.trim()) {
            if (!interimElement) {
                // Criar novo elemento interim
                interimElement = document.createElement('div');
                interimElement.className = 'transcription-text interim';
                this.transcriptionArea.appendChild(interimElement);
            }
            
            // Atualizar conteúdo sem recriar elemento
            interimElement.innerHTML = `
                <div class="timestamp">Escutando...</div>
                <div>${this.escapeHtml(interimText)}</div>
            `;
            
            // Scroll suave apenas se necessário
            this.scrollToBottomIfNeeded();
        } else if (interimElement) {
            // Remover elemento interim vazio
            interimElement.remove();
        }
    }

    scrollToBottomIfNeeded() {
        const container = this.transcriptionArea;
        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 1;
        
        if (isScrolledToBottom || container.children.length <= 1) {
            container.scrollTop = container.scrollHeight;
        }
    }

    addFinalTranscription(text) {
        // Remover resultado interim antes de adicionar final
        const interimElement = this.transcriptionArea.querySelector('.interim');
        if (interimElement) {
            interimElement.remove();
        }

        const timestamp = new Date().toLocaleTimeString();
        const transcription = {
            text: text,
            timestamp: timestamp,
            id: Date.now() + Math.random()
        };
        
        this.finalTranscriptions.push(transcription);
        this.appendFinalTranscription(transcription);
        
        // Adicionar à fila de tradução se habilitado
        if (this.isTranslationEnabled) {
            this.queueTranslation(transcription);
        }
    }

    appendFinalTranscription(transcription) {
        const div = document.createElement('div');
        div.className = 'transcription-text';
        div.id = `transcription-${transcription.id}`;
        div.innerHTML = `
            <div class="timestamp">${transcription.timestamp}</div>
            <div>${this.escapeHtml(transcription.text)}</div>
        `;
        
        this.transcriptionArea.appendChild(div);
        this.scrollToBottomIfNeeded();
    }

    queueTranslation(transcription) {
        this.translationQueue.push(transcription);
        this.processTranslationQueue();
    }

    async processTranslationQueue() {
        if (this.isTranslating || this.translationQueue.length === 0) return;
        
        this.isTranslating = true;
        
        while (this.translationQueue.length > 0) {
            const transcription = this.translationQueue.shift();
            await this.translateText(transcription);
            
            // Pequena pausa entre traduções
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        this.isTranslating = false;
    }

    async translateText(transcription) {
        const sourceText = transcription.text.trim();
        if (!sourceText) return;

        const sourceLanguage = this.getLanguageCode(this.languageSelect.value);
        
        try {
            // Mostrar indicador de tradução imediatamente
            this.showTranslationPlaceholder(transcription);
            
            const translatedText = await this.callTranslationAPI(sourceText, sourceLanguage, this.targetLanguage);
            
            const translation = {
                id: transcription.id,
                text: translatedText,
                timestamp: transcription.timestamp,
                sourceText: sourceText
            };
            
            // Atualizar array de traduções
            const existingIndex = this.translations.findIndex(t => t.id === transcription.id);
            if (existingIndex !== -1) {
                this.translations[existingIndex] = translation;
            } else {
                this.translations.push(translation);
            }
            
            // Atualizar elemento específico ao invés de recriar tudo
            this.updateTranslationElement(translation);
            
        } catch (error) {
            console.error('Erro na tradução:', error);
            this.showTranslationError(transcription.id, 'Erro na tradução');
        }
    }

    showTranslationPlaceholder(transcription) {
        if (!this.isTranslationEnabled) return;
        
        let placeholderElement = document.getElementById(`translation-${transcription.id}`);
        
        if (!placeholderElement) {
            placeholderElement = document.createElement('div');
            placeholderElement.className = 'transcription-text translating';
            placeholderElement.id = `translation-${transcription.id}`;
            this.translationArea.appendChild(placeholderElement);
        }
        
        placeholderElement.innerHTML = `
            <div class="timestamp">Traduzindo...</div>
            <div><i class="fas fa-spinner fa-spin"></i> Processando...</div>
        `;
        
        this.scrollTranslationToBottom();
    }

    updateTranslationElement(translation) {
        if (!this.isTranslationEnabled) return;
        
        const element = document.getElementById(`translation-${translation.id}`);
        if (element) {
            element.className = 'transcription-text translated';
            element.innerHTML = `
                <div class="timestamp">${translation.timestamp}</div>
                <div>${this.escapeHtml(translation.text)}</div>
            `;
        }
        
        this.scrollTranslationToBottom();
    }

    scrollTranslationToBottom() {
        if (this.translationArea) {
            this.translationArea.scrollTop = this.translationArea.scrollHeight;
        }
    }

    async callTranslationAPI(text, fromLang, toLang) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        } else {
            throw new Error('API de tradução indisponível');
        }
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startRecognition());
        this.stopBtn.addEventListener('click', () => this.stopRecognition());
        this.clearBtn.addEventListener('click', () => this.clearTranscription());
        this.downloadBtn.addEventListener('click', () => this.downloadTranscription());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        this.languageSelect.addEventListener('change', () => this.updateLanguage());
        this.continuousMode.addEventListener('change', () => this.saveSettings());
        this.interimResults.addEventListener('change', () => this.updateInterimResults());
        this.translationMode.addEventListener('change', () => this.toggleTranslation());
        this.targetLanguageSelect.addEventListener('change', () => this.updateTargetLanguage());

        this.closeErrorModal.addEventListener('click', () => this.hideError());
        this.dismissError.addEventListener('click', () => this.hideError());

        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideError();
            }
        });

        // Atalhos de teclado otimizados
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case ' ':
                        e.preventDefault();
                        if (this.isListening) {
                            this.stopRecognition();
                        } else {
                            this.startRecognition();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.downloadTranscription();
                        break;
                    case 'Delete':
                        e.preventDefault();
                        this.clearTranscription();
                        break;
                }
            }
        });
    }

    startRecognition() {
        if (!this.recognition || this.isListening) return;

        // Limpar timeouts pendentes
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }

        this.showLoading();
        
        try {
            this.recognition.lang = this.languageSelect.value;
            this.recognition.continuous = this.continuousMode.checked;
            this.recognition.interimResults = this.interimResults.checked;
            
            this.lastResultIndex = 0; // Reset do índice
            this.recognition.start();
            
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento:', error);
            this.hideLoading();
            this.showError('Erro ao iniciar o reconhecimento de voz. Verifique as permissões do microfone.');
        }
    }

    stopRecognition() {
        if (this.recognition && this.isListening) {
            // Limpar timeouts para evitar reinício automático
            if (this.restartTimeout) {
                clearTimeout(this.restartTimeout);
                this.restartTimeout = null;
            }
            
            this.recognition.stop();
            this.saveSession();
        }
    }

    // ... resto dos métodos permanecem iguais ...
    updateLanguage() {
        if (this.recognition) {
            this.recognition.lang = this.languageSelect.value;
            this.saveSettings();
        }
    }

    updateInterimResults() {
        if (this.recognition) {
            this.recognition.interimResults = this.interimResults.checked;
            this.saveSettings();
        }
    }

    toggleTranslation() {
        this.isTranslationEnabled = this.translationMode.checked;
        
        if (this.isTranslationEnabled) {
            this.translationColumn.style.display = 'block';
            this.targetLanguageGroup.style.display = 'flex';
            this.originalColumn.classList.remove('single');
            this.updateLanguageLabels();
            this.translateExistingTranscriptions();
        } else {
            this.translationColumn.style.display = 'none';
            this.targetLanguageGroup.style.display = 'none';
            this.originalColumn.classList.add('single');
        }
        
        this.saveSettings();
    }

    updateTargetLanguage() {
        this.targetLanguage = this.targetLanguageSelect.value;
        this.updateLanguageLabels();
        this.saveSettings();
        
        if (this.isTranslationEnabled && this.finalTranscriptions.length > 0) {
            this.translateExistingTranscriptions();
        }
    }

    updateLanguageLabels() {
        const sourceLanguage = this.languageSelect.options[this.languageSelect.selectedIndex].text;
        const targetLanguage = this.targetLanguageSelect.options[this.targetLanguageSelect.selectedIndex].text;
        
        this.originalLanguageLabel.textContent = sourceLanguage;
        this.translationLanguageLabel.textContent = targetLanguage;
    }

    getLanguageCode(speechLang) {
        const langMap = {
            'pt-BR': 'pt',
            'en-US': 'en',
            'es-ES': 'es',
            'fr-FR': 'fr'
        };
        return langMap[speechLang] || speechLang.split('-')[0];
    }

    async translateExistingTranscriptions() {
        this.translations = [];
        this.translationArea.innerHTML = '<p class="placeholder"><i class="fas fa-language"></i> Traduzindo transcrições existentes...</p>';
        
        // Limpar fila de tradução e processar existentes
        this.translationQueue = [...this.finalTranscriptions];
        this.processTranslationQueue();
    }

    displayFinalTranscriptions() {
        if (this.finalTranscriptions.length === 0) {
            this.transcriptionArea.innerHTML = '<p class="placeholder"><i class="fas fa-microphone-alt"></i> Clique em "Iniciar Transcrição" e comece a falar...</p>';
            return;
        }

        this.transcriptionArea.innerHTML = '';
        
        this.finalTranscriptions.forEach((item) => {
            this.appendFinalTranscription(item);
        });
    }

    displayTranslations() {
        if (!this.isTranslationEnabled) return;

        if (this.translations.length === 0) {
            this.translationArea.innerHTML = '<p class="placeholder"><i class="fas fa-language"></i> As traduções aparecerão aqui...</p>';
            return;
        }

        this.translationArea.innerHTML = '';
        
        this.translations.forEach((item) => {
            this.updateTranslationElement(item);
        });
    }

    showTranslationError(transcriptionId, errorMessage) {
        if (!this.isTranslationEnabled) return;
        
        const existingDiv = document.getElementById(`translation-${transcriptionId}`);
        if (existingDiv) {
            existingDiv.className = 'transcription-text';
            existingDiv.innerHTML = `
                <div class="timestamp">Erro</div>
                <div class="translation-error"><i class="fas fa-exclamation-triangle"></i> ${errorMessage}</div>
            `;
        }
    }

    clearTranscription() {
        if (confirm('Tem certeza que deseja limpar a transcrição atual?')) {
            this.finalTranscriptions = [];
            this.translations = [];
            this.translationQueue = [];
            this.currentTranscription = '';
            this.lastResultIndex = 0;
            
            this.displayFinalTranscriptions();
            this.displayTranslations();
            this.updateStats();
        }
    }

    updateStats() {
        const allText = this.finalTranscriptions.map(item => item.text).join(' ');
        const words = allText.trim() ? allText.split(/\s+/).length : 0;
        const chars = allText.length;

        this.wordCount.textContent = `${words} palavra${words !== 1 ? 's' : ''}`;
        this.charCount.textContent = `${chars} caractere${chars !== 1 ? 's' : ''}`;
    }

    updateUI() {
        if (this.isListening) {
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.statusIndicator.classList.add('recording');
            this.statusIndicator.innerHTML = '<i class="fas fa-microphone"></i> <span id="statusText">Gravando</span>';
            this.transcriptionArea.classList.add('active');
        } else {
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.statusIndicator.classList.remove('recording');
            this.statusIndicator.innerHTML = '<i class="fas fa-microphone-slash"></i> <span id="statusText">Parado</span>';
            this.transcriptionArea.classList.remove('active');
        }
    }

    handleRecognitionError(error) {
        this.hideLoading();
        
        let errorMsg = 'Erro desconhecido no reconhecimento de voz.';
        
        switch(error) {
            case 'audio-capture':
                errorMsg = 'Erro ao capturar áudio. Verifique se o microfone está conectado e funcionando.';
                break;
            case 'not-allowed':
                errorMsg = 'Permissão para usar o microfone negada. Permita o acesso ao microfone nas configurações do navegador.';
                break;
            case 'network':
                errorMsg = 'Erro de rede. Verifique sua conexão com a internet.';
                break;
            case 'service-not-allowed':
                errorMsg = 'Serviço de reconhecimento não disponível.';
                break;
        }
        
        this.showError(errorMsg);
    }

    downloadTranscription() {
        if (this.finalTranscriptions.length === 0) {
            alert('Nenhuma transcrição para baixar.');
            return;
        }

        const content = this.generateTranscriptionText();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcricao_${this.formatDateForFile(new Date())}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateTranscriptionText() {
        const now = new Date();
        let content = '=== TRANSCRIÇÃO DE ÁUDIO WEB ===\n';
        content += `Data: ${now.toLocaleString('pt-BR')}\n`;
        content += `Idioma Original: ${this.languageSelect.options[this.languageSelect.selectedIndex].text}\n`;
        
        if (this.isTranslationEnabled) {
            content += `Tradução: ${this.targetLanguageSelect.options[this.targetLanguageSelect.selectedIndex].text}\n`;
        }
        
        content += '=' + '='.repeat(48) + '\n\n';

        if (this.isTranslationEnabled && this.translations.length > 0) {
            content += 'ORIGINAL\t\t\t\tTRADUÇÃO\n';
            content += '-'.repeat(80) + '\n\n';
            
            this.finalTranscriptions.forEach((item) => {
                const translation = this.translations.find(t => t.id === item.id);
                content += `[${item.timestamp}] ${item.text}\n`;
                if (translation) {
                    content += `[${translation.timestamp}] ${translation.text}\n`;
                } else {
                    content += `[${item.timestamp}] [Tradução não disponível]\n`;
                }
                content += '\n';
            });
        } else {
            this.finalTranscriptions.forEach((item) => {
                content += `[${item.timestamp}] ${item.text}\n\n`;
            });
        }

        content += '\n--- Estatísticas ---\n';
        content += `Total de palavras: ${this.finalTranscriptions.map(item => item.text).join(' ').split(/\s+/).length}\n`;
        content += `Total de caracteres: ${this.finalTranscriptions.map(item => item.text).join(' ').length}\n`;
        content += `Número de segmentos: ${this.finalTranscriptions.length}\n`;
        
        if (this.isTranslationEnabled) {
            content += `Traduções realizadas: ${this.translations.length}\n`;
        }
        
        if (this.sessionStartTime) {
            const duration = Math.round((new Date() - this.sessionStartTime) / 1000);
            content += `Duração da sessão: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}\n`;
        }

        return content;
    }

    saveSession() {
        if (this.finalTranscriptions.length === 0) return;

        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            transcriptions: [...this.finalTranscriptions],
            translations: [...this.translations],
            language: this.languageSelect.value,
            targetLanguage: this.targetLanguageSelect.value,
            translationEnabled: this.isTranslationEnabled,
            wordCount: this.finalTranscriptions.map(item => item.text).join(' ').split(/\s+/).length,
            charCount: this.finalTranscriptions.map(item => item.text).join(' ').length,
            duration: this.sessionStartTime ? Math.round((new Date() - this.sessionStartTime) / 1000) : 0
        };

        let history = this.getHistory();
        history.unshift(session);
        history = history.slice(0, 20);

        localStorage.setItem('transcriptionHistory', JSON.stringify(history));
        this.loadHistory();
    }

    getHistory() {
        try {
            return JSON.parse(localStorage.getItem('transcriptionHistory')) || [];
        } catch {
            return [];
        }
    }

    loadHistory() {
        const history = this.getHistory();
        
        if (history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">Nenhuma sessão anterior encontrada</p>';
            return;
        }

        this.historyList.innerHTML = '';
        
        history.forEach((session) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.onclick = () => this.loadSession(session);
            
            const preview = session.transcriptions.map(t => t.text).join(' ').slice(0, 100);
            const date = new Date(session.date).toLocaleString('pt-BR');
            
            div.innerHTML = `
                <div class="history-item-header">
                    <div class="history-item-date">${date}</div>
                    <div class="history-item-stats">${session.wordCount} palavras</div>
                </div>
                <div class="history-item-preview">${this.escapeHtml(preview)}${preview.length >= 100 ? '...' : ''}</div>
            `;
            
            this.historyList.appendChild(div);
        });
    }

    loadSession(session) {
        if (confirm('Carregar esta sessão? A transcrição atual será substituída.')) {
            this.finalTranscriptions = [...session.transcriptions];
            this.translations = session.translations ? [...session.translations] : [];
            
            this.displayFinalTranscriptions();
            this.displayTranslations();
            this.updateStats();
            
            this.languageSelect.value = session.language;
            if (session.targetLanguage) {
                this.targetLanguageSelect.value = session.targetLanguage;
            }
            if (session.translationEnabled !== undefined) {
                this.translationMode.checked = session.translationEnabled;
                this.toggleTranslation();
            }
        }
    }

    clearHistory() {
        if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
            localStorage.removeItem('transcriptionHistory');
            this.loadHistory();
        }
    }

    saveSettings() {
        const settings = {
            language: this.languageSelect.value,
            continuous: this.continuousMode.checked,
            interimResults: this.interimResults.checked,
            translationEnabled: this.translationMode.checked,
            targetLanguage: this.targetLanguageSelect.value
        };
        
        localStorage.setItem('transcriptionSettings', JSON.stringify(settings));
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('transcriptionSettings'));
            if (settings) {
                this.languageSelect.value = settings.language || 'en-US';
                this.continuousMode.checked = settings.continuous !== false;
                this.interimResults.checked = settings.interimResults !== false;
                this.translationMode.checked = settings.translationEnabled || false;
                this.targetLanguageSelect.value = settings.targetLanguage || 'pt';
                
                this.toggleTranslation();
            }
        } catch {
            this.languageSelect.value = 'en-US';
            this.translationMode.checked = true;
            this.targetLanguageSelect.value = 'pt';
            this.toggleTranslation();
        }
    }

    updateTimestamp() {
        const now = new Date();
        this.timestamp.textContent = now.toLocaleString('pt-BR');
        setTimeout(() => this.updateTimestamp(), 60000);
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.style.display = 'flex';
    }

    hideError() {
        this.errorModal.style.display = 'none';
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDateForFile(date) {
        return date.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TranscritorWeb();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('SW registrado'))
            .catch(error => console.log('SW não registrado'));
    });
}