let nomes = JSON.parse(localStorage.getItem("nomes") || "[]");

function salvarNomes() {
    localStorage.setItem("nomes", JSON.stringify(nomes));
}

function atualizarLista() {
    const lista = document.getElementById("listaNomes");
    lista.innerHTML = "";
    
    nomes.forEach((nome, index) => {
        const li = document.createElement("li");
        
        const span = document.createElement("span");
        span.className = "nome";
        span.textContent = nome;
        
        const acoes = document.createElement("div");
        acoes.className = "acoes";
        
        const btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.onclick = () => editarNome(index);
        btnEditar.setAttribute("aria-label", `Editar nome ${nome}`);
        
        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => removerNome(index);
        btnRemover.setAttribute("aria-label", `Remover nome ${nome}`);
        
        acoes.appendChild(btnEditar);
        acoes.appendChild(btnRemover);
        
        li.appendChild(span);
        li.appendChild(acoes);
        
        lista.appendChild(li);
    });
    
    document.getElementById("contador").textContent = nomes.length;
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
    atualizarLista();
    input.value = "";
    input.focus();
    
    showNotification(`Nome "${nome}" adicionado com sucesso!`, 'success');
}

function removerNome(index) {
    const nome = nomes[index];
    if (confirm(`Deseja remover o nome "${nome}"?`)) {
        nomes.splice(index, 1);
        salvarNomes();
        atualizarLista();
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
        atualizarLista();
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
        atualizarLista();
        
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
    
    // Suporte ao Enter para adicionar nomes
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarNome();
        }
    });
    
    // Focar no input ao carregar a página
    input.focus();
    
    // Carregar lista inicial
    atualizarLista();
});