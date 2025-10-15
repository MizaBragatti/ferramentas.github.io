let nomes = JSON.parse(localStorage.getItem("nomes") || "[]");
let nomesOriginais = [...nomes]; // Cópia da ordem original
let nomesExibidos = [...nomes]; // Nomes atualmente sendo exibidos
let buscaAtual = "";
let ordenacaoAtual = "original";

function salvarNomes() {
    localStorage.setItem("nomes", JSON.stringify(nomes));
    nomesOriginais = [...nomes];
}

function atualizarLista() {
    const lista = document.getElementById("listaNomes");
    lista.innerHTML = "";
    
    nomesExibidos.forEach((nome, displayIndex) => {
        const originalIndex = nomes.indexOf(nome);
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.className = "nome";
        
        // Destacar termos de busca
        if (buscaAtual) {
            const regex = new RegExp(`(${buscaAtual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const nomeComDestaque = nome.replace(regex, '<mark>$1</mark>');
            span.innerHTML = nomeComDestaque;
        } else {
            span.textContent = nome;
        }
        
        const acoes = document.createElement("div");
        acoes.className = "acoes";
        
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.onclick = () => editarNome(originalIndex);
        btnEditar.setAttribute("aria-label", `Editar nome ${nome}`);
        
        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => removerNome(originalIndex);
        btnRemover.setAttribute("aria-label", `Remover nome ${nome}`);
        
        acoes.appendChild(btnEditar);
        acoes.appendChild(btnRemover);
        
        li.appendChild(span);
        li.appendChild(acoes);
        
        lista.appendChild(li);
    });
    
    document.getElementById("contador").textContent = nomes.length;
    atualizarInfoFiltro();
}

function aplicarFiltros() {
    let nomesFiltrados = [...nomes];
    
    // Aplicar busca
    if (buscaAtual) {
        nomesFiltrados = nomesFiltrados.filter(nome => 
            nome.toLowerCase().includes(buscaAtual.toLowerCase())
        );
    }
    
    // Aplicar ordenação
    switch (ordenacaoAtual) {
        case 'alphabetical':
            nomesFiltrados.sort((a, b) => a.localeCompare(b, 'pt-BR'));
            break;
        case 'reverse':
            nomesFiltrados.sort((a, b) => b.localeCompare(a, 'pt-BR'));
            break;
        case 'length-asc':
            nomesFiltrados.sort((a, b) => a.length - b.length || a.localeCompare(b, 'pt-BR'));
            break;
        case 'length-desc':
            nomesFiltrados.sort((a, b) => b.length - a.length || a.localeCompare(b, 'pt-BR'));
            break;
        case 'original':
        default:
            // Manter ordem original
            nomesFiltrados = nomesFiltrados.sort((a, b) => {
                return nomesOriginais.indexOf(a) - nomesOriginais.indexOf(b);
            });
            break;
    }
    
    nomesExibidos = nomesFiltrados;
    atualizarLista();
}

function atualizarInfoFiltro() {
    const filterInfo = document.getElementById("filterInfo");
    const filterText = document.getElementById("filterText");
    const statsExibidos = document.getElementById("statsExibidos");
    const contadorExibidos = document.getElementById("contadorExibidos");
    const quickStats = document.getElementById("quickStats");
    
    const totalNomes = nomes.length;
    const nomesVisiveis = nomesExibidos.length;
    
    // Atualizar contador no header
    contadorExibidos.textContent = nomesVisiveis;
    
    if (buscaAtual || nomesVisiveis !== totalNomes) {
        // Mostrar stats de filtrados no header
        statsExibidos.style.display = "flex";
        
        // Mostrar info detalhada
        let texto = `Mostrando ${nomesVisiveis} de ${totalNomes} nomes`;
        if (buscaAtual) {
            texto += ` para "${buscaAtual}"`;
        }
        filterText.textContent = texto;
        filterInfo.style.display = "block";
    } else {
        // Esconder stats de filtrados
        statsExibidos.style.display = "none";
        filterInfo.style.display = "none";
    }
    
    // Mostrar estatísticas rápidas se houver nomes para exibir
    if (nomesVisiveis > 0) {
        atualizarEstatisticasRapidas();
        quickStats.style.display = "flex";
    } else {
        quickStats.style.display = "none";
    }
}

function atualizarEstatisticasRapidas() {
    if (nomesExibidos.length === 0) return;
    
    const tamanhos = nomesExibidos.map(nome => nome.length);
    const maiorNome = nomesExibidos.reduce((a, b) => a.length > b.length ? a : b);
    const menorNome = nomesExibidos.reduce((a, b) => a.length < b.length ? a : b);
    const tamanhoMedio = (tamanhos.reduce((a, b) => a + b, 0) / tamanhos.length).toFixed(1);
    
    document.getElementById("statMaior").textContent = `${maiorNome} (${maiorNome.length})`;
    document.getElementById("statMenor").textContent = `${menorNome} (${menorNome.length})`;
    document.getElementById("statMedia").textContent = `${tamanhoMedio} caracteres`;
}

function buscarNomes() {
    const searchInput = document.getElementById("searchInput");
    buscaAtual = searchInput.value.trim();
    aplicarFiltros();
}

function limparBusca() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = "";
    buscaAtual = "";
    aplicarFiltros();
    searchInput.focus();
}

function aplicarOrdenacao() {
    const sortSelect = document.getElementById("sortSelect");
    ordenacaoAtual = sortSelect.value;
    aplicarFiltros();
}

function exportarNomesFiltrados() {
    if (nomesExibidos.length === 0) {
        showNotification('Nenhum nome para exportar!', 'warning');
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8," 
        + "Nome\n" 
        + nomesExibidos.map(nome => `"${nome}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    let fileName = "nomes_exportados.csv";
    if (buscaAtual) {
        fileName = `nomes_busca_${buscaAtual.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    }
    if (ordenacaoAtual !== 'original') {
        fileName = fileName.replace('.csv', `_${ordenacaoAtual}.csv`);
    }
    
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`${nomesExibidos.length} nomes exportados com sucesso!`, 'success');
}

function adicionarNome(nomeParam) {
    const input = document.getElementById('nomeInput');
    const nome = nomeParam || input.value.trim();
    if (!nome) return;

    if (nomes.includes(nome)) {
        showNotification(`O nome "${nome}" já existe na lista!`, 'error');
        return;
    }

    nomes.push(nome);
    salvarNomes();
    aplicarFiltros();
    input.value = "";
    input.focus();
    
    showNotification(`Nome "${nome}" adicionado com sucesso!`, 'success');
}

function removerNome(index) {
    const nome = nomes[index];
    if (confirm(`Deseja remover o nome "${nome}"?`)) {
        nomes.splice(index, 1);
        salvarNomes();
        aplicarFiltros();
        showNotification(`Nome "${nome}" removido com sucesso!`, 'success');
    }
}

function editarNome(index) {
    const nomeAtual = nomes[index];
    const novoNome = prompt("Editar nome:", nomeAtual);
    if (novoNome !== null && novoNome.trim()) {
        const nomeEditado = novoNome.trim();
        
        if (nomes.includes(nomeEditado) && nomeEditado !== nomeAtual) {
            showNotification(`O nome "${nomeEditado}" já existe na lista!`, 'error');
            return;
        }
        
        nomes[index] = nomeEditado;
        salvarNomes();
        aplicarFiltros();
        showNotification(`Nome alterado para "${nomeEditado}"!`, 'success');
    }
}

function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split('\n').map(l => l.replace(/\r$/, ''));
        if (linhas.length < 2) {
            showNotification('Arquivo CSV inválido ou vazio!', 'error');
            return;
        }

        // Pega o cabeçalho e acha os índices dos campos de nome
        const cabecalho = linhas[0].split(',');
        const idxFirst = cabecalho.indexOf("First Name");
        const idxMiddle = cabecalho.indexOf("Middle Name");
        const idxLast = cabecalho.indexOf("Last Name");

        let nomesImportados = 0;
        let nomesDuplicados = 0;

        for (let i = 1; i < linhas.length; i++) {
            if (!linhas[i].trim()) continue;
            const campos = linhas[i].split(',');
            let nome = '';
            if (idxFirst >= 0 && campos[idxFirst]) nome += campos[idxFirst];
            if (idxMiddle >= 0 && campos[idxMiddle]) nome += ' ' + campos[idxMiddle];
            if (idxLast >= 0 && campos[idxLast]) nome += ' ' + campos[idxLast];
            nome = nome.trim();
            
            if (nome) {
                if (!nomes.includes(nome)) {
                    nomes.push(nome);
                    nomesImportados++;
                } else {
                    nomesDuplicados++;
                }
            }
        }
        
        salvarNomes();
        aplicarFiltros();
        
        let mensagem = `${nomesImportados} nomes importados`;
        if (nomesDuplicados > 0) {
            mensagem += ` (${nomesDuplicados} duplicados ignorados)`;
        }
        showNotification(mensagem, 'success');
    };
    reader.readAsText(file, 'UTF-8');
    
    // Limpar o input para permitir reimportar o mesmo arquivo
    event.target.value = '';
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#ef4444' : 
                   type === 'success' ? '#10b981' : 
                   '#667eea';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
        font-size: 0.875rem;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('nomeInput');
    const searchInput = document.getElementById('searchInput');
    
    // Suporte ao Enter para adicionar nomes
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarNome();
        }
    });
    
    // Busca em tempo real
    searchInput.addEventListener('input', function() {
        buscarNomes();
    });
    
    // Suporte ao Enter na busca
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarNomes();
        }
    });
    
    // Teclas de atalho globais
    document.addEventListener('keydown', function(e) {
        // Ctrl+F ou F3 para focar na busca
        if ((e.ctrlKey && e.key === 'f') || e.key === 'F3') {
            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        }
        
        // Escape para limpar busca
        if (e.key === 'Escape' && buscaAtual) {
            e.preventDefault();
            limparBusca();
        }
        
        // Ctrl+N para focar no input de adicionar nome
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            input.focus();
        }
    });
    
    // Focar no input de adicionar nome ao carregar a página
    input.focus();
    
    // Carregar lista inicial
    aplicarFiltros();
});