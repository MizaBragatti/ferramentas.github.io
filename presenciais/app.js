class PresenciaisManager {
    constructor() {
        this.diasSelecionados = [];
        this.editandoId = null;
        this.storageKey = 'presenciais-data';
        this.init();
    }

    init() {
        this.bindEvents();
        this.carregarPresenciais();
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

    async handleSubmit(e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();

        // Validações
        if (!nome) {
            this.mostrarErro('Por favor, digite um nome');
            return;
        }

        if (this.diasSelecionados.length !== 2) {
            this.mostrarErro('Por favor, selecione exatamente 2 dias');
            return;
        }

        // Verificar se já existe alguém com o mesmo nome (caso não seja edição)
        if (!this.editandoId && this.nomeJaExiste(nome)) {
            this.mostrarErro('Já existe uma pessoa com esse nome');
            return;
        }

        const dadosPresencial = {
            nome: nome,
            dias: [...this.diasSelecionados],
            criadoEm: this.editandoId ? null : new Date().toISOString()
        };

        try {
            if (this.editandoId) {
                await this.atualizarPresencial(this.editandoId, dadosPresencial);
                this.mostrarSucesso('Presencial atualizado com sucesso!');
            } else {
                await this.adicionarPresencial(dadosPresencial);
                this.mostrarSucesso('Presencial cadastrado com sucesso!');
            }

            this.limparFormulario();
            await this.carregarPresenciais();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            this.mostrarErro('Erro ao salvar. Tente novamente.');
        }
    }

    nomeJaExiste(nome) {
        const presenciais = this.obterPresenciais();
        return presenciais.some(p => p.nome.toLowerCase() === nome.toLowerCase() && p.id !== this.editandoId);
    }

    obterPresenciais() {
        const dados = localStorage.getItem(this.storageKey);
        return dados ? JSON.parse(dados) : [];
    }

    salvarPresenciais(presenciais) {
        localStorage.setItem(this.storageKey, JSON.stringify(presenciais));
    }

    async adicionarPresencial(dadosPresencial) {
        const presenciais = this.obterPresenciais();
        const novoPresencial = {
            ...dadosPresencial,
            id: Date.now().toString(),
            criadoEm: new Date().toISOString()
        };
        presenciais.push(novoPresencial);
        this.salvarPresenciais(presenciais);
        return novoPresencial.id;
    }

    async atualizarPresencial(id, novosDados) {
        const presenciais = this.obterPresenciais();
        const index = presenciais.findIndex(p => p.id === id);
        if (index !== -1) {
            presenciais[index] = {
                ...presenciais[index],
                ...novosDados,
                id: id,
                atualizadoEm: new Date().toISOString()
            };
            this.salvarPresenciais(presenciais);
        }
    }

    async excluirPresencial(id) {
        const presenciais = this.obterPresenciais();
        const presenciaisFiltrados = presenciais.filter(p => p.id !== id);
        this.salvarPresenciais(presenciaisFiltrados);
    }

    async carregarPresenciais() {
        try {
            const presenciais = this.obterPresenciais();
            this.renderizarTabela(presenciais);
        } catch (error) {
            console.error('Erro ao carregar presenciais:', error);
            this.mostrarErro('Erro ao carregar dados');
        }
    }

    renderizarTabela(presenciais) {
        const tbody = document.querySelector('#lista tbody');
        tbody.innerHTML = '';

        if (presenciais.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum registro encontrado</td></tr>';
            return;
        }

        presenciais.forEach(presencial => {
            const linha = this.criarLinhaTabela(presencial);
            tbody.appendChild(linha);
        });
    }

    criarLinhaTabela(presencial) {
        const tr = document.createElement('tr');
        tr.dataset.id = presencial.id;

        const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

        tr.innerHTML = `
            <td>${this.escapeHtml(presencial.nome)}</td>
            ${diasSemana.map(dia => 
                `<td class="dia-cell ${presencial.dias.includes(dia) ? 'ativo' : ''}">${presencial.dias.includes(dia) ? '✓' : ''}</td>`
            ).join('')}
            <td>
                <button class="btn-editar" onclick="manager.editarPresencial('${presencial.id}')">Editar</button>
                <button class="btn-excluir" onclick="manager.confirmarExclusao('${presencial.id}')">Excluir</button>
            </td>
        `;

        return tr;
    }

    editarPresencial(id) {
        const presenciais = this.obterPresenciais();
        const presencial = presenciais.find(p => p.id === id);
        
        if (!presencial) {
            this.mostrarErro('Presencial não encontrado');
            return;
        }

        // Preencher o formulário
        document.getElementById('nome').value = presencial.nome;
        
        // Limpar seleções anteriores
        this.diasSelecionados = [];
        document.querySelectorAll('.dia-btn').forEach(btn => {
            btn.classList.remove('selecionado', 'desabilitado');
        });

        // Selecionar os dias do presencial
        presencial.dias.forEach(dia => {
            const botao = document.querySelector(`[data-dia="${dia}"]`);
            if (botao) {
                botao.classList.add('selecionado');
                this.diasSelecionados.push(dia);
            }
        });

        this.atualizarEstadoBotoes();
        this.editandoId = id;

        // Atualizar texto do botão
        const btnCadastrar = document.querySelector('.btn-cadastrar');
        btnCadastrar.textContent = 'Atualizar';

        // Scroll para o formulário
        document.getElementById('cadastro-form').scrollIntoView({ behavior: 'smooth' });
    }

    confirmarExclusao(id) {
        const presenciais = this.obterPresenciais();
        const presencial = presenciais.find(p => p.id === id);
        
        if (!presencial) {
            this.mostrarErro('Presencial não encontrado');
            return;
        }

        if (confirm(`Tem certeza que deseja excluir "${presencial.nome}"?`)) {
            this.excluirPresencial(id).then(() => {
                this.mostrarSucesso('Presencial excluído com sucesso!');
                this.carregarPresenciais();
            }).catch(error => {
                console.error('Erro ao excluir:', error);
                this.mostrarErro('Erro ao excluir. Tente novamente.');
            });
        }
    }

    limparFormulario() {
        document.getElementById('cadastro-form').reset();
        
        // Limpar seleção de dias
        this.diasSelecionados = [];
        document.querySelectorAll('.dia-btn').forEach(btn => {
            btn.classList.remove('selecionado', 'desabilitado');
        });

        // Resetar modo de edição
        this.editandoId = null;
        const btnCadastrar = document.querySelector('.btn-cadastrar');
        btnCadastrar.textContent = 'Cadastrar';
    }

    mostrarSucesso(mensagem) {
        this.mostrarMensagem(mensagem, 'sucesso');
    }

    mostrarErro(mensagem) {
        this.mostrarMensagem(mensagem, 'erro');
    }

    mostrarMensagem(mensagem, tipo) {
        // Remove mensagem anterior se existir
        const mensgemAnterior = document.querySelector('.mensagem');
        if (mensgemAnterior) {
            mensgemAnterior.remove();
        }

        // Criar nova mensagem
        const div = document.createElement('div');
        div.className = `mensagem ${tipo}`;
        div.textContent = mensagem;

        // Inserir no início do container
        const container = document.querySelector('.container');
        container.insertBefore(div, container.firstChild);

        // Remover após 5 segundos
        setTimeout(() => {
            if (div.parentNode) {
                div.remove();
            }
        }, 5000);
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.manager = new PresenciaisManager();
});