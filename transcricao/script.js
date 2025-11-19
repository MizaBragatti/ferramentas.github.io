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
        
        // Controles de timeout para reconhecimento
        this.recognitionTimeout = null;
        this.maxRecognitionTime = 30000; // 30 segundos sem resultado
        this.translationQueue = [];
        this.isTranslating = false;
        
        // Controles para gravação
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordedAudio = null;
        this.transcriptionMode = 'live';
        this.isSimultaneousMode = false; // Nova propriedade para gravação + transcrição
        this.recognitionTimeout = null;
        
        // Proteção contra substituição de texto
        this.processedResultsSet = new Set(); // Set para rastrear resultados já processados
        this.lastConfidentResult = ''; // Último resultado confiável processado
        this.currentSessionId = null; // ID da sessão atual para resetar proteções
        this.cleanupInterval = null; // Interval para limpeza automática
        
        this.initializeElements();
        this.checkBrowserSupport();
        this.setupEventListeners();
        this.loadSettings();
        this.loadHistory();
        this.updateTimestamp();
        
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }

    initializeElements() {
        // Botões de controle
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.recordBtn = document.getElementById('recordBtn');
        this.stopRecordBtn = document.getElementById('stopRecordBtn');
        this.transcribeBtn = document.getElementById('transcribeBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');

        // Player de áudio
        this.audioPlayerContainer = document.getElementById('audioPlayerContainer');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.downloadAudioBtn = document.getElementById('downloadAudioBtn');
        this.deleteAudioBtn = document.getElementById('deleteAudioBtn');
        this.audioInfo = document.getElementById('audioInfo');

        // Seleção de modo
        this.liveMode = document.getElementById('liveMode');
        this.recordMode = document.getElementById('recordMode');
        this.liveControls = document.getElementById('liveControls');
        this.recordControls = document.getElementById('recordControls');

        // Configurações
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
            const transcript = result[0].transcript.trim();
            const confidence = result[0].confidence || 0;
            
            if (result.isFinal) {
                // Verificar se este resultado já foi processado
                const resultHash = this.generateResultHash(transcript, i);
                
                if (!this.processedResultsSet.has(resultHash)) {
                    // Verificar se não é uma repetição do último resultado confiável
                    if (!this.isDuplicateResult(transcript)) {
                        finalTranscript += transcript + ' ';
                        hasNewFinal = true;
                        
                        // Marcar como processado
                        this.processedResultsSet.add(resultHash);
                        
                        // Atualizar último resultado confiável se a confiança é boa
                        if (confidence > 0.7 || confidence === undefined) {
                            this.lastConfidentResult = transcript;
                        }
                    } else {
                        console.log('Resultado duplicado ignorado:', transcript);
                    }
                }
                
                this.lastResultIndex = i + 1; // Atualizar índice para próxima vez
            } else {
                // Para resultados interim, apenas mostrar se não for muito similar ao último final
                if (!this.isDuplicateResult(transcript)) {
                    interimTranscript += transcript;
                }
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

    // Funções auxiliares para evitar duplicação de resultados
    generateResultHash(transcript, index) {
        // Criar hash único baseado no conteúdo e posição
        return `${transcript.toLowerCase().replace(/[^\w\s]/g, '')}_${index}_${Date.now()}`;
    }

    isDuplicateResult(transcript) {
        if (!transcript || transcript.length < 3) return true;
        
        const normalizedTranscript = transcript.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const normalizedLast = this.lastConfidentResult.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Se não há último resultado, não é duplicado
        if (!normalizedLast) return false;
        
        // Verificar se é exatamente igual ao último resultado
        if (normalizedTranscript === normalizedLast) {
            return true;
        }
        
        // Verificar se o novo resultado está totalmente contido no último
        if (normalizedLast.includes(normalizedTranscript) && normalizedTranscript.length < normalizedLast.length) {
            return true;
        }
        
        // Verificar se o último resultado está contido no novo (possível extensão)
        if (normalizedTranscript.includes(normalizedLast) && normalizedLast.length > 0) {
            // Se o novo resultado apenas estende o anterior, não é duplicado
            const extension = normalizedTranscript.replace(normalizedLast, '').trim();
            if (extension.length > 2) { // Extensão significativa
                return false;
            }
        }
        
        // Verificar similaridade alta (possível reprocessamento com pequenas variações)
        if (this.calculateSimilarity(normalizedTranscript, normalizedLast) > 0.9) {
            return true;
        }
        
        // Verificar se são palavras muito similares (typos ou variações)
        const words1 = normalizedTranscript.split(/\s+/);
        const words2 = normalizedLast.split(/\s+/);
        
        if (words1.length === words2.length && words1.length > 0) {
            let similarWords = 0;
            for (let i = 0; i < words1.length; i++) {
                if (words1[i] === words2[i] || this.calculateSimilarity(words1[i], words2[i]) > 0.8) {
                    similarWords++;
                }
            }
            
            // Se mais de 80% das palavras são similares, considerar duplicado
            if (similarWords / words1.length > 0.8) {
                return true;
            }
        }
        
        return false;
    }

    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;
        if (str1 === str2) return 1;
        
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1;
        
        const editDistance = this.getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    getEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    resetDuplicateProtection() {
        // Resetar proteções quando iniciar nova sessão
        this.processedResultsSet.clear();
        this.lastConfidentResult = '';
        this.currentSessionId = Date.now() + '_' + Math.random();
        console.log('Proteção anti-duplicação resetada para nova sessão');
        
        // Configurar limpeza periódica do Set para evitar memory leak
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            if (this.processedResultsSet.size > 100) {
                // Manter apenas os últimos 50 resultados
                const entries = Array.from(this.processedResultsSet);
                this.processedResultsSet.clear();
                entries.slice(-50).forEach(entry => this.processedResultsSet.add(entry));
                console.log('Limpeza automática do cache de resultados processados');
            }
        }, 60000); // Verificar a cada minuto
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
            
            // Sincronizar scroll da área de tradução se estiver visível
            if (this.translationArea && this.translationArea.style.display !== 'none') {
                this.scrollTranslationToBottom();
            }
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
        // Controles de transcrição em tempo real
        this.startBtn.addEventListener('click', () => this.startRecognition());
        this.stopBtn.addEventListener('click', () => this.stopRecognition());
        
        // Controles de gravação
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordBtn.addEventListener('click', () => this.stopRecording());
        this.transcribeBtn.addEventListener('click', () => this.transcribeAudio());
        
        // Player de áudio
        this.playBtn.addEventListener('click', () => this.togglePlayback());
        this.downloadAudioBtn.addEventListener('click', () => this.downloadAudio());
        this.deleteAudioBtn.addEventListener('click', () => this.deleteAudio());
        
        // Event listeners do elemento de áudio
        if (this.audioPlayer) {
            this.audioPlayer.addEventListener('ended', () => {
                this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
                // Garantir que todos os botões permaneçam habilitados
                this.playBtn.disabled = false;
                this.downloadAudioBtn.disabled = false;
                this.deleteAudioBtn.disabled = false;
                this.transcribeBtn.disabled = false;
            });
            
            this.audioPlayer.addEventListener('error', (event) => {
                // Só mostrar erro se o player estiver visível e há um áudio válido
                if (this.audioPlayerContainer.style.display !== 'none' && this.currentAudioBlob) {
                    console.error('Erro no player de áudio:', event);
                    this.showError('Erro ao reproduzir áudio.');
                }
                this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
                // Manter botões habilitados mesmo em caso de erro
                this.playBtn.disabled = false;
                this.downloadAudioBtn.disabled = false;
                this.deleteAudioBtn.disabled = false;
                this.transcribeBtn.disabled = false;
            });
            
            this.audioPlayer.addEventListener('play', () => {
                this.playBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            });
            
            this.audioPlayer.addEventListener('pause', () => {
                this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
            });
        }
        
        // Seleção de modo
        this.liveMode.addEventListener('change', () => this.switchMode('live'));
        this.recordMode.addEventListener('change', () => this.switchMode('record'));
        
        // Controles gerais
        this.clearBtn.addEventListener('click', () => this.clearTranscription());
        this.downloadBtn.addEventListener('click', () => this.downloadTranscription());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Configurações
        this.languageSelect.addEventListener('change', () => this.updateLanguage());
        this.continuousMode.addEventListener('change', () => this.saveSettings());
        this.interimResults.addEventListener('change', () => this.updateInterimResults());
        this.translationMode.addEventListener('change', () => this.toggleTranslation());
        this.targetLanguageSelect.addEventListener('change', () => this.updateTargetLanguage());

        // Sincronização de scroll entre as colunas
        this.setupScrollSync();

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
            this.resetDuplicateProtection(); // Reset proteção anti-duplicação
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

    // ==================== FUNCIONALIDADES DE GRAVAÇÃO ====================

    switchMode(mode) {
        this.transcriptionMode = mode;
        
        if (mode === 'live') {
            this.liveControls.style.display = 'flex';
            this.recordControls.style.display = 'none';
            this.hideAudioPlayer(); // Esconder player ao trocar para modo ao vivo
            
            // Parar gravação se estiver ativa
            if (this.isRecording) {
                this.stopRecording();
            }
        } else {
            this.liveControls.style.display = 'none';
            this.recordControls.style.display = 'flex';
            
            // Parar transcrição se estiver ativa
            if (this.isListening) {
                this.stopRecognition();
            }
        }
        
        this.saveSettings();
    }

    async startRecording() {
        if (this.isRecording) return;
        
        try {
            this.showLoading('Iniciando gravação com transcrição...');
            
            // Solicitar permissão para microfone
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            
            this.audioChunks = [];
            
            // Configurar MediaRecorder
            const options = {
                mimeType: 'audio/webm;codecs=opus'
            };
            
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'audio/webm';
            }
            
            this.mediaRecorder = new MediaRecorder(stream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                // Parar transcrição se estiver ativa
                if (this.isSimultaneousMode && this.isListening) {
                    this.stopSimultaneousRecognition();
                }
                
                // Criar arquivo de áudio a partir dos chunks
                const audioBlob = new Blob(this.audioChunks, { 
                    type: this.mediaRecorder.mimeType 
                });
                
                this.recordedAudio = audioBlob;
                
                // Parar stream do microfone
                stream.getTracks().forEach(track => track.stop());
                
                // Mostrar player de áudio
                this.showAudioPlayer(audioBlob);
                
                // Salvar sessão se houve transcrições
                if (this.finalTranscriptions.length > 0) {
                    this.saveSession();
                }
                
                // Esconder loading
                this.hideLoading();
                
                // Limpar chunks para próxima gravação
                this.audioChunks = [];
                
                // Resetar modo simultâneo
                this.isSimultaneousMode = false;
            };
            
            this.mediaRecorder.onerror = (event) => {
                console.error('Erro no MediaRecorder:', event.error);
                this.hideLoading();
                this.showError('Erro durante a gravação: ' + event.error);
                
                // Parar transcrição se estiver ativa
                if (this.isSimultaneousMode && this.isListening) {
                    this.stopSimultaneousRecognition();
                }
                
                // Parar stream
                stream.getTracks().forEach(track => track.stop());
                this.isRecording = false;
                this.isSimultaneousMode = false;
                this.updateRecordingUI();
            };
            
            // Iniciar gravação
            this.mediaRecorder.start(1000); // Chunk a cada segundo
            this.isRecording = true;
            this.isSimultaneousMode = true;
            this.sessionStartTime = new Date();
            
            // Iniciar transcrição simultânea
            await this.startSimultaneousRecognition();
            
            this.updateRecordingUI();
            this.hideLoading();
            
        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            this.hideLoading();
            this.isSimultaneousMode = false;
            
            if (error.name === 'NotAllowedError') {
                this.showError('Permissão negada para acessar o microfone. Clique no ícone de microfone na barra de endereços e permita o acesso.');
            } else {
                this.showError('Erro ao acessar o microfone: ' + error.message);
            }
        }
    }

    // Nova função para iniciar reconhecimento simultâneo à gravação
    async startSimultaneousRecognition() {
        if (!this.recognition) return;
        
        try {
            // Configurar reconhecimento para capturar durante gravação
            this.recognition.lang = this.languageSelect.value;
            this.recognition.continuous = true;
            this.recognition.interimResults = this.interimResults.checked;
            this.recognition.maxAlternatives = 1;
            
            // Reset do índice para nova sessão
            this.lastResultIndex = 0;
            this.resetDuplicateProtection(); // Reset proteção anti-duplicação
            
            // Configurar eventos específicos para modo simultâneo
            const originalOnResult = this.recognition.onresult;
            const originalOnEnd = this.recognition.onend;
            const originalOnError = this.recognition.onerror;
            const originalOnStart = this.recognition.onstart;
            
            this.recognition.onstart = () => {
                console.log('Reconhecimento simultâneo iniciado');
                this.isListening = true;
                this.updateUI();
                
                // Iniciar timeout de segurança
                this.startRecognitionTimeout();
                
                // Chamar handler original se existir
                if (originalOnStart) originalOnStart();
            };
            
            this.recognition.onresult = (event) => {
                if (!this.isSimultaneousMode) return; // Só processar se estiver no modo simultâneo
                
                if (this.isProcessingResult) return;
                this.isProcessingResult = true;
                
                try {
                    // Resetar timeout quando houver atividade
                    this.resetRecognitionTimeout();
                    
                    this.processResults(event);
                } finally {
                    this.isProcessingResult = false;
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Erro no reconhecimento simultâneo:', event.error);
                this.isProcessingResult = false;
                
                // Lista de erros "normais" que não devem interromper
                const normalErrors = ['no-speech', 'audio-capture', 'network', 'aborted'];
                
                if (!normalErrors.includes(event.error)) {
                    console.warn('Erro significativo no reconhecimento:', event.error);
                    
                    // Para erros críticos, tentar reiniciar após delay
                    if (this.isSimultaneousMode && this.isRecording) {
                        setTimeout(() => {
                            if (this.isSimultaneousMode && this.isRecording && !this.isListening) {
                                console.log('Tentando recuperar de erro crítico...');
                                this.restartSimultaneousRecognition();
                            }
                        }, 2000);
                    }
                } else {
                    console.log('Erro normal ignorado:', event.error);
                }
            };
            
            this.recognition.onend = () => {
                console.log('Reconhecimento simultâneo encerrado');
                this.isListening = false;
                
                // Tentar reiniciar se ainda estiver gravando
                if (this.isSimultaneousMode && this.isRecording) {
                    console.log('Reiniciando reconhecimento durante gravação...');
                    // Aumentar delay e adicionar verificação de estado
                    setTimeout(() => {
                        if (this.isSimultaneousMode && this.isRecording && !this.isListening) {
                            this.restartSimultaneousRecognition();
                        }
                    }, 1000);
                } else {
                    // Restaurar handlers originais se não estiver mais gravando
                    this.recognition.onresult = originalOnResult;
                    this.recognition.onend = originalOnEnd;
                    this.recognition.onerror = originalOnError;
                    this.recognition.onstart = originalOnStart;
                    this.updateUI();
                }
            };
            
            // Iniciar reconhecimento
            this.recognition.start();
            
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento simultâneo:', error);
            this.isSimultaneousMode = false;
            throw error;
        }
    }

    // Função para reiniciar reconhecimento durante gravação
    async restartSimultaneousRecognition() {
        if (!this.isSimultaneousMode || !this.isRecording || this.isListening) {
            console.log('Cancelando reinicialização - condições não atendidas');
            return;
        }
        
        try {
            console.log('Tentando reiniciar reconhecimento...');
            
            // Pausa maior para estabilizar
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verificar novamente as condições após pausa
            if (!this.isSimultaneousMode || !this.isRecording || this.isListening) {
                return;
            }
            
            // Tentar iniciar novamente
            this.recognition.start();
            
        } catch (error) {
            console.error('Erro ao reiniciar reconhecimento:', error);
            
            // Se for erro de "already started", ignorar
            if (error.message && error.message.includes('already started')) {
                console.log('Reconhecimento já estava ativo');
                return;
            }
            
            // Tentar novamente após delay maior apenas se ainda estivermos gravando
            if (this.isSimultaneousMode && this.isRecording && !this.isListening) {
                console.log('Agendando nova tentativa de reinicialização...');
                setTimeout(() => {
                    if (this.isSimultaneousMode && this.isRecording && !this.isListening) {
                        this.restartSimultaneousRecognition();
                    }
                }, 2000);
            }
        }
    }

    // Função para parar reconhecimento simultâneo
    stopSimultaneousRecognition() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Erro ao parar reconhecimento:', error);
            }
        }
        
        // Limpar timeout se existir
        this.clearRecognitionTimeout();
        
        this.isListening = false;
        this.isSimultaneousMode = false;
    }

    // Funções para controle de timeout do reconhecimento
    startRecognitionTimeout() {
        // Limpar timeout anterior se existir
        this.clearRecognitionTimeout();
        
        // Configurar novo timeout
        this.recognitionTimeout = setTimeout(() => {
            console.log('Timeout do reconhecimento - reiniciando...');
            
            if (this.isSimultaneousMode && this.isRecording) {
                // Parar reconhecimento atual
                if (this.isListening) {
                    try {
                        this.recognition.stop();
                    } catch (error) {
                        console.error('Erro ao parar reconhecimento no timeout:', error);
                    }
                }
                
                // Tentar reiniciar após pausa
                setTimeout(() => {
                    if (this.isSimultaneousMode && this.isRecording && !this.isListening) {
                        this.restartSimultaneousRecognition();
                    }
                }, 1000);
            }
        }, this.maxRecognitionTime);
    }

    clearRecognitionTimeout() {
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
    }

    resetRecognitionTimeout() {
        // Reiniciar timeout quando houver atividade
        if (this.isSimultaneousMode && this.isRecording && this.isListening) {
            this.startRecognitionTimeout();
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) return;
        
        this.showLoading('Finalizando gravação...');
        
        // Parar gravação
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        // O reconhecimento será parado automaticamente no evento onstop do MediaRecorder
        
        this.updateRecordingUI();
    }

    async transcribeRecordedAudio() {
        if (!this.recordedAudio) return;
        
        try {
            // Converter blob para File
            const audioFile = new File([this.recordedAudio], 'recording.webm', {
                type: this.recordedAudio.type
            });
            
            // Usar Web Speech API com áudio gravado
            // Nota: A Web Speech API não suporta diretamente arquivos de áudio
            // Então vamos simular reproduzindo o áudio e capturando
            await this.transcribeFromAudioPlayback(this.recordedAudio);
            
        } catch (error) {
            console.error('Erro na transcrição:', error);
            this.showError('Erro ao transcrever áudio gravado.');
        } finally {
            this.hideLoading();
        }
    }

    async transcribeFromAudioPlayback(audioBlob) {
        return new Promise((resolve, reject) => {
            // Criar elemento de áudio para reprodução
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(audioBlob);
            audio.style.display = 'none';
            document.body.appendChild(audio);
            
            // Configurar reconhecimento para capturar durante reprodução
            if (!this.recognition) {
                reject(new Error('Reconhecimento de voz não disponível'));
                return;
            }
            
            // Resetar arrays de transcrição para a gravação
            const originalTranscriptions = [...this.finalTranscriptions];
            this.finalTranscriptions = [];
            this.lastResultIndex = 0;
            
            // Configurar eventos do reconhecimento
            const originalOnResult = this.recognition.onresult;
            const originalOnEnd = this.recognition.onend;
            const originalOnError = this.recognition.onerror;
            
            let hasResults = false;
            
            this.recognition.onresult = (event) => {
                hasResults = true;
                if (this.isProcessingResult) return;
                this.isProcessingResult = true;
                
                try {
                    this.processResults(event);
                } finally {
                    this.isProcessingResult = false;
                }
            };
            
            this.recognition.onend = () => {
                console.log('Transcrição do áudio gravado concluída');
                
                // Restaurar handlers originais
                this.recognition.onresult = originalOnResult;
                this.recognition.onend = originalOnEnd;
                this.recognition.onerror = originalOnError;
                
                // Limpar elemento de áudio
                document.body.removeChild(audio);
                URL.revokeObjectURL(audio.src);
                
                if (hasResults) {
                    // Mesclar com transcrições anteriores se existirem
                    this.finalTranscriptions = [...originalTranscriptions, ...this.finalTranscriptions];
                    this.displayFinalTranscriptions();
                    this.updateStats();
                    this.saveSession();
                } else {
                    this.finalTranscriptions = originalTranscriptions;
                    this.showError('Nenhuma fala detectada no áudio gravado.');
                }
                
                resolve();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Erro na transcrição:', event.error);
                
                // Restaurar handlers originais
                this.recognition.onresult = originalOnResult;
                this.recognition.onend = originalOnEnd;
                this.recognition.onerror = originalOnError;
                
                // Restaurar transcrições originais
                this.finalTranscriptions = originalTranscriptions;
                
                // Limpar elemento de áudio
                document.body.removeChild(audio);
                URL.revokeObjectURL(audio.src);
                
                reject(new Error('Erro no reconhecimento: ' + event.error));
            };
            
            // Configurar reprodução
            audio.onended = () => {
                // Aguardar um pouco para capturar últimas palavras
                setTimeout(() => {
                    if (this.recognition && this.isListening) {
                        this.recognition.stop();
                    }
                }, 1000);
            };
            
            // Iniciar reconhecimento e reprodução simultaneamente
            try {
                this.recognition.lang = this.languageSelect.value;
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                
                this.recognition.start();
                
                // Aguardar um pouco e iniciar reprodução
                setTimeout(() => {
                    audio.volume = 1.0; // Volume máximo para melhor captura
                    audio.play();
                }, 500);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    updateRecordingUI() {
        if (this.isRecording) {
            this.recordBtn.disabled = true;
            this.stopRecordBtn.disabled = false;
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<i class="fas fa-circle"></i> Gravando...';
            
            // Mostrar status de gravação + transcrição simultânea
            if (this.isSimultaneousMode && this.isListening) {
                this.statusIndicator.classList.add('recording', 'listening');
                this.statusIndicator.innerHTML = '<i class="fas fa-circle"></i> <i class="fas fa-microphone"></i> <span>Gravando e Transcrevendo</span>';
            } else {
                this.statusIndicator.classList.add('recording');
                this.statusIndicator.innerHTML = '<i class="fas fa-circle"></i> <span>Gravando Áudio</span>';
            }
            
        } else {
            this.recordBtn.disabled = false;
            this.stopRecordBtn.disabled = true;
            this.recordBtn.classList.remove('recording');
            this.recordBtn.innerHTML = '<i class="fas fa-circle"></i> Iniciar Gravação';
            
            this.statusIndicator.classList.remove('recording', 'listening');
            this.statusIndicator.innerHTML = '<i class="fas fa-microphone-slash"></i> <span>Parado</span>';
            
            // Garantir que os botões do player de áudio permaneçam habilitados se existir áudio
            if (this.currentAudioBlob && this.audioPlayerContainer.style.display === 'block') {
                this.playBtn.disabled = false;
                this.downloadAudioBtn.disabled = false;
                this.deleteAudioBtn.disabled = false;
                this.transcribeBtn.disabled = false;
            }
        }
    }

    // ==================== RESTO DOS MÉTODOS ====================
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
            
            // Status específico para modo simultâneo
            if (this.isSimultaneousMode && this.isRecording) {
                this.statusIndicator.innerHTML = '<i class="fas fa-microphone bounce"></i> <span id="statusText">Gravando e Transcrevendo</span>';
            } else {
                this.statusIndicator.innerHTML = '<i class="fas fa-microphone"></i> <span id="statusText">Escutando</span>';
            }
            
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
            targetLanguage: this.targetLanguageSelect.value,
            transcriptionMode: this.transcriptionMode
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
                this.transcriptionMode = settings.transcriptionMode || 'live';
                
                // Aplicar modo salvo
                if (this.transcriptionMode === 'record') {
                    this.recordMode.checked = true;
                    this.switchMode('record');
                } else {
                    this.liveMode.checked = true;
                    this.switchMode('live');
                }
                
                this.toggleTranslation();
            }
        } catch {
            this.languageSelect.value = 'en-US';
            this.translationMode.checked = true;
            this.targetLanguageSelect.value = 'pt';
            this.transcriptionMode = 'live';
            this.liveMode.checked = true;
            this.switchMode('live');
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

    showLoading(message = 'Inicializando reconhecimento de voz...') {
        this.loadingOverlay.style.display = 'flex';
        const loadingText = this.loadingOverlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
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

    // Sincronização de scroll entre colunas
    setupScrollSync() {
        let isScrolling = false;
        
        // Sincronizar scroll da esquerda para a direita
        this.transcriptionArea.addEventListener('scroll', () => {
            if (isScrolling || !this.isTranslationEnabled) return;
            
            isScrolling = true;
            requestAnimationFrame(() => {
                const scrollPercentage = this.transcriptionArea.scrollTop / 
                    (this.transcriptionArea.scrollHeight - this.transcriptionArea.clientHeight);
                
                const translationScrollTop = scrollPercentage * 
                    (this.translationArea.scrollHeight - this.translationArea.clientHeight);
                
                this.translationArea.scrollTop = translationScrollTop;
                isScrolling = false;
            });
        });

        // Sincronizar scroll da direita para a esquerda
        this.translationArea.addEventListener('scroll', () => {
            if (isScrolling || !this.isTranslationEnabled) return;
            
            isScrolling = true;
            requestAnimationFrame(() => {
                const scrollPercentage = this.translationArea.scrollTop / 
                    (this.translationArea.scrollHeight - this.translationArea.clientHeight);
                
                const transcriptionScrollTop = scrollPercentage * 
                    (this.transcriptionArea.scrollHeight - this.transcriptionArea.clientHeight);
                
                this.transcriptionArea.scrollTop = transcriptionScrollTop;
                isScrolling = false;
            });
        });
    }

    // Funções do Player de Áudio
    showAudioPlayer(audioBlob) {
        // Criar URL do áudio
        this.currentAudioBlob = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Configurar o player
        this.audioPlayer.src = audioUrl;
        
        // Mostrar informações do áudio
        const duration = audioBlob.size > 0 ? 'Áudio gravado' : 'Sem áudio';
        const size = (audioBlob.size / 1024).toFixed(1) + ' KB';
        this.audioInfo.textContent = `${duration} - ${size}`;
        
        // Mostrar container do player
        this.audioPlayerContainer.style.display = 'block';
        
        // Resetar botão de play e garantir que todos os botões estejam habilitados
        this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
        this.playBtn.disabled = false;
        this.downloadAudioBtn.disabled = false;
        this.deleteAudioBtn.disabled = false;
        this.transcribeBtn.disabled = false;
    }

    hideAudioPlayer() {
        // Parar reprodução se estiver ativa
        if (!this.audioPlayer.paused) {
            this.audioPlayer.pause();
        }
        
        // Limpar source antes de esconder
        const currentSrc = this.audioPlayer.src;
        this.audioPlayer.src = '';
        
        // Revogar URL se existir
        if (currentSrc && currentSrc.startsWith('blob:')) {
            URL.revokeObjectURL(currentSrc);
        }
        
        // Esconder container
        this.audioPlayerContainer.style.display = 'none';
        
        // Resetar botão de play
        this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
        
        // Limpar referência do blob
        this.currentAudioBlob = null;
    }

    togglePlayback() {
        try {
            if (!this.audioPlayer.src || !this.currentAudioBlob) {
                this.showError('Nenhum áudio disponível para reproduzir.');
                return;
            }

            if (this.audioPlayer.paused) {
                this.audioPlayer.play().then(() => {
                    this.playBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
                }).catch(error => {
                    console.error('Erro ao reproduzir áudio:', error);
                    this.showError('Erro ao reproduzir áudio. Tente gravar novamente.');
                });
            } else {
                this.audioPlayer.pause();
                this.playBtn.innerHTML = '<i class="fas fa-play"></i> Reproduzir';
            }
            
            // Garantir que os outros botões permaneçam habilitados
            this.downloadAudioBtn.disabled = false;
            this.deleteAudioBtn.disabled = false;
        } catch (error) {
            console.error('Erro no controle de reprodução:', error);
            this.showError('Erro ao controlar reprodução do áudio.');
        }
    }

    downloadAudio() {
        if (!this.currentAudioBlob) {
            this.showError('Nenhum áudio disponível para download.');
            return;
        }

        const url = URL.createObjectURL(this.currentAudioBlob);
        const a = document.createElement('a');
        const timestamp = this.formatDateForFile(new Date());
        
        a.href = url;
        a.download = `gravacao_${timestamp}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    deleteAudio() {
        if (confirm('Tem certeza que deseja excluir esta gravação?')) {
            this.hideAudioPlayer();
            this.clearTranscription();
            
            // Resetar estado da gravação
            this.isRecording = false;
            this.mediaRecorder = null;
            this.recordedChunks = [];
            
            // Atualizar UI
            this.updateUI();
        }
    }

    transcribeAudio() {
        if (!this.currentAudioBlob) {
            this.showError('Nenhum áudio disponível para transcrever.');
            return;
        }

        // Por enquanto, mostrar mensagem informativa
        // A transcrição de áudio gravado requer uma API externa
        this.showError('A transcrição de áudio gravado ainda não está implementada. Esta funcionalidade requer uma API de reconhecimento de fala que aceite arquivos de áudio.');
        
        // TODO: Implementar transcrição de arquivo de áudio
        // Isso requereria um serviço como:
        // - Google Cloud Speech-to-Text
        // - Azure Speech Services  
        // - AWS Transcribe
        // - AssemblyAI
        // Ou converter o áudio para texto usando Web Audio API + análise local
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