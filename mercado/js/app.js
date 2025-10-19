// Classe para gerenciar itens da lista de compras
class ShoppingListManager {
    constructor() {
        this.items = this.loadItems();
        this.priceHistory = this.loadPriceHistory();
        this.editingIndex = -1;
        this.initializeEventListeners();
        this.renderItems();
        this.updateTotal();
    }

    // Carrega itens do localStorage
    loadItems() {
        const stored = localStorage.getItem('shoppingItems');
        if (stored) {
            return JSON.parse(stored);
        } else {
            // Retorna itens de exemplo na primeira execução
            return this.getExampleItems();
        }
    }

    // Retorna itens de exemplo baseados na lista fornecida
    getExampleItems() {
        return [
            {
                codigo: '00049070',
                descricao: 'SACOLA INSTITUCIONAL',
                quantidade: 6,
                valorUnitario: 0.24,
                valorTotal: 1.44,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00005614',
                descricao: 'MAC. NISSIN LAMEN',
                quantidade: 5,
                valorUnitario: 2.29,
                valorTotal: 11.45,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00074952',
                descricao: 'BISC. CHOCOLICIA RECH',
                quantidade: 3,
                valorUnitario: 4.98,
                valorTotal: 14.94,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00003598',
                descricao: 'BISC. BELA VISTA',
                quantidade: 1,
                valorUnitario: 4.39,
                valorTotal: 4.39,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00077551',
                descricao: 'BISC. TOSTINES',
                quantidade: 1,
                valorUnitario: 4.39,
                valorTotal: 4.39,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00007248',
                descricao: 'BISNAGUINHA PANCO',
                quantidade: 1,
                valorUnitario: 6.99,
                valorTotal: 6.99,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00068629',
                descricao: 'BATATA PALHA',
                quantidade: 1,
                valorUnitario: 21.90,
                valorTotal: 21.90,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00046895',
                descricao: 'PAO SOVADO PANCO',
                quantidade: 1,
                valorUnitario: 12.48,
                valorTotal: 12.48,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00017930',
                descricao: 'ACUC. CRISTAL CUCAR',
                quantidade: 1,
                valorUnitario: 4.10,
                valorTotal: 4.10,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00032503',
                descricao: 'GRANOLA VILLAMAR',
                quantidade: 1,
                valorUnitario: 7.90,
                valorTotal: 7.90,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00034808',
                descricao: 'LEITE L. V. ITALAC INT',
                quantidade: 2,
                valorUnitario: 5.15,
                valorTotal: 10.30,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00023113',
                descricao: 'AZEITE ANDOR EX. VIRG',
                quantidade: 2,
                valorUnitario: 29.40,
                valorTotal: 58.80,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00035719',
                descricao: 'CAFE MELITTA',
                quantidade: 1,
                valorUnitario: 33.78,
                valorTotal: 33.78,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00012658',
                descricao: 'ARROZ CAMIL AG. T1',
                quantidade: 2,
                valorUnitario: 18.80,
                valorTotal: 37.60,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            },
            {
                codigo: '00005009',
                descricao: 'FEIJAO SUPER MAXIMO',
                quantidade: 2,
                valorUnitario: 5.50,
                valorTotal: 11.00,
                comprado: false,
                dataAtualizacao: new Date().toISOString()
            }
        ];
    }

    // Carrega histórico de preços do localStorage
    loadPriceHistory() {
        const stored = localStorage.getItem('priceHistory');
        return stored ? JSON.parse(stored) : [];
    }

    // Salva itens no localStorage
    saveItems() {
        localStorage.setItem('shoppingItems', JSON.stringify(this.items));
    }

    // Salva histórico de preços no localStorage
    savePriceHistory() {
        localStorage.setItem('priceHistory', JSON.stringify(this.priceHistory));
    }

    // Inicializa event listeners
    initializeEventListeners() {
        const form = document.getElementById('itemForm');
        const quantidadeInput = document.getElementById('quantidade');
        const valorUnitarioInput = document.getElementById('valorUnitario');
        const valorTotalInput = document.getElementById('valorTotal');
        const cancelBtn = document.getElementById('cancelBtn');
        const importItemsBtn = document.getElementById('importItemsBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const showOnlyPendingCheckbox = document.getElementById('showOnlyPending');
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        cancelBtn.addEventListener('click', () => this.resetForm());
        importItemsBtn.addEventListener('click', () => this.showImportModal());
        clearAllBtn.addEventListener('click', () => this.clearAllData());
        showOnlyPendingCheckbox.addEventListener('change', () => this.renderItems());
        
        // Eventos de busca
        searchInput.addEventListener('input', () => this.handleSearch());
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
        clearSearchBtn.addEventListener('click', () => this.clearSearch());

        // Calcula valor total automaticamente
        [quantidadeInput, valorUnitarioInput].forEach(input => {
            input.addEventListener('input', () => this.calculateTotal());
        });

        // Modal de confirmação
        document.getElementById('confirmYes').addEventListener('click', () => this.confirmAction());
        document.getElementById('confirmNo').addEventListener('click', () => this.hideModal());

        // Modal de importação
        document.getElementById('importConfirm').addEventListener('click', () => this.processImport());
        document.getElementById('importCancel').addEventListener('click', () => this.hideImportModal());
        document.getElementById('loadSampleData').addEventListener('click', () => this.loadSampleImportData());
    }

    // Calcula o valor total
    calculateTotal() {
        const quantidade = parseFloat(document.getElementById('quantidade').value) || 0;
        const valorUnitario = parseFloat(document.getElementById('valorUnitario').value) || 0;
        const valorTotal = quantidade * valorUnitario;
        document.getElementById('valorTotal').value = valorTotal.toFixed(2);
    }

    // Manipula o envio do formulário
    handleSubmit(e) {
        e.preventDefault();
        
        const codigo = document.getElementById('codigo').value.trim();
        const descricao = document.getElementById('descricao').value.trim();
        const quantidade = parseInt(document.getElementById('quantidade').value);
        const valorUnitario = parseFloat(document.getElementById('valorUnitario').value);
        const valorTotal = parseFloat(document.getElementById('valorTotal').value);

        if (!codigo || !descricao || quantidade <= 0 || valorUnitario < 0) {
            alert('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const item = {
            codigo,
            descricao,
            quantidade,
            valorUnitario,
            valorTotal,
            comprado: false,
            dataAtualizacao: new Date().toISOString()
        };

        if (this.editingIndex >= 0) {
            // Verifica se o preço mudou para adicionar ao histórico
            const oldItem = this.items[this.editingIndex];
            if (oldItem.valorUnitario !== valorUnitario) {
                this.addPriceHistory(codigo, descricao, oldItem.valorUnitario, valorUnitario);
            }
            
            this.items[this.editingIndex] = { ...item, comprado: oldItem.comprado };
            this.editingIndex = -1;
        } else {
            // Verifica se já existe item com o mesmo código
            const existingIndex = this.items.findIndex(i => i.codigo === codigo);
            if (existingIndex >= 0) {
                alert('Já existe um item com este código. Use a função editar para modificá-lo.');
                return;
            }
            this.items.push(item);
        }

        this.saveItems();
        this.resetForm();
        this.renderItems();
        this.updateTotal();
    }

    // Adiciona entrada no histórico de preços
    addPriceHistory(codigo, descricao, precoAntigo, precoNovo) {
        const historyEntry = {
            codigo,
            descricao,
            precoAntigo,
            precoNovo,
            data: new Date().toISOString(),
            variacao: precoNovo - precoAntigo
        };

        this.priceHistory.unshift(historyEntry);
        
        // Mantém apenas os últimos 50 registros
        if (this.priceHistory.length > 50) {
            this.priceHistory = this.priceHistory.slice(0, 50);
        }

        this.savePriceHistory();
        this.renderPriceHistory();
    }

    // Reseta o formulário
    resetForm() {
        document.getElementById('itemForm').reset();
        document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Salvar';
        this.editingIndex = -1;
    }

    // Renderiza a lista de itens
    renderItems() {
        const itemsList = document.getElementById('itemsList');
        const showOnlyPending = document.getElementById('showOnlyPending').checked;
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        
        let filteredItems = this.items;
        
        // Filtro por pendentes
        if (showOnlyPending) {
            filteredItems = filteredItems.filter(item => !item.comprado);
        }
        
        // Filtro por busca
        if (searchTerm) {
            filteredItems = filteredItems.filter(item => 
                item.codigo.toLowerCase().includes(searchTerm) ||
                item.descricao.toLowerCase().includes(searchTerm) ||
                item.valorUnitario.toString().includes(searchTerm) ||
                item.valorTotal.toString().includes(searchTerm) ||
                item.quantidade.toString().includes(searchTerm)
            );
        }

        itemsList.innerHTML = '';

        // Mostra mensagem se não há resultados
        if (filteredItems.length === 0) {
            const noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results';
            noResultsMsg.innerHTML = searchTerm 
                ? `<i class="fas fa-search"></i> Nenhum item encontrado para "${searchTerm}"`
                : '<i class="fas fa-box-open"></i> Nenhum item na lista';
            itemsList.appendChild(noResultsMsg);
            return;
        }

        filteredItems.forEach((item, index) => {
            const originalIndex = this.items.indexOf(item);
            const itemRow = document.createElement('div');
            itemRow.className = `item-row ${item.comprado ? 'completed' : ''}`;
            
            // Destaca termos de busca na descrição
            let displayDescricao = item.descricao;
            if (searchTerm && item.descricao.toLowerCase().includes(searchTerm)) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                displayDescricao = item.descricao.replace(regex, '<mark>$1</mark>');
            }
            
            itemRow.innerHTML = `
                <div class="item-checkbox">
                    <input type="checkbox" ${item.comprado ? 'checked' : ''} 
                           onchange="shoppingManager.toggleItem(${originalIndex})">
                </div>
                <div class="item-codigo">${item.codigo}</div>
                <div class="item-descricao">${displayDescricao}</div>
                <div class="item-quantidade">${item.quantidade}</div>
                <div class="item-valor-unit">R$ ${item.valorUnitario.toFixed(2)}</div>
                <div class="item-valor-total">R$ ${item.valorTotal.toFixed(2)}</div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="shoppingManager.editItem(${originalIndex})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="shoppingManager.deleteItem(${originalIndex})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-history" onclick="shoppingManager.showItemHistory('${item.codigo}')" title="Histórico">
                        <i class="fas fa-history"></i>
                    </button>
                </div>
            `;
            
            itemsList.appendChild(itemRow);
        });
        
        this.updateSearchResultsInfo(filteredItems.length, searchTerm);
    }

    // Alterna o status de comprado do item
    toggleItem(index) {
        this.items[index].comprado = !this.items[index].comprado;
        this.saveItems();
        this.renderItems();
        this.updateTotal();
    }

    // Edita um item
    editItem(index) {
        const item = this.items[index];
        
        document.getElementById('codigo').value = item.codigo;
        document.getElementById('descricao').value = item.descricao;
        document.getElementById('quantidade').value = item.quantidade;
        document.getElementById('valorUnitario').value = item.valorUnitario;
        document.getElementById('valorTotal').value = item.valorTotal;
        
        document.getElementById('saveBtn').innerHTML = '<i class="fas fa-save"></i> Atualizar';
        this.editingIndex = index;

        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Exclui um item
    deleteItem(index) {
        this.pendingDeleteIndex = index;
        this.showModal(`Deseja realmente excluir o item "${this.items[index].descricao}"?`);
    }

    // Atualiza o total geral
    updateTotal() {
        const total = this.items
            .filter(item => !item.comprado)
            .reduce((sum, item) => sum + item.valorTotal, 0);
        
        document.getElementById('totalGeral').textContent = total.toFixed(2).replace('.', ',');
    }

    // Renderiza o histórico de preços
    renderPriceHistory() {
        const historyContainer = document.getElementById('priceHistory');
        
        if (this.priceHistory.length === 0) {
            historyContainer.innerHTML = '<p>Nenhum histórico de alteração de preços encontrado.</p>';
            return;
        }

        historyContainer.innerHTML = this.priceHistory.map(entry => {
            const data = new Date(entry.data).toLocaleString('pt-BR');
            const variacao = entry.variacao > 0 ? 'price-up' : 'price-down';
            const icone = entry.variacao > 0 ? '↗️' : '↘️';
            
            return `
                <div class="history-item">
                    <h4>${entry.descricao} (${entry.codigo})</h4>
                    <div class="price-change">
                        <span>R$ ${entry.precoAntigo.toFixed(2)} → R$ ${entry.precoNovo.toFixed(2)}</span>
                        <span class="${variacao}">
                            ${icone} R$ ${Math.abs(entry.variacao).toFixed(2)}
                        </span>
                    </div>
                    <div class="date">${data}</div>
                </div>
            `;
        }).join('');
    }

    // Mostra histórico específico de um item
    showItemHistory(codigo) {
        const itemHistory = this.priceHistory.filter(entry => entry.codigo === codigo);
        
        if (itemHistory.length === 0) {
            alert('Nenhum histórico de preços encontrado para este item.');
            return;
        }

        const historyContainer = document.getElementById('priceHistory');
        historyContainer.innerHTML = itemHistory.map(entry => {
            const data = new Date(entry.data).toLocaleString('pt-BR');
            const variacao = entry.variacao > 0 ? 'price-up' : 'price-down';
            const icone = entry.variacao > 0 ? '↗️' : '↘️';
            
            return `
                <div class="history-item">
                    <h4>${entry.descricao} (${entry.codigo})</h4>
                    <div class="price-change">
                        <span>R$ ${entry.precoAntigo.toFixed(2)} → R$ ${entry.precoNovo.toFixed(2)}</span>
                        <span class="${variacao}">
                            ${icone} R$ ${Math.abs(entry.variacao).toFixed(2)}
                        </span>
                    </div>
                    <div class="date">${data}</div>
                </div>
            `;
        }).join('');

        // Scroll para a seção de histórico
        document.querySelector('.history-section').scrollIntoView({ behavior: 'smooth' });
    }

    // Mostra modal de confirmação
    showModal(message) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
    }

    // Esconde modal de confirmação
    hideModal() {
        document.getElementById('confirmModal').style.display = 'none';
        this.pendingDeleteIndex = -1;
        this.pendingClearAll = false;
        this.pendingLoadExample = false;
        this.pendingConfirmImport = false;
        this.pendingImportItems = [];
    }

    // Confirma ação do modal
    confirmAction() {
        if (this.pendingDeleteIndex >= 0) {
            this.items.splice(this.pendingDeleteIndex, 1);
            this.saveItems();
            this.renderItems();
            this.updateTotal();
            this.pendingDeleteIndex = -1;
        } else if (this.pendingClearAll) {
            this.items = [];
            this.priceHistory = [];
            this.saveItems();
            this.savePriceHistory();
            this.renderItems();
            this.renderPriceHistory();
            this.updateTotal();
            this.pendingClearAll = false;
        } else if (this.pendingLoadExample) {
            this.items = this.getExampleItems();
            this.priceHistory = [];
            this.saveItems();
            this.savePriceHistory();
            this.renderItems();
            this.renderPriceHistory();
            this.updateTotal();
            this.pendingLoadExample = false;
        } else if (this.pendingConfirmImport) {
            this.items = this.pendingImportItems;
            this.priceHistory = [];
            this.saveItems();
            this.savePriceHistory();
            this.renderItems();
            this.renderPriceHistory();
            this.updateTotal();
            this.pendingConfirmImport = false;
            this.pendingImportItems = [];
        }
        this.hideModal();
    }

    // Carrega dados de exemplo
    loadExampleData() {
        this.showModal('Deseja carregar os dados de exemplo? Isso substituirá todos os itens atuais.');
        this.pendingLoadExample = true;
    }

    // Mostra modal de importação
    showImportModal() {
        document.getElementById('importModal').style.display = 'block';
        document.getElementById('importTextArea').value = '';
        document.getElementById('importTextArea').focus();
    }

    // Esconde modal de importação
    hideImportModal() {
        document.getElementById('importModal').style.display = 'none';
    }

    // Processa importação de itens
    processImport() {
        const textData = document.getElementById('importTextArea').value.trim();
        
        if (!textData) {
            alert('Por favor, cole os dados dos itens para importação.');
            return;
        }

        try {
            const importedItems = this.parseImportData(textData);
            
            if (importedItems.length === 0) {
                alert('Nenhum item válido encontrado nos dados fornecidos.');
                return;
            }

            // Confirma a importação
            this.pendingImportItems = importedItems;
            this.hideImportModal();
            this.showModal(`Encontrados ${importedItems.length} itens para importação. Deseja substituir todos os itens atuais?`);
            this.pendingConfirmImport = true;

        } catch (error) {
            alert('Erro ao processar os dados. Verifique o formato e tente novamente.\n\nErro: ' + error.message);
        }
    }

    // Carrega dados de exemplo no textarea
    loadSampleImportData() {
        const sampleData = `MAC.NISSIN LAMEN (Código: 5614 )
Qtde.:6   UN: PCT9   Vl. Unit.:   2,29 	Vl. Total
13,74

BISC.CHOCOLICIA RECH (Código: 74952 )
Qtde.:3   UN: UND9   Vl. Unit.:   4,98 	Vl. Total
14,94

BISC.BELA VISTA (Código: 3598 )
Qtde.:1   UN: UND9   Vl. Unit.:   4,39 	Vl. Total
4,39

CAFE MELITTA (Código: 35719 )
Qtde.:1   UN: PCT9   Vl. Unit.:   33,78 	Vl. Total
33,78

ARROZ CAMIL AG.T1 (Código: 12658 )
Qtde.:2   UN: PCT9   Vl. Unit.:   18,8 	Vl. Total
37,60`;

        document.getElementById('importTextArea').value = sampleData;
    }

    // Faz parsing dos dados de importação
    parseImportData(textData) {
        const lines = textData.split('\n').map(line => line.trim()).filter(line => line);
        const items = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Procura linha com formato: NOME (Código: XXXX)
            const nameMatch = line.match(/^(.+?)\s*\(Código:\s*(\d+)\s*\)/);
            if (nameMatch && i + 2 < lines.length) {
                const descricao = nameMatch[1].trim();
                const codigo = nameMatch[2];
                
                // Próxima linha deve ter os dados de quantidade e valor
                const dataLine = lines[i + 1];
                const dataMatch = dataLine.match(/Qtde\.:(\d+)\s+UN:\s*\w+\s+Vl\.\s*Unit\.:\s*([\d,]+)/);
                
                if (dataMatch) {
                    const quantidade = parseInt(dataMatch[1]);
                    const valorUnitario = parseFloat(dataMatch[2].replace(',', '.'));
                    
                    // Próxima linha deve ter o valor total
                    const totalLine = lines[i + 2];
                    const valorTotal = parseFloat(totalLine.replace(',', '.'));
                    
                    if (!isNaN(quantidade) && !isNaN(valorUnitario) && !isNaN(valorTotal)) {
                        items.push({
                            codigo: codigo.padStart(8, '0'), // Padroniza código com zeros à esquerda
                            descricao: descricao,
                            quantidade: quantidade,
                            valorUnitario: valorUnitario,
                            valorTotal: valorTotal,
                            comprado: false,
                            dataAtualizacao: new Date().toISOString()
                        });
                        
                        i += 2; // Pula as próximas 2 linhas já processadas
                    }
                }
            }
        }
        
        return items;
    }

    // Limpa todos os dados
    clearAllData() {
        this.showModal('Deseja realmente limpar todos os dados? Esta ação não pode ser desfeita.');
        this.pendingClearAll = true;
    }

    // Manipula a busca
    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearSearchBtn = document.getElementById('clearSearch');
        const searchTerm = searchInput.value.trim();
        
        // Mostra/esconde botão de limpar busca
        if (searchTerm) {
            clearSearchBtn.classList.add('show');
        } else {
            clearSearchBtn.classList.remove('show');
        }
        
        // Renderiza itens filtrados
        this.renderItems();
    }

    // Limpa a busca
    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearch').classList.remove('show');
        this.renderItems();
        
        // Foca no campo de busca após limpar
        document.getElementById('searchInput').focus();
    }

    // Atualiza informações sobre resultados da busca
    updateSearchResultsInfo(resultCount, searchTerm) {
        const existingInfo = document.querySelector('.search-results-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        if (searchTerm && resultCount > 0) {
            const resultsInfo = document.createElement('div');
            resultsInfo.className = 'search-results-info';
            resultsInfo.innerHTML = `
                <i class="fas fa-info-circle"></i>
                Encontrados <strong>${resultCount}</strong> item${resultCount !== 1 ? 's' : ''} 
                para "<strong>${searchTerm}</strong>"
            `;
            
            const itemsList = document.getElementById('itemsList');
            itemsList.parentNode.insertBefore(resultsInfo, itemsList);
        }
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingManager = new ShoppingListManager();
    
    // Renderiza o histórico inicial
    window.shoppingManager.renderPriceHistory();
    
    // Melhorias para mobile
    initializeMobileEnhancements();
    
    // Atalhos de teclado
    initializeKeyboardShortcuts();
    
    // Fecha modal ao clicar fora dele
    window.addEventListener('click', (e) => {
        const confirmModal = document.getElementById('confirmModal');
        const importModal = document.getElementById('importModal');
        
        if (e.target === confirmModal) {
            window.shoppingManager.hideModal();
        }
        if (e.target === importModal) {
            window.shoppingManager.hideImportModal();
        }
    });
});

// Melhorias específicas para dispositivos móveis
function initializeMobileEnhancements() {
    // Detecta se é um dispositivo touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        
        // Adiciona feedback visual para botões em dispositivos touch
        addTouchFeedback();
        
        // Melhora a experiência de scroll horizontal
        enhanceHorizontalScroll();
    }
    
    // Melhora inputs em dispositivos móveis
    enhanceMobileInputs();
}

// Adiciona feedback visual para touch
function addTouchFeedback() {
    const buttons = document.querySelectorAll('button, .header-button');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

// Melhora experiência de scroll horizontal
function enhanceHorizontalScroll() {
    const itemsContainer = document.querySelector('.items-container');
    
    if (itemsContainer) {
        let isScrolling = false;
        
        itemsContainer.addEventListener('scroll', () => {
            if (!isScrolling) {
                itemsContainer.style.background = 'linear-gradient(90deg, rgba(102,126,234,0.1) 0%, transparent 10%, transparent 90%, rgba(102,126,234,0.1) 100%)';
                isScrolling = true;
                
                setTimeout(() => {
                    itemsContainer.style.background = '';
                    isScrolling = false;
                }, 1000);
            }
        });
    }
}

// Melhora inputs para mobile
function enhanceMobileInputs() {
    const inputs = document.querySelectorAll('input[type="number"]');
    
    inputs.forEach(input => {
        // Melhora a experiência de input numérico em mobile
        input.addEventListener('focus', function() {
            // Força o teclado numérico em dispositivos móveis
            this.setAttribute('inputmode', 'decimal');
        });
        
        // Previne zoom indesejado no iOS
        input.addEventListener('touchstart', function() {
            this.style.fontSize = '16px';
        });
    });
}

// Inicializa atalhos de teclado
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K para focar na busca
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            searchInput.focus();
            searchInput.select();
        }
        
        // Esc para limpar busca se estiver focada
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            if (document.activeElement === searchInput && searchInput.value) {
                window.shoppingManager.clearSearch();
            }
        }
    });
}