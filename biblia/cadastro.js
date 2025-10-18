// Gerenciador de Versículos - Página de Cadastro
class VersoManager {
    constructor() {
        this.versos = JSON.parse(localStorage.getItem('versiculos') || '[]');
        this.editandoId = null;
        this.initEventListeners();
        this.atualizarPreview();
        this.verificarParametrosURL();
    }

    // Inicializar event listeners
    initEventListeners() {
        const form = document.getElementById('versoForm');
        const textoField = document.getElementById('texto');
        const observacoesField = document.getElementById('observacoes');
        const charCount = document.getElementById('charCount');

        // Submit do formulário
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarVerso();
        });

        // Contador de caracteres e textarea dinâmica
        textoField.addEventListener('input', () => {
            charCount.textContent = textoField.value.length;
            this.ajustarAlturaTextarea(textoField);
            this.atualizarPreview();
        });

        // Textarea dinâmica para observações
        observacoesField.addEventListener('input', () => {
            this.ajustarAlturaTextarea(observacoesField);
            this.atualizarPreview();
        });

        // Preview em tempo real
        ['livro', 'capitulo', 'versiculo'].forEach(fieldId => {
            document.getElementById(fieldId).addEventListener('input', () => {
                this.atualizarPreview();
            });
        });

        // Ajustar altura inicial das textareas
        this.ajustarAlturaTextarea(textoField);
        this.ajustarAlturaTextarea(observacoesField);

        // Reajustar textareas quando a janela for redimensionada
        window.addEventListener('resize', () => {
            this.ajustarAlturaTextarea(textoField);
            this.ajustarAlturaTextarea(observacoesField);
        });
    }

    // Ajustar altura da textarea dinamicamente
    ajustarAlturaTextarea(textarea) {
        textarea.style.height = 'auto';
        
        // Obter altura mínima baseada no CSS atual
        const computedStyle = window.getComputedStyle(textarea);
        const minHeight = parseInt(computedStyle.minHeight) || 120;
        
        // Ajustar altura com base no conteúdo, mas respeitando o mínimo
        const newHeight = Math.max(minHeight, textarea.scrollHeight);
        textarea.style.height = newHeight + 'px';
    }

    // Verificar se existe ID na URL para edição
    verificarParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        
        if (editId) {
            this.carregarParaEdicao(parseInt(editId));
        }
    }

    // Salvar versículo
    salvarVerso() {
        const livro = document.getElementById('livro').value;
        const capitulo = parseInt(document.getElementById('capitulo').value);
        const versiculoInput = document.getElementById('versiculo').value.trim();
        const texto = document.getElementById('texto').value.trim();
        const observacoes = document.getElementById('observacoes').value.trim();

        // Validações
        if (!livro || !capitulo || !versiculoInput || !texto) {
            this.mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        if (texto.length < 10) {
            this.mostrarMensagem('O texto do versículo deve ter pelo menos 10 caracteres.', 'error');
            return;
        }

        // Validar formato dos versículos
        if (!this.validarFormatoVersiculo(versiculoInput)) {
            this.mostrarMensagem('Formato de versículo inválido. Use: 16 ou 16-18 ou 16,18,20', 'error');
            return;
        }

        // Verificar duplicatas (apenas se não estiver editando)
        if (!this.editandoId) {
            const existe = this.versos.find(v => 
                v.livro === livro && v.capitulo === capitulo && v.versiculo === versiculoInput
            );
            
            if (existe) {
                this.mostrarMensagem('Este versículo já está cadastrado!', 'error');
                return;
            }
        }

        const novoVerso = {
            id: this.editandoId || Date.now(),
            livro,
            capitulo,
            versiculo: versiculoInput,
            texto,
            observacoes,
            referencia: `${livro} ${capitulo}:${versiculoInput}`,
            dataCadastro: this.editandoId ? 
                this.versos.find(v => v.id === this.editandoId)?.dataCadastro : 
                new Date().toLocaleDateString('pt-BR'),
            dataModificacao: new Date().toLocaleDateString('pt-BR')
        };

        if (this.editandoId) {
            // Atualizar versículo existente
            const index = this.versos.findIndex(v => v.id === this.editandoId);
            this.versos[index] = novoVerso;
            this.mostrarMensagem('Versículo atualizado com sucesso! ✅', 'success');
        } else {
            // Adicionar novo versículo
            this.versos.push(novoVerso);
            this.mostrarMensagem('Versículo cadastrado com sucesso! ✅', 'success');
        }

        // Salvar no localStorage
        localStorage.setItem('versiculos', JSON.stringify(this.versos));

        // Limpar formulário
        this.limparFormulario();
        this.cancelarEdicao();
    }

    // Validar formato do versículo
    validarFormatoVersiculo(versiculo) {
        // Permite: 16, 16-18, 16,18,20, 1-3,5,7-9
        const regex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
        return regex.test(versiculo.trim());
    }

    // Carregar versículo para edição
    carregarParaEdicao(id) {
        const verso = this.versos.find(v => v.id === id);
        
        if (!verso) {
            this.mostrarMensagem('Versículo não encontrado!', 'error');
            return;
        }

        this.editandoId = id;
        
        // Preencher formulário
        document.getElementById('versoId').value = id;
        document.getElementById('livro').value = verso.livro;
        document.getElementById('capitulo').value = verso.capitulo;
        document.getElementById('versiculo').value = verso.versiculo;
        document.getElementById('texto').value = verso.texto;
        document.getElementById('observacoes').value = verso.observacoes || '';

        // Atualizar interface
        document.getElementById('btnSalvar').innerHTML = '💾 Atualizar Versículo';
        document.getElementById('btnCancelar').style.display = 'inline-block';
        
        // Atualizar preview e contador
        document.getElementById('charCount').textContent = verso.texto.length;
        this.ajustarAlturaTextarea(document.getElementById('texto'));
        this.ajustarAlturaTextarea(document.getElementById('observacoes'));
        this.atualizarPreview();

        this.mostrarMensagem('Modo de edição ativado! 📝', 'info');
    }

    // Cancelar edição
    cancelarEdicao() {
        this.editandoId = null;
        document.getElementById('versoId').value = '';
        document.getElementById('btnSalvar').innerHTML = '💾 Salvar Versículo';
        document.getElementById('btnCancelar').style.display = 'none';
        
        // Remover parâmetro da URL
        const url = new URL(window.location);
        url.searchParams.delete('edit');
        window.history.replaceState({}, document.title, url);
    }

    // Limpar formulário
    limparFormulario() {
        document.getElementById('versoForm').reset();
        document.getElementById('charCount').textContent = '0';
        
        // Resetar altura das textareas para o padrão responsivo
        const textoField = document.getElementById('texto');
        const observacoesField = document.getElementById('observacoes');
        
        // Remover altura fixa para usar a altura CSS responsiva
        textoField.style.height = '';
        observacoesField.style.height = '';
        
        // Reajustar com base no CSS atual
        setTimeout(() => {
            this.ajustarAlturaTextarea(textoField);
            this.ajustarAlturaTextarea(observacoesField);
        }, 10);
        
        this.atualizarPreview();
    }

    // Atualizar pré-visualização
    atualizarPreview() {
        const livro = document.getElementById('livro').value;
        const capitulo = document.getElementById('capitulo').value;
        const versiculo = document.getElementById('versiculo').value;
        const texto = document.getElementById('texto').value;
        const observacoes = document.getElementById('observacoes').value;

        const preview = document.getElementById('preview');
        const previewRef = document.getElementById('previewRef');
        const previewText = document.getElementById('previewText');
        const previewObs = document.getElementById('previewObs');

        if (livro && capitulo && versiculo && texto) {
            preview.style.display = 'block';
            previewRef.textContent = `${livro} ${capitulo}:${versiculo}`;
            previewText.textContent = `"${texto}"`;
            previewObs.textContent = observacoes || '';
            previewObs.style.display = observacoes ? 'block' : 'none';
        } else {
            preview.style.display = 'none';
        }
    }

    // Mostrar mensagem
    mostrarMensagem(texto, tipo) {
        const messagesDiv = document.getElementById('messages');
        
        // Remover mensagens existentes
        messagesDiv.innerHTML = '';
        
        const mensagem = document.createElement('div');
        mensagem.className = `message ${tipo}`;
        mensagem.textContent = texto;
        
        messagesDiv.appendChild(mensagem);
        
        // Scroll para a mensagem
        mensagem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remover após 5 segundos
        setTimeout(() => {
            mensagem.remove();
        }, 5000);
    }
}

// Funções globais

function limparFormulario() {
    window.versoManager.limparFormulario();
}

function cancelarEdicao() {
    window.versoManager.cancelarEdicao();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.versoManager = new VersoManager();
});