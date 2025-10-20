// Scanner QR Code para NFCe
class QRCodeScanner {
    constructor() {
        this.codeReader = null;
        this.currentStream = null;
        this.deviceId = null;
        this.devices = [];
        this.currentDeviceIndex = 0;
        this.isScanning = false;
        this.scannedItems = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkCameraPermissions();
    }

    initializeElements() {
        this.video = document.getElementById('scanner-video');
        this.startBtn = document.getElementById('startCamera');
        this.stopBtn = document.getElementById('stopCamera');
        this.switchBtn = document.getElementById('switchCamera');
        this.errorDiv = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.resultDiv = document.getElementById('scanResult');
        this.scannedUrl = document.getElementById('scannedUrl');
        this.itemsPreview = document.getElementById('itemsPreview');
        this.importBtn = document.getElementById('importItems');
        this.scanAgainBtn = document.getElementById('scanAgain');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startScanning());
        this.stopBtn.addEventListener('click', () => this.stopScanning());
        this.switchBtn.addEventListener('click', () => this.switchCamera());
        this.importBtn.addEventListener('click', () => this.importToList());
        this.scanAgainBtn.addEventListener('click', () => this.scanAgain());
    }

    async checkCameraPermissions() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            this.startBtn.style.display = 'inline-block';
        } catch (error) {
            this.showError('Câmera não disponível ou permissão negada. Verifique as configurações do navegador.');
        }
    }

    async startScanning() {
        try {
            this.hideError();
            this.hideResult();
            
            // Inicializa o leitor de código se ainda não foi feito
            if (!this.codeReader) {
                this.codeReader = new ZXing.BrowserQRCodeReader();
            }

            // Obtém lista de dispositivos de vídeo
            this.devices = await this.codeReader.listVideoInputDevices();
            
            if (this.devices.length === 0) {
                throw new Error('Nenhuma câmera encontrada');
            }

            // Usa a câmera atual ou a primeira disponível
            this.deviceId = this.devices[this.currentDeviceIndex]?.deviceId || this.devices[0].deviceId;

            // Inicia o scanner
            this.codeReader.decodeFromVideoDevice(
                this.deviceId,
                this.video,
                (result, error) => {
                    if (result) {
                        this.handleScanResult(result.text);
                    }
                    if (error && !(error instanceof ZXing.NotFoundException)) {
                        console.warn('Erro de scan:', error);
                    }
                }
            );

            this.isScanning = true;
            this.updateButtons();
            
            // Mostra botão para trocar câmera se houver múltiplas
            if (this.devices.length > 1) {
                this.switchBtn.style.display = 'inline-block';
            }

        } catch (error) {
            this.showError(`Erro ao iniciar câmera: ${error.message}`);
            console.error('Erro ao iniciar scanner:', error);
        }
    }

    stopScanning() {
        if (this.codeReader && this.isScanning) {
            this.codeReader.reset();
            this.isScanning = false;
            this.updateButtons();
        }
    }

    async switchCamera() {
        if (this.devices.length <= 1) return;
        
        this.stopScanning();
        this.currentDeviceIndex = (this.currentDeviceIndex + 1) % this.devices.length;
        
        // Pequena pausa antes de iniciar com nova câmera
        setTimeout(() => {
            this.startScanning();
        }, 500);
    }

    updateButtons() {
        if (this.isScanning) {
            this.startBtn.style.display = 'none';
            this.stopBtn.style.display = 'inline-block';
        } else {
            this.startBtn.style.display = 'inline-block';
            this.stopBtn.style.display = 'none';
            this.switchBtn.style.display = 'none';
        }
    }

    handleScanResult(qrText) {
        console.log('QR Code detectado:', qrText);
        
        // Para o scanner após detectar código
        this.stopScanning();
        
        // Mostra resultado
        this.scannedUrl.textContent = qrText;
        
        // Simula extração de itens (em implementação real, faria requisição para API)
        this.extractItemsFromQR(qrText);
        
        this.showResult();
    }

    async extractItemsFromQR(qrUrl) {
        try {
            // Verifica se é uma URL válida de NFCe
            if (this.isValidNFCeUrl(qrUrl)) {
                // Tenta extrair itens da URL real (simulado por enquanto)
                await this.processNFCeUrl(qrUrl);
            } else {
                // Se não for URL válida, usa itens simulados para demonstração
                this.scannedItems = this.generateSimulatedItems();
            }
            
            this.displayItemsPreview();
            
        } catch (error) {
            this.showError(`Erro ao processar QR Code: ${error.message}`);
        }
    }

    isValidNFCeUrl(url) {
        // Verifica se é URL do formato NFCe
        const nfcePatterns = [
            /fazenda\.sp\.gov\.br/,
            /nfce\.fazenda/,
            /sefaz/,
            /nfce/i
        ];
        
        return nfcePatterns.some(pattern => pattern.test(url));
    }

    async processNFCeUrl(url) {
        try {
            // Em uma implementação real, você faria:
            // 1. Requisição para a URL da NFCe
            // 2. Parse do HTML retornado para extrair dados
            // 3. Ou integração com API oficial da Receita
            
            // Por segurança e limitações de CORS, vamos simular
            console.log('Processando URL NFCe:', url);
            
            // Simula delay de processamento
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Extrai parâmetros da URL se possível
            const urlParams = this.extractUrlParams(url);
            
            // Gera itens baseados nos parâmetros ou usa simulação
            this.scannedItems = this.generateItemsFromNFCe(urlParams);
            
        } catch (error) {
            console.error('Erro ao processar NFCe:', error);
            // Fallback para itens simulados
            this.scannedItems = this.generateSimulatedItems();
        }
    }

    extractUrlParams(url) {
        const params = {};
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
        } catch (error) {
            console.warn('Não foi possível extrair parâmetros da URL:', error);
        }
        return params;
    }

    generateItemsFromNFCe(params) {
        // Simula extração baseada nos parâmetros da NFCe
        const itemsPool = [
            { codigo: '00012345', descricao: 'LEITE UHT INTEGRAL', quantidade: 1, valorUnitario: 4.89, valorTotal: 4.89 },
            { codigo: '00023456', descricao: 'PAO FRANCÊS KG', quantidade: 1, valorUnitario: 8.50, valorTotal: 8.50 },
            { codigo: '00034567', descricao: 'OVOS BRANCOS DÚZIA', quantidade: 2, valorUnitario: 7.20, valorTotal: 14.40 },
            { codigo: '00045678', descricao: 'CAFÉ TORRADO MOÍDO', quantidade: 1, valorUnitario: 15.90, valorTotal: 15.90 },
            { codigo: '00056789', descricao: 'AÇÚCAR CRISTAL 1KG', quantidade: 1, valorUnitario: 4.25, valorTotal: 4.25 },
            { codigo: '00067890', descricao: 'ÓLEO DE SOJA 900ML', quantidade: 1, valorUnitario: 8.80, valorTotal: 8.80 },
            { codigo: '00078901', descricao: 'MACARRÃO ESPAGUETE', quantidade: 3, valorUnitario: 3.45, valorTotal: 10.35 },
            { codigo: '00089012', descricao: 'MOLHO DE TOMATE', quantidade: 2, valorUnitario: 2.90, valorTotal: 5.80 }
        ];

        // Número de itens baseado em parâmetros ou aleatório
        const numItems = Math.floor(Math.random() * 5) + 3; // 3-7 itens
        const selectedItems = [];
        const usedIndices = new Set();
        
        for (let i = 0; i < numItems && usedIndices.size < itemsPool.length; i++) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * itemsPool.length);
            } while (usedIndices.has(randomIndex));
            
            usedIndices.add(randomIndex);
            const item = { ...itemsPool[randomIndex] };
            
            // Varia quantidade ocasionalmente
            if (Math.random() < 0.3) {
                const newQtde = Math.floor(Math.random() * 3) + 1;
                item.quantidade = newQtde;
                item.valorTotal = (item.valorUnitario * newQtde);
            }
            
            // Adiciona metadados
            item.dataAtualizacao = new Date().toISOString();
            item.comprado = false;
            
            selectedItems.push(item);
        }
        
        return selectedItems;
    }

    generateSimulatedItems() {
        // Simula itens extraídos da nota fiscal
        const itemsPool = [
            { codigo: '00001234', descricao: 'LEITE INTEGRAL 1L', quantidade: 2, valorUnitario: 4.50, valorTotal: 9.00 },
            { codigo: '00005678', descricao: 'PAO DE ACUCAR 1KG', quantidade: 1, valorUnitario: 3.80, valorTotal: 3.80 },
            { codigo: '00009012', descricao: 'CAFE TORRADO 500G', quantidade: 1, valorUnitario: 12.90, valorTotal: 12.90 },
            { codigo: '00003456', descricao: 'ARROZ BRANCO 5KG', quantidade: 1, valorUnitario: 18.50, valorTotal: 18.50 },
            { codigo: '00007890', descricao: 'FEIJAO PRETO 1KG', quantidade: 2, valorUnitario: 6.75, valorTotal: 13.50 }
        ];

        // Retorna 2-4 itens aleatórios
        const numItems = Math.floor(Math.random() * 3) + 2;
        const selectedItems = [];
        
        for (let i = 0; i < numItems; i++) {
            const randomIndex = Math.floor(Math.random() * itemsPool.length);
            const item = { ...itemsPool[randomIndex] };
            
            // Adiciona timestamp para identificação única
            item.dataAtualizacao = new Date().toISOString();
            item.comprado = false;
            
            selectedItems.push(item);
        }
        
        return selectedItems;
    }

    displayItemsPreview() {
        this.itemsPreview.innerHTML = '';
        
        // Obtém itens existentes da lista principal
        const existingItems = this.getExistingItems();
        
        let newItemsCount = 0;
        let duplicateItemsCount = 0;
        let totalValue = 0;
        
        // Cabeçalho da prévia
        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'background: #4299e1; color: white; padding: 10px; border-radius: 6px 6px 0 0; font-weight: 600; text-align: center;';
        headerDiv.innerHTML = `<i class="fas fa-receipt"></i> Itens Encontrados na Nota Fiscal`;
        this.itemsPreview.appendChild(headerDiv);
        
        this.scannedItems.forEach(item => {
            const isDuplicate = existingItems.some(existing => existing.codigo === item.codigo);
            
            const itemDiv = document.createElement('div');
            itemDiv.className = `preview-item ${isDuplicate ? 'duplicate' : 'new'}`;
            
            itemDiv.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #2d3748; margin-bottom: 4px;">${item.descricao}</div>
                    <div style="font-size: 0.85rem; color: #718096;">
                        <span style="margin-right: 15px;"><i class="fas fa-barcode"></i> ${item.codigo}</span>
                        <span style="margin-right: 15px;"><i class="fas fa-sort-numeric-up"></i> ${item.quantidade}x</span>
                        <span style="margin-right: 15px;"><i class="fas fa-tag"></i> R$ ${item.valorUnitario.toFixed(2)}</span>
                        <span style="font-weight: 600; color: #2b6cb0;"><i class="fas fa-calculator"></i> R$ ${item.valorTotal.toFixed(2)}</span>
                    </div>
                </div>
                <div style="margin-left: 10px;">
                    <span class="${isDuplicate ? 'duplicate-badge' : 'new-badge'}">
                        ${isDuplicate ? '⚠️ JÁ EXISTE' : '✅ NOVO'}
                    </span>
                </div>
            `;
            
            this.itemsPreview.appendChild(itemDiv);
            
            if (isDuplicate) {
                duplicateItemsCount++;
            } else {
                newItemsCount++;
                totalValue += item.valorTotal;
            }
        });
        
        // Rodapé com resumo
        const footerDiv = document.createElement('div');
        footerDiv.style.cssText = 'background: #f7fafc; padding: 15px; border-radius: 0 0 6px 6px; border-top: 1px solid #e2e8f0;';
        
        const summaryHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <span style="color: #48bb78; font-weight: 600;">
                        <i class="fas fa-plus-circle"></i> ${newItemsCount} novo${newItemsCount !== 1 ? 's' : ''}
                    </span>
                    ${duplicateItemsCount > 0 ? `
                        <span style="color: #ed8936; font-weight: 600;">
                            <i class="fas fa-copy"></i> ${duplicateItemsCount} duplicado${duplicateItemsCount !== 1 ? 's' : ''}
                        </span>
                    ` : ''}
                </div>
                <div style="font-weight: 700; color: #2b6cb0; font-size: 1.1rem;">
                    <i class="fas fa-coins"></i> Total: R$ ${totalValue.toFixed(2)}
                </div>
            </div>
        `;
        
        footerDiv.innerHTML = summaryHTML;
        this.itemsPreview.appendChild(footerDiv);
        
        // Atualiza texto do botão de importar
        if (newItemsCount > 0) {
            this.importBtn.innerHTML = `<i class="fas fa-download"></i> Importar ${newItemsCount} Item${newItemsCount !== 1 ? 's' : ''} (R$ ${totalValue.toFixed(2)})`;
            this.importBtn.disabled = false;
            this.importBtn.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        } else {
            this.importBtn.innerHTML = `<i class="fas fa-info-circle"></i> Todos os itens já existem na lista`;
            this.importBtn.disabled = true;
            this.importBtn.style.background = '#a0aec0';
        }
        
        // Mostra aviso sobre duplicados se houver
        if (duplicateItemsCount > 0) {
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = 'background: linear-gradient(135deg, #fef5e7, #fed7aa); border: 2px solid #ed8936; color: #c05621; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; font-weight: 600;';
            warningDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="font-size: 1.2rem; margin-right: 8px;"></i> 
                ${duplicateItemsCount} item${duplicateItemsCount !== 1 ? 's' : ''} 
                ${duplicateItemsCount !== 1 ? 'já existem' : 'já existe'} na sua lista e 
                ${duplicateItemsCount !== 1 ? 'serão ignorados' : 'será ignorado'} na importação
            `;
            
            this.itemsPreview.appendChild(warningDiv);
        }
    }

    getExistingItems() {
        // Obtém itens da lista principal através do localStorage
        const stored = localStorage.getItem('shoppingItems');
        return stored ? JSON.parse(stored) : [];
    }

    importToList() {
        const existingItems = this.getExistingItems();
        const newItems = this.scannedItems.filter(scannedItem => 
            !existingItems.some(existing => existing.codigo === scannedItem.codigo)
        );
        
        if (newItems.length === 0) {
            this.showError('Nenhum item novo para importar.');
            return;
        }
        
        // Verifica se há itens com códigos similares (para atualizar preços)
        const priceUpdates = [];
        this.scannedItems.forEach(scannedItem => {
            const existingItem = existingItems.find(existing => existing.codigo === scannedItem.codigo);
            if (existingItem && existingItem.valorUnitario !== scannedItem.valorUnitario) {
                priceUpdates.push({
                    codigo: scannedItem.codigo,
                    descricao: scannedItem.descricao,
                    precoAntigo: existingItem.valorUnitario,
                    precoNovo: scannedItem.valorUnitario,
                    data: new Date().toISOString(),
                    variacao: scannedItem.valorUnitario - existingItem.valorUnitario
                });
                
                // Atualiza o preço do item existente
                existingItem.valorUnitario = scannedItem.valorUnitario;
                existingItem.valorTotal = existingItem.quantidade * scannedItem.valorUnitario;
                existingItem.dataAtualizacao = new Date().toISOString();
            }
        });
        
        // Adiciona novos itens à lista existente
        const updatedItems = [...existingItems, ...newItems];
        
        // Salva no localStorage
        localStorage.setItem('shoppingItems', JSON.stringify(updatedItems));
        
        // Atualiza histórico de preços se houver mudanças
        if (priceUpdates.length > 0) {
            this.updatePriceHistory(priceUpdates);
        }
        
        // Prepara mensagem de confirmação
        let message = `✅ ${newItems.length} item${newItems.length !== 1 ? 's' : ''} importado${newItems.length !== 1 ? 's' : ''} com sucesso!`;
        
        if (priceUpdates.length > 0) {
            message += `\n📊 ${priceUpdates.length} preço${priceUpdates.length !== 1 ? 's' : ''} atualizado${priceUpdates.length !== 1 ? 's' : ''} no histórico.`;
        }
        
        // Mostra confirmação
        alert(message);
        
        // Redireciona para a lista principal
        window.location.href = 'index.html';
    }

    updatePriceHistory(priceUpdates) {
        // Obtém histórico existente
        const stored = localStorage.getItem('priceHistory');
        const existingHistory = stored ? JSON.parse(stored) : [];
        
        // Adiciona novas entradas no início do histórico
        const updatedHistory = [...priceUpdates, ...existingHistory];
        
        // Mantém apenas os últimos 50 registros
        if (updatedHistory.length > 50) {
            updatedHistory.splice(50);
        }
        
        // Salva histórico atualizado
        localStorage.setItem('priceHistory', JSON.stringify(updatedHistory));
    }

    scanAgain() {
        this.hideResult();
        this.scannedItems = [];
        this.startScanning();
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorDiv.classList.add('show');
    }

    hideError() {
        this.errorDiv.classList.remove('show');
    }

    showResult() {
        this.resultDiv.classList.add('show');
    }

    hideResult() {
        this.resultDiv.classList.remove('show');
    }
}

// Inicializa o scanner quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se a biblioteca ZXing foi carregada
    if (typeof ZXing !== 'undefined') {
        window.qrScanner = new QRCodeScanner();
    } else {
        console.error('Biblioteca ZXing não carregada');
        document.getElementById('errorMessage').classList.add('show');
        document.getElementById('errorText').textContent = 'Erro ao carregar biblioteca de scanner. Verifique sua conexão com a internet.';
    }
});