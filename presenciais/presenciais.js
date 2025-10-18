class PresenciaisManager {
    constructor() {
        this.firestoreDB = null;
        this.diasSelecionados = [];
        this.editandoId = null;
        this.ultimaAcao = 0; // Timestamp da última ação
        this.tentativasRecentes = []; // Array de tentativas recentes
        this.init();
    }

    // Rate limiting - previne spam
    verificarRateLimit() {
        const agora = Date.now();
        const intervaloMinimo = 1000; // 1 segundo entre ações
        
        if (agora - this.ultimaAcao < intervaloMinimo) {
            this.mostrarErro('Aguarde um momento antes de tentar novamente');
            return false;
        }
        
        // Limpar tentativas antigas (últimos 5 minutos)
        this.tentativasRecentes = this.tentativasRecentes.filter(
            tentativa => agora - tentativa < 300000
        );
        
        // Máximo de 20 tentativas em 5 minutos
        if (this.tentativasRecentes.length >= 20) {
            this.mostrarErro('Muitas tentativas. Aguarde alguns minutos.');
            return false;
        }
        
        this.ultimaAcao = agora;
        this.tentativasRecentes.push(agora);
        return true;
    }

    async init() {
        // Aguardar o Firebase estar carregado
        await this.aguardarFirebase();
        this.firestoreDB = new FirestorePresenciais();
        this.bindEvents();
        await this.carregarPresenciais();
    }

    async aguardarFirebase() {
        let tentativas = 0;
        while (!window.FirestorePresenciais && tentativas < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            tentativas++;
        }
        if (!window.FirestorePresenciais) {
            throw new Error('Firebase não foi carregado');
        }
    }

    bindEvents() {
        const form = document.getElementById('cadastro-form');
        const diasBotoes = document.querySelectorAll('.dia-btn');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        diasBotoes.forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleDia(e));
        });
    }

    toggleDia(e) {
        const dia = e.target.dataset.dia;
        const button = e.target;

        // Se o botão estiver desabilitado, não fazer nada
        if (button.classList.contains('desabilitado')) {
            return;
        }

        if (this.diasSelecionados.includes(dia)) {
            // Remover dia selecionado
            this.diasSelecionados = this.diasSelecionados.filter(d => d !== dia);
            button.classList.remove('selecionado');
        } else if (this.diasSelecionados.length < 2) {
            // Adicionar dia se ainda não chegou no limite
            this.diasSelecionados.push(dia);
            button.classList.add('selecionado');
        } else {
            // Já tem 2 dias selecionados, não permitir mais
            return;
        }

        this.atualizarEstadoBotoes();
        this.atualizarContadorDias();
    }

    atualizarEstadoBotoes() {
        const todosBotoes = document.querySelectorAll('.dia-btn');
        
        if (this.diasSelecionados.length >= 2) {
            // Desabilitar todos os botões não selecionados
            todosBotoes.forEach(btn => {
                const dia = btn.dataset.dia;
                if (!this.diasSelecionados.includes(dia)) {
                    btn.classList.add('desabilitado');
                }
            });
        } else {
            // Habilitar todos os botões
            todosBotoes.forEach(btn => {
                btn.classList.remove('desabilitado');
            });
        }
    }

    atualizarContadorDias() {
        const label = document.querySelector('.form-label:last-of-type');
        const restantes = 2 - this.diasSelecionados.length;
        if (restantes > 0) {
            label.textContent = `Selecione ${restantes} dia(s)`;
        } else {
            label.textContent = 'Dias selecionados ✓';
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Verificar rate limiting
        if (!this.verificarRateLimit()) {
            return;
        }
        
        const nome = document.getElementById('nome').value.trim();
        
        // Validações de segurança
        if (!this.validarNome(nome)) {
            return;
        }

        if (!this.validarDias()) {
            return;
        }

        try {
            this.mostrarLoading(true);

            const dadosPresencial = this.criarDadosPresencial(nome);

            if (this.editandoId) {
                await this.firestoreDB.atualizarPresencial(this.editandoId, dadosPresencial);
                this.mostrarSucesso('Presencial atualizado com sucesso!');
                this.editandoId = null;
            } else {
                await this.firestoreDB.adicionarPresencial(dadosPresencial);
                this.mostrarSucesso('Presencial cadastrado com sucesso!');
            }
            
            this.limparFormulario();
            await this.carregarPresenciais();

        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.tratarErroFirestore(error);
        } finally {
            this.mostrarLoading(false);
        }
    }

    validarNome(nome) {
        if (!nome) {
            this.mostrarErro('Por favor, digite um nome');
            return false;
        }

        if (nome.length < 2) {
            this.mostrarErro('Nome deve ter pelo menos 2 caracteres');
            return false;
        }

        if (nome.length > 100) {
            this.mostrarErro('Nome deve ter no máximo 100 caracteres');
            return false;
        }

        // Validar caracteres permitidos (apenas letras, números, espaços e alguns símbolos)
        const regex = /^[a-zA-ZÀ-ÿ0-9\s\-\.\']+$/;
        if (!regex.test(nome)) {
            this.mostrarErro('Nome contém caracteres não permitidos');
            return false;
        }

        return true;
    }

    validarDias() {
        if (this.diasSelecionados.length !== 2) {
            this.mostrarErro('Por favor, selecione exatamente 2 dias');
            return false;
        }

        // Validar que são dias válidos
        const diasValidos = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
        const diasInvalidos = this.diasSelecionados.filter(dia => !diasValidos.includes(dia));
        
        if (diasInvalidos.length > 0) {
            this.mostrarErro('Dias selecionados são inválidos');
            return false;
        }

        return true;
    }

    criarDadosPresencial(nome) {
        // Sanitizar o nome
        const nomeSanitizado = nome.trim().replace(/\s+/g, ' ');
        
        return {
            nome: nomeSanitizado,
            dias: this.diasSelecionados.sort(),
            segunda: this.diasSelecionados.includes('Seg'),
            terca: this.diasSelecionados.includes('Ter'),
            quarta: this.diasSelecionados.includes('Qua'),
            quinta: this.diasSelecionados.includes('Qui'),
            sexta: this.diasSelecionados.includes('Sex')
        };
    }

    tratarErroFirestore(error) {
        console.error('Erro detalhado:', error);
        
        if (error.code === 'permission-denied') {
            this.mostrarErro('Permissão negada. Verifique as configurações de segurança.');
        } else if (error.code === 'unavailable') {
            this.mostrarErro('Serviço indisponível. Tente novamente em alguns minutos.');
        } else if (error.code === 'invalid-argument') {
            this.mostrarErro('Dados inválidos. Verifique os campos preenchidos.');
        } else {
            this.mostrarErro('Erro ao salvar presencial. Tente novamente.');
        }
    }

    async carregarPresenciais() {
        try {
            this.mostrarLoading(true);
            const presenciais = await this.firestoreDB.buscarPresenciais();
            this.renderizarLista(presenciais);
        } catch (error) {
            console.error('Erro ao carregar presenciais:', error);
            this.mostrarErro('Erro ao carregar dados. Recarregue a página.');
        } finally {
            this.mostrarLoading(false);
        }
    }

    renderizarLista(presenciais) {
        const tbody = document.querySelector('#lista tbody');
        tbody.innerHTML = '';

        if (presenciais.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 20px; color: #666;">
                        Nenhum presencial cadastrado ainda
                    </td>
                </tr>
            `;
            return;
        }

        presenciais.forEach(presencial => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${presencial.nome}</td>
                <td class="${presencial.segunda ? 'selected' : ''}">${presencial.segunda ? '✓' : ''}</td>
                <td class="${presencial.terca ? 'selected' : ''}">${presencial.terca ? '✓' : ''}</td>
                <td class="${presencial.quarta ? 'selected' : ''}">${presencial.quarta ? '✓' : ''}</td>
                <td class="${presencial.quinta ? 'selected' : ''}">${presencial.quinta ? '✓' : ''}</td>
                <td class="${presencial.sexta ? 'selected' : ''}">${presencial.sexta ? '✓' : ''}</td>
                <td class="actions">
                    <button class="btn-editar" onclick="presenciaisManager.editarPresencial('${presencial.id}')">
                        ✏️
                    </button>
                    <button class="btn-excluir" onclick="presenciaisManager.excluirPresencial('${presencial.id}')">
                        🗑️
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async editarPresencial(id) {
        try {
            const presenciais = await this.firestoreDB.buscarPresenciais();
            const presencial = presenciais.find(p => p.id === id);
            
            if (!presencial) {
                this.mostrarErro('Presencial não encontrado');
                return;
            }

            // Preencher formulário
            document.getElementById('nome').value = presencial.nome;
            
            // Limpar seleções anteriores
            this.diasSelecionados = [];
            document.querySelectorAll('.dia-btn').forEach(btn => {
                btn.classList.remove('selecionado', 'desabilitado');
            });

            // Selecionar dias do presencial
            presencial.dias.forEach(dia => {
                const button = document.querySelector(`[data-dia="${dia}"]`);
                if (button) {
                    button.classList.add('selecionado');
                    this.diasSelecionados.push(dia);
                }
            });

            this.editandoId = id;
            this.atualizarEstadoBotoes();
            this.atualizarContadorDias();
            
            // Rolar para o formulário
            document.getElementById('cadastro-form').scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error('Erro ao editar:', error);
            this.mostrarErro('Erro ao carregar dados para edição');
        }
    }

    async excluirPresencial(id) {
        if (!confirm('Tem certeza que deseja excluir este presencial?')) {
            return;
        }

        try {
            this.mostrarLoading(true);
            await this.firestoreDB.excluirPresencial(id);
            this.mostrarSucesso('Presencial excluído com sucesso!');
            await this.carregarPresenciais();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            this.mostrarErro('Erro ao excluir presencial. Tente novamente.');
        } finally {
            this.mostrarLoading(false);
        }
    }

    limparFormulario() {
        document.getElementById('nome').value = '';
        this.diasSelecionados = [];
        this.editandoId = null;
        document.querySelectorAll('.dia-btn').forEach(btn => {
            btn.classList.remove('selecionado', 'desabilitado');
        });
        this.atualizarContadorDias();
    }

    mostrarLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'flex' : 'none';
    }

    mostrarSucesso(mensagem) {
        this.mostrarToast(mensagem, 'success');
    }

    mostrarErro(mensagem) {
        this.mostrarToast(mensagem, 'error');
    }

    mostrarToast(mensagem, tipo) {
        // Criar toast se não existir
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = mensagem;
        toast.className = `toast ${tipo} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.presenciaisManager = new PresenciaisManager();
});