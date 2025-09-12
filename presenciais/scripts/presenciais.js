const API_URL = "http://localhost:3000/presenciais";

const form = document.getElementById('cadastro-form');
const nomeInput = document.getElementById('nome');
const diaButtons = document.querySelectorAll('.dia-btn');
const listaBody = document.querySelector('#lista tbody');

let editId = null;

function renderLista(presenciais) {
    listaBody.innerHTML = '';
    presenciais.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td class="${item.dias.includes('Seg') ? 'selected' : ''}">${item.dias.includes('Seg') ? 'Seg' : ''}</td>
            <td class="${item.dias.includes('Ter') ? 'selected' : ''}">${item.dias.includes('Ter') ? 'Ter' : ''}</td>
            <td class="${item.dias.includes('Qua') ? 'selected' : ''}">${item.dias.includes('Qua') ? 'Qua' : ''}</td>
            <td class="${item.dias.includes('Qui') ? 'selected' : ''}">${item.dias.includes('Qui') ? 'Qui' : ''}</td>
            <td class="${item.dias.includes('Sex') ? 'selected' : ''}">${item.dias.includes('Sex') ? 'Sex' : ''}</td>
            <td class="actions">
                <button class="edit" onclick="editar(${item.id})">Editar</button>
                <button class="delete" onclick="excluir(${item.id})">Excluir</button>
            </td>
        `;
        listaBody.appendChild(tr);
    });
}

async function carregarLista() {
    const res = await fetch(API_URL);
    const data = await res.json();
    window._presenciais = data;
    renderLista(data);
}
carregarLista();

form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = nomeInput.value.trim();
    const dias = Array.from(diaButtons).filter(btn => btn.classList.contains('selected')).map(btn => btn.dataset.dia);
    if (!nome) return alert("Informe o nome!");
    if (dias.length !== 2) return alert("Selecione exatamente 2 dias!");
    if (editId) {
        await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, dias })
        });
        editId = null;
    } else {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, dias })
        });
    }
    form.reset();
    diaButtons.forEach(btn => btn.classList.remove('selected'));
    carregarLista();
};

window.editar = (id) => {
    const item = window._presenciais.find(x => x.id === id);
    if (!item) return;
    nomeInput.value = item.nome;
    diaButtons.forEach(btn => btn.classList.toggle('selected', item.dias.includes(btn.dataset.dia)));
    editId = id;
};

window.excluir = async (id) => {
    if (!confirm("Excluir este cadastro?")) return;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    carregarLista();
};


// Limitar seleção a 2 dias com botões
diaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selected = Array.from(diaButtons).filter(b => b.classList.contains('selected'));
        if (btn.classList.contains('selected')) {
            btn.classList.remove('selected');
        } else if (selected.length < 2) {
            btn.classList.add('selected');
        } else {
            alert('Selecione no máximo 2 dias!');
        }
    });
});