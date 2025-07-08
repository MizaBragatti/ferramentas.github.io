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

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "Remover";
        btnRemover.onclick = () => removerNome(index);

        acoes.appendChild(btnEditar);
        acoes.appendChild(btnRemover);

        li.appendChild(span);
        li.appendChild(acoes);

        lista.appendChild(li);
    });
    document.getElementById("contador").textContent = nomes.length;
}



function removerNome(index) {
    if (confirm("Deseja remover este nome?")) {
        nomes.splice(index, 1);
        salvarNomes();
        atualizarLista();
    }
}

function editarNome(index) {
    const novoNome = prompt("Editar nome:", nomes[index]);
    if (novoNome !== null && novoNome.trim()) {
        nomes[index] = novoNome.trim();
        salvarNomes();
        atualizarLista();
    }
}

atualizarLista();

function importarCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const linhas = e.target.result.split('\n').map(l => l.replace(/\r$/, ''));
        if (linhas.length < 2) return;

        // Pega o cabeçalho e acha os índices dos campos de nome
        const cabecalho = linhas[0].split(',');
        const idxFirst = cabecalho.indexOf("First Name");
        const idxMiddle = cabecalho.indexOf("Middle Name");
        const idxLast = cabecalho.indexOf("Last Name");

        for (let i = 1; i < linhas.length; i++) {
            if (!linhas[i].trim()) continue;
            const campos = linhas[i].split(',');
            let nome = '';
            if (idxFirst >= 0 && campos[idxFirst]) nome += campos[idxFirst];
            if (idxMiddle >= 0 && campos[idxMiddle]) nome += ' ' + campos[idxMiddle];
            if (idxLast >= 0 && campos[idxLast]) nome += ' ' + campos[idxLast];
            nome = nome.trim();
            if (nome) adicionarNome(nome);
        }
    };
    reader.readAsText(file, 'UTF-8');
}

// Modifique adicionarNome para aceitar parâmetro opcional:

function adicionarNome(nomeParam) {
    const input = document.getElementById('nomeInput');
    const nome = nomeParam || input.value.trim();
    if (!nome) return;

    if (nome) {
        nomes.push(nome);
        salvarNomes();
        atualizarLista();
        input.value = "";
        input.focus();
    }

    // Adicione o nome à lista (ajuste conforme sua lógica atual)
    const lista = document.getElementById('listaNomes');
    const li = document.createElement('li');
    li.textContent = nome;
    lista.appendChild(li);

    // Atualize o contador
    const contador = document.getElementById('contador');
    contador.textContent = lista.children.length;

    if (!nomeParam) input.value = '';
}