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

function adicionarNome() {
    const input = document.getElementById("nomeInput");
    const nome = input.value.trim();
    if (nome) {
        nomes.push(nome);
        salvarNomes();
        atualizarLista();
        input.value = "";
        input.focus();
    }
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