// ========================================
// CONFIGURAÇÃO FIREBASE
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyAhIHFSkRw6wPP5T1WOwAAwOvyqggBqMZ8",
    authDomain: "barbeiro-de8a5.firebaseapp.com",
    databaseURL: "https://barbeiro-de8a5-default-rtdb.firebaseio.com",
    projectId: "barbeiro-de8a5",
    storageBucket: "barbeiro-de8a5.firebasestorage.app",
    messagingSenderId: "116498868750",
    appId: "1:116498868750:web:27553cfc59f109d5b16a5f"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ========================================
// AUTENTICAÇÃO E SESSÃO
// ========================================

// Verificar sessão e exibir usuário logado
function verificarSessao() {
    const barbeiroLogado = sessionStorage.getItem('barbeiroLogado');
    const nomeBarbeiro = sessionStorage.getItem('nomeBareiro');
    
    if (barbeiroLogado && nomeBarbeiro) {
        const usuarioElement = document.getElementById('usuarioLogado');
        if (usuarioElement) {
            usuarioElement.textContent = `👤 Logado como: ${nomeBarbeiro}`;
        }
        
        // Auto-selecionar o barbeiro logado
        setTimeout(() => {
            selecionarBarbeiro(parseInt(barbeiroLogado));
        }, 500);
    }
}

// Função para sair
function sair() {
    if (confirm('Deseja realmente sair?')) {
        sessionStorage.removeItem('barbeiroLogado');
        sessionStorage.removeItem('nomeBareiro');
        window.location.href = 'login.html';
    }
}

// ========================================
// CONEXÃO FIREBASE
// ========================================

// Estado da conexão
let statusConexao = false;

// Monitorar conexão
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snap) => {
    statusConexao = snap.val() === true;
    atualizarStatusConexao();
});

function atualizarStatusConexao() {
    const statusElement = document.getElementById('statusConexao');
    if (statusConexao) {
        statusElement.className = 'status-conexao online';
        statusElement.querySelector('.status-text').textContent = 'Online - Sincronizado';
    } else {
        statusElement.className = 'status-conexao offline';
        statusElement.querySelector('.status-text').textContent = 'Offline - Modo Local';
    }
}

// ========================================
// DADOS E SERVIÇOS
// ========================================

// Lista de serviços disponíveis
const servicos = [
    { nome: "Corte Masculino", duracao: 30, valor: 40.00 },
    { nome: "Corte Feminino", duracao: 40, valor: 50.00 },
    { nome: "Barba", duracao: 30, valor: 30.00 },
    { nome: "Sombrancelha", duracao: 15, valor: 15.00 },
    { nome: "Pezinho", duracao: 15, valor: 15.00 },
    { nome: "Relaxamento", duracao: 60, valor: 60.00 }
];

// Variável para armazenar o barbeiro selecionado
let barbeiroSelecionado = null;

// Nomes dos barbeiros
const nomesBarbeiros = {
    1: 'Sérgio',
    2: 'Hélio'
};

// Função para formatar valor monetário
function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Função para obter a data de hoje no formato YYYY-MM-DD
function obterDataHoje() {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
}

// Função para formatar data para exibição
function formatarDataExibicao(data) {
    const opcoes = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', opcoes);
}

// Função para formatar hora
function formatarHora() {
    const agora = new Date();
    return agora.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// ========================================
// FUNÇÕES DE DADOS (Apenas Firebase)
// ========================================

// Cache local em memória (não persiste ao recarregar)
let cacheLocal = null;

// Função para carregar dados
function carregarDados() {
    if (cacheLocal) {
        return cacheLocal;
    }
    
    // Inicializar dados do dia
    const dataHoje = obterDataHoje();
    const dadosIniciais = {
        data: dataHoje,
        servicos: {},
        barbeiro1: {},
        barbeiro2: {},
        historico: []
    };
    
    servicos.forEach(servico => {
        dadosIniciais.servicos[servico.nome] = 0;
        dadosIniciais.barbeiro1[servico.nome] = 0;
        dadosIniciais.barbeiro2[servico.nome] = 0;
    });
    
    cacheLocal = dadosIniciais;
    return dadosIniciais;
}

// Função para salvar dados (apenas Firebase)
function salvarDados(dados) {
    const dataHoje = obterDataHoje();
    
    // Atualizar cache local
    cacheLocal = dados;
    
    // Salvar no Firebase
    if (statusConexao) {
        database.ref(`servicos/${dataHoje}`).set(dados)
            .then(() => {
                console.log('☁️ Dados sincronizados com Firebase');
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar no Firebase:', error);
            });
    } else {
        console.log('📡 Offline - aguardando conexão para sincronizar');
    }
}

// Sincronizar dados do Firebase ao carregar
function sincronizarComFirebase() {
    const dataHoje = obterDataHoje();
    
    database.ref(`servicos/${dataHoje}`).on('value', (snapshot) => {
        const dadosFirebase = snapshot.val();
        
        if (dadosFirebase) {
            console.log('☁️ Dados recebidos do Firebase:', dadosFirebase);
            
            // Atualizar cache local
            cacheLocal = dadosFirebase;
            
            // Atualizar interface
            atualizarInterface();
        } else {
            console.log('📭 Nenhum dado no Firebase para hoje');
            
            // Inicializar dados vazios no Firebase
            const dadosIniciais = carregarDados();
            database.ref(`servicos/${dataHoje}`).set(dadosIniciais);
        }
    }, (error) => {
        console.error('❌ Erro ao sincronizar:', error);
    });
}

// Função para selecionar barbeiro
function selecionarBarbeiro(numeroBarbeiro) {
    barbeiroSelecionado = numeroBarbeiro;
    
    // Atualizar visualmente qual barbeiro está selecionado
    document.getElementById('btnBarbeiro1').classList.remove('selecionado');
    document.getElementById('btnBarbeiro2').classList.remove('selecionado');
    document.getElementById(`btnBarbeiro${numeroBarbeiro}`).classList.add('selecionado');
}

// Função para registrar um serviço
function registrarServico(nomeServico) {
    // Verificar se um barbeiro foi selecionado
    if (!barbeiroSelecionado) {
        alert('⚠️ Por favor, selecione um barbeiro primeiro!');
        return;
    }
    
    console.log('📝 Registrando serviço:', nomeServico, 'para Barbeiro', barbeiroSelecionado);
    
    const dados = carregarDados();
    
    // Incrementar contador geral
    dados.servicos[nomeServico] = (dados.servicos[nomeServico] || 0) + 1;
    
    // Incrementar contador do barbeiro específico
    const chaveBarbeiro = `barbeiro${barbeiroSelecionado}`;
    dados[chaveBarbeiro][nomeServico] = (dados[chaveBarbeiro][nomeServico] || 0) + 1;
    
    console.log('📊 Contadores atualizados:', {
        geral: dados.servicos[nomeServico],
        barbeiro: dados[chaveBarbeiro][nomeServico]
    });
    
    // Adicionar ao histórico
    dados.historico.unshift({
        servico: nomeServico,
        barbeiro: barbeiroSelecionado,
        hora: formatarHora(),
        timestamp: new Date().getTime()
    });
    
    // Limitar histórico a 50 itens
    if (dados.historico.length > 50) {
        dados.historico = dados.historico.slice(0, 50);
    }
    
    salvarDados(dados);
    
    // Feedback visual
    mostrarFeedback(nomeServico, barbeiroSelecionado);
    
    // Atualizar interface
    atualizarInterface();
}

// Função para mostrar feedback visual
function mostrarFeedback(nomeServico, numeroBarbeiro) {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.textContent = `✓ ${nomeServico} - ${nomesBarbeiros[numeroBarbeiro]}`;
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--verde);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.5);
        animation: feedbackPulse 0.5s ease;
        text-align: center;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Função para renderizar os cards de serviços
function renderizarServicos() {
    const dados = carregarDados();
    const grid = document.getElementById('servicosGrid');
    grid.innerHTML = '';
    
    console.log('🎨 Renderizando serviços com dados:', dados.servicos);
    
    servicos.forEach(servico => {
        const contador = dados.servicos[servico.nome] || 0;
        
        console.log(`   ${servico.nome}: ${contador}`);
        
        const card = document.createElement('div');
        card.className = 'servico-card';
        card.onclick = () => registrarServico(servico.nome);
        
        card.innerHTML = `
            <h3>${servico.nome}</h3>
            <span class="duracao">${servico.duracao} min</span>
            <span class="valor-servico">${formatarValor(servico.valor)}</span>
            <span class="contador">${contador}</span>
        `;
        
        grid.appendChild(card);
    });
}

// Função para renderizar o histórico
function renderizarHistorico() {
    const dados = carregarDados();
    const lista = document.getElementById('historicoLista');
    
    if (dados.historico.length === 0) {
        lista.innerHTML = '<p style="color: var(--cinza-claro); text-align: center;">Nenhum serviço registrado hoje</p>';
        return;
    }
    
    lista.innerHTML = '';
    
    // Mostrar apenas os últimos 10
    dados.historico.slice(0, 10).forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'historico-item';
        div.innerHTML = `
            <span class="servico-nome">${item.servico} - ${nomesBarbeiros[item.barbeiro]}</span>
            <span class="hora">${item.hora}</span>
            <button class="btn-excluir-historico" onclick="confirmarExclusao(${index})" title="Remover este serviço">
                🗑️
            </button>
        `;
        lista.appendChild(div);
    });
}

// Função para atualizar o total de serviços
function atualizarTotal() {
    const dados = carregarDados();
    const total = Object.values(dados.servicos).reduce((acc, val) => acc + val, 0);
    
    // Calcular valor total
    let valorTotal = 0;
    servicos.forEach(servico => {
        const qtd = dados.servicos[servico.nome] || 0;
        valorTotal += qtd * servico.valor;
    });
    
    document.getElementById('totalServicos').innerHTML = `
        ${total} <span style="font-size: 0.8rem; display: block; margin-top: 5px;">${formatarValor(valorTotal)}</span>
    `;
    
    // Atualizar totais por barbeiro
    const totalBarbeiro1 = Object.values(dados.barbeiro1).reduce((acc, val) => acc + val, 0);
    const totalBarbeiro2 = Object.values(dados.barbeiro2).reduce((acc, val) => acc + val, 0);
    
    // Calcular valores por barbeiro
    let valorBarbeiro1 = 0;
    let valorBarbeiro2 = 0;
    
    servicos.forEach(servico => {
        const qtd1 = dados.barbeiro1[servico.nome] || 0;
        const qtd2 = dados.barbeiro2[servico.nome] || 0;
        valorBarbeiro1 += qtd1 * servico.valor;
        valorBarbeiro2 += qtd2 * servico.valor;
    });
    
    document.getElementById('totalBarbeiro1').innerHTML = `
        ${totalBarbeiro1} serviços<br>
        <span style="font-size: 0.85rem; font-weight: bold;">${formatarValor(valorBarbeiro1)}</span>
    `;
    
    document.getElementById('totalBarbeiro2').innerHTML = `
        ${totalBarbeiro2} serviços<br>
        <span style="font-size: 0.85rem; font-weight: bold;">${formatarValor(valorBarbeiro2)}</span>
    `;
}

// Função para atualizar a data atual
function atualizarData() {
    const dataHoje = obterDataHoje();
    document.getElementById('dataAtual').textContent = formatarDataExibicao(dataHoje);
}

// Função para atualizar toda a interface
function atualizarInterface() {
    atualizarData();
    renderizarServicos();
    renderizarHistorico();
    atualizarTotal();
}

// Função para confirmar limpeza
function confirmarLimpeza() {
    document.getElementById('modalConfirmacao').classList.add('ativo');
}

// Função para fechar modal
function fecharModal() {
    document.getElementById('modalConfirmacao').classList.remove('ativo');
    document.getElementById('modalExclusao').classList.remove('ativo');
}

// Função para limpar dados do dia
function limparDados() {
    const dataHoje = obterDataHoje();
    
    // Limpar cache local
    cacheLocal = null;
    
    // Limpar no Firebase
    database.ref(`servicos/${dataHoje}`).remove()
        .then(() => {
            console.log('🗑️ Dados do dia removidos do Firebase');
            fecharModal();
            
            // Reinicializar dados vazios
            const dadosIniciais = carregarDados();
            database.ref(`servicos/${dataHoje}`).set(dadosIniciais);
        })
        .catch((error) => {
            console.error('❌ Erro ao limpar dados:', error);
        });
}

// Variável para armazenar o índice do item a ser excluído
let indiceParaExcluir = null;

// Função para confirmar exclusão de um serviço
function confirmarExclusao(indice) {
    indiceParaExcluir = indice;
    const dados = carregarDados();
    const item = dados.historico[indice];
    
    document.getElementById('servicoExcluir').textContent = 
        `${item.servico} - ${nomesBarbeiros[item.barbeiro]} (${item.hora})`;
    
    document.getElementById('modalExclusao').classList.add('ativo');
}

// Função para excluir o serviço
function excluirServico() {
    if (indiceParaExcluir === null) return;
    
    const dados = carregarDados();
    const itemRemovido = dados.historico[indiceParaExcluir];
    
    // Decrementar contadores
    dados.servicos[itemRemovido.servico] = Math.max(0, (dados.servicos[itemRemovido.servico] || 0) - 1);
    
    const chaveBarbeiro = `barbeiro${itemRemovido.barbeiro}`;
    dados[chaveBarbeiro][itemRemovido.servico] = Math.max(0, (dados[chaveBarbeiro][itemRemovido.servico] || 0) - 1);
    
    // Remover do histórico
    dados.historico.splice(indiceParaExcluir, 1);
    
    salvarDados(dados);
    fecharModal();
    indiceParaExcluir = null;
    atualizarInterface();
    
    // Mostrar feedback
    const feedback = document.createElement('div');
    feedback.textContent = '✓ Serviço removido!';
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--vermelho);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        z-index: 2000;
        box-shadow: 0 4px 20px rgba(244, 67, 54, 0.5);
        animation: feedbackPulse 0.5s ease;
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 1000);
}

// Função para abrir relatório completo
function abrirRelatorio() {
    const dados = carregarDados();
    const conteudo = document.getElementById('relatorioConteudo');
    
    let html = '<div style="margin-bottom: 20px;">';
    html += '<h4 style="color: var(--dourado); margin-bottom: 10px;">Serviços Realizados</h4>';
    
    let totalGeral = 0;
    let valorTotalGeral = 0;
    let tempoTotalGeral = 0;
    
    servicos.forEach(servico => {
        const qtd = dados.servicos[servico.nome] || 0;
        totalGeral += qtd;
        valorTotalGeral += qtd * servico.valor;
        tempoTotalGeral += qtd * servico.duracao;
        
        if (qtd > 0) {
            const valorTotal = qtd * servico.valor;
            html += `
                <div class="relatorio-item">
                    <h4>${servico.nome}</h4>
                    <div class="detalhes">
                        <span>Qtd: ${qtd}</span>
                        <span>Tempo: ${qtd * servico.duracao} min</span>
                    </div>
                    <div class="detalhes" style="margin-top: 5px;">
                        <span>Unit: ${formatarValor(servico.valor)}</span>
                        <span style="font-weight: bold; color: var(--dourado);">Total: ${formatarValor(valorTotal)}</span>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    
    html += `
        <div style="background: var(--marrom); padding: 15px; border-radius: 8px; text-align: center;">
            <h4 style="color: var(--dourado); margin-bottom: 10px;">Total Geral de Serviços</h4>
            <p style="font-size: 2rem; font-weight: bold; color: white;">${totalGeral}</p>
            <p style="font-size: 1.5rem; font-weight: bold; color: var(--dourado); margin-top: 10px;">${formatarValor(valorTotalGeral)}</p>
            <p style="font-size: 1rem; color: white; margin-top: 5px;">Tempo total: ${tempoTotalGeral} minutos</p>
        </div>
    `;
    
    conteudo.innerHTML = html;
    document.getElementById('modalRelatorio').classList.add('ativo');
}

// Função para fechar relatório
function fecharRelatorio() {
    document.getElementById('modalRelatorio').classList.remove('ativo');
}

// Função para abrir relatório por barbeiro
function abrirRelatorioPorBarbeiro() {
    const dados = carregarDados();
    const conteudo = document.getElementById('relatorioConteudoBarbeiro');
    
    let html = '';
    
    // Relatório Barbeiro 1
    html += '<div style="margin-bottom: 30px;">';
    html += '<h4 style="color: var(--dourado); margin-bottom: 15px; font-size: 1.3rem;">👨‍🦲 Sérgio</h4>';
    
    let totalBarbeiro1 = 0;
    let tempoTotalBarbeiro1 = 0;
    let valorTotalBarbeiro1 = 0;
    
    servicos.forEach(servico => {
        const qtd = dados.barbeiro1[servico.nome] || 0;
        if (qtd > 0) {
            totalBarbeiro1 += qtd;
            tempoTotalBarbeiro1 += qtd * servico.duracao;
            const valorTotal = qtd * servico.valor;
            valorTotalBarbeiro1 += valorTotal;
            
            html += `
                <div class="relatorio-item">
                    <h4>${servico.nome}</h4>
                    <div class="detalhes">
                        <span>Qtd: ${qtd}</span>
                        <span>Tempo: ${qtd * servico.duracao} min</span>
                    </div>
                    <div class="detalhes" style="margin-top: 5px;">
                        <span>${formatarValor(servico.valor)}</span>
                        <span style="font-weight: bold; color: var(--dourado);">${formatarValor(valorTotal)}</span>
                    </div>
                </div>
            `;
        }
    });
    
    html += `
        <div style="background: var(--marrom); padding: 12px; border-radius: 8px; margin-top: 10px;">
            <div class="detalhes" style="margin-bottom: 8px;">
                <span style="font-weight: bold; color: var(--dourado);">Total: ${totalBarbeiro1} serviços</span>
                <span style="color: white;">Tempo: ${tempoTotalBarbeiro1} min</span>
            </div>
            <div style="text-align: center; font-size: 1.3rem; font-weight: bold; color: var(--dourado);">
                ${formatarValor(valorTotalBarbeiro1)}
            </div>
        </div>
    `;
    
    html += '</div>';
    
    // Relatório Barbeiro 2
    html += '<div style="margin-bottom: 20px;">';
    html += '<h4 style="color: var(--dourado); margin-bottom: 15px; font-size: 1.3rem;">👨‍🦱 Hélio</h4>';
    
    let totalBarbeiro2 = 0;
    let tempoTotalBarbeiro2 = 0;
    let valorTotalBarbeiro2 = 0;
    
    servicos.forEach(servico => {
        const qtd = dados.barbeiro2[servico.nome] || 0;
        if (qtd > 0) {
            totalBarbeiro2 += qtd;
            tempoTotalBarbeiro2 += qtd * servico.duracao;
            const valorTotal = qtd * servico.valor;
            valorTotalBarbeiro2 += valorTotal;
            
            html += `
                <div class="relatorio-item">
                    <h4>${servico.nome}</h4>
                    <div class="detalhes">
                        <span>Qtd: ${qtd}</span>
                        <span>Tempo: ${qtd * servico.duracao} min</span>
                    </div>
                    <div class="detalhes" style="margin-top: 5px;">
                        <span>${formatarValor(servico.valor)}</span>
                        <span style="font-weight: bold; color: var(--dourado);">${formatarValor(valorTotal)}</span>
                    </div>
                </div>
            `;
        }
    });
    
    html += `
        <div style="background: var(--marrom); padding: 12px; border-radius: 8px; margin-top: 10px;">
            <div class="detalhes" style="margin-bottom: 8px;">
                <span style="font-weight: bold; color: var(--dourado);">Total: ${totalBarbeiro2} serviços</span>
                <span style="color: white;">Tempo: ${tempoTotalBarbeiro2} min</span>
            </div>
            <div style="text-align: center; font-size: 1.3rem; font-weight: bold; color: var(--dourado);">
                ${formatarValor(valorTotalBarbeiro2)}
            </div>
        </div>
    `;
    
    html += '</div>';
    
    // Comparação
    html += `
        <div style="background: var(--cinza-escuro); padding: 15px; border-radius: 8px; border: 2px solid var(--dourado);">
            <h4 style="color: var(--dourado); margin-bottom: 10px; text-align: center;">📊 Comparação</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: center;">
                <div>
                    <p style="color: var(--cinza-claro); margin-bottom: 5px;">Barbeiro 1</p>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--dourado);">${totalBarbeiro1}</p>
                    <p style="font-size: 1.1rem; color: white; margin-top: 5px;">${formatarValor(valorTotalBarbeiro1)}</p>
                </div>
                <div>
                    <p style="color: var(--cinza-claro); margin-bottom: 5px;">Barbeiro 2</p>
                    <p style="font-size: 1.5rem; font-weight: bold; color: var(--dourado);">${totalBarbeiro2}</p>
                    <p style="font-size: 1.1rem; color: white; margin-top: 5px;">${formatarValor(valorTotalBarbeiro2)}</p>
                </div>
            </div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--cinza);">
                <p style="color: var(--cinza-claro); text-align: center; margin-bottom: 5px;">Total Geral</p>
                <p style="font-size: 1.8rem; font-weight: bold; color: var(--dourado); text-align: center;">
                    ${formatarValor(valorTotalBarbeiro1 + valorTotalBarbeiro2)}
                </p>
            </div>
        </div>
    `;
    
    conteudo.innerHTML = html;
    document.getElementById('modalRelatorioBarbeiro').classList.add('ativo');
}

// Função para fechar relatório por barbeiro
function fecharRelatorioBarbeiro() {
    document.getElementById('modalRelatorioBarbeiro').classList.remove('ativo');
}

// Adicionar animação de pulso ao CSS dinamicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes feedbackPulse {
        0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.1);
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Inicializar ao carregar a página
// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Iniciando sistema...');
    console.log('📅 Data de hoje:', obterDataHoje());
    
    // Verificar sessão de login
    verificarSessao();
    
    // Iniciar sincronização com Firebase
    sincronizarComFirebase();
    
    const dados = carregarDados();
    console.log('📊 Dados carregados:', dados);
    
    atualizarInterface();
    
    // Atualizar a cada minuto (para atualizar a hora)
    setInterval(() => {
        atualizarData();
    }, 60000);
});

// Detectar mudança de dia
setInterval(() => {
    const dataAtual = obterDataHoje();
    const dados = carregarDados();
    
    if (dados.data !== dataAtual) {
        // Novo dia, atualizar interface
        atualizarInterface();
    }
}, 60000); // Verificar a cada minuto
