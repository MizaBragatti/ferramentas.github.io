// Estado da aplicação
let currentEditingId = null;
let livros = [];
let versos = [];

// Elementos do DOM
const versoForm = document.getElementById('verso-form');
const livroSelect = document.getElementById('livro-select');
const capituloInput = document.getElementById('capitulo');
const versiculoInput = document.getElementById('versiculo');
const textoInput = document.getElementById('texto');
const versoIdInput = document.getElementById('verso-id');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const versosContainer = document.getElementById('versos-container');
const loadingDiv = document.getElementById('loading');
const confirmModal = document.getElementById('confirm-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();
    carregarVersos();
});

versoForm.addEventListener('submit', handleSubmitForm);
cancelBtn.addEventListener('click', cancelarEdicao);
searchInput.addEventListener('input', debounce(filtrarVersos, 300));
document.getElementById('search-btn').addEventListener('click', filtrarVersos);
document.getElementById('confirm-delete').addEventListener('click', confirmarExclusao);
document.getElementById('cancel-delete').addEventListener('click', fecharModal);

// Variável para armazenar o ID do verso a ser excluído
let versoParaExcluir = null;

// Função para debounce (evitar muitas chamadas seguidas)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Carregar livros da API
async function carregarLivros() {
    try {
        const response = await fetch('/api/livros');
        if (!response.ok) throw new Error('Erro ao carregar livros');
        
        livros = await response.json();
        
        // Limpar e popular o select de livros
        livroSelect.innerHTML = '<option value="">Selecione um livro</option>';
        livros.forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.id;
            option.textContent = livro.nome;
            livroSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar livros:', error);
        mostrarMensagem('Erro ao carregar livros', 'error');
    }
}

// Carregar versos da API
async function carregarVersos() {
    mostrarLoading(true);
    
    try {
        const response = await fetch('/api/versos');
        if (!response.ok) throw new Error('Erro ao carregar versos');
        
        versos = await response.json();
        renderizarVersos(versos);
    } catch (error) {
        console.error('Erro ao carregar versos:', error);
        mostrarMensagem('Erro ao carregar versos', 'error');
        versosContainer.innerHTML = '<div class="empty-state"><h3>Erro ao carregar versos</h3></div>';
    } finally {
        mostrarLoading(false);
    }
}

// Renderizar versos na interface
function renderizarVersos(versosParaRenderizar) {
    if (versosParaRenderizar.length === 0) {
        versosContainer.innerHTML = `
            <div class="empty-state">
                <h3>📖 Nenhum verso encontrado</h3>
                <p>Adicione o primeiro verso usando o formulário ao lado</p>
            </div>
        `;
        return;
    }

    versosContainer.innerHTML = versosParaRenderizar.map(verso => `
        <div class="verso-card" data-id="${verso.id}">
            <div class="verso-header">
                <div class="verso-reference">
                    ${verso.livro} ${verso.capitulo}:${verso.versiculo}
                </div>
                <div class="verso-actions">
                    <button class="btn btn-small btn-edit" onclick="editarVerso(${verso.id})" title="Editar">
                        ✏️
                    </button>
                    <button class="btn btn-small btn-delete" onclick="excluirVerso(${verso.id})" title="Excluir">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="verso-text">
                "${verso.texto}"
            </div>
        </div>
    `).join('');
}

// Mostrar/ocultar loading
function mostrarLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

// Manipular envio do formulário
async function handleSubmitForm(e) {
    e.preventDefault();
    
    const formData = {
        livro_id: parseInt(livroSelect.value),
        capitulo: parseInt(capituloInput.value),
        versiculo: parseInt(versiculoInput.value),
        texto: textoInput.value.trim()
    };

    // Validações
    if (!formData.livro_id || !formData.capitulo || !formData.versiculo || !formData.texto) {
        mostrarMensagem('Por favor, preencha todos os campos', 'error');
        return;
    }

    try {
        const isEditing = currentEditingId !== null;
        const url = isEditing ? `/api/versos/${currentEditingId}` : '/api/versos';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro ao salvar verso');
        }

        mostrarMensagem(
            isEditing ? 'Verso atualizado com sucesso!' : 'Verso adicionado com sucesso!', 
            'success'
        );
        
        // Limpar formulário e recarregar versos
        limparFormulario();
        carregarVersos();

    } catch (error) {
        console.error('Erro ao salvar verso:', error);
        mostrarMensagem(error.message, 'error');
    }
}

// Editar verso
async function editarVerso(id) {
    try {
        const response = await fetch(`/api/versos/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar verso');
        
        const verso = await response.json();
        
        // Preencher formulário
        versoIdInput.value = verso.id;
        livroSelect.value = verso.livro_id;
        capituloInput.value = verso.capitulo;
        versiculoInput.value = verso.versiculo;
        textoInput.value = verso.texto;
        
        // Atualizar interface
        currentEditingId = id;
        formTitle.textContent = 'Editar Verso';
        submitBtn.querySelector('.btn-text').textContent = 'Atualizar Verso';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erro ao editar verso:', error);
        mostrarMensagem('Erro ao carregar verso para edição', 'error');
    }
}

// Excluir verso
function excluirVerso(id) {
    versoParaExcluir = id;
    confirmModal.style.display = 'flex';
}

// Confirmar exclusão
async function confirmarExclusao() {
    if (!versoParaExcluir) return;
    
    try {
        const response = await fetch(`/api/versos/${versoParaExcluir}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro ao excluir verso');
        }

        mostrarMensagem('Verso excluído com sucesso!', 'success');
        carregarVersos();
        
    } catch (error) {
        console.error('Erro ao excluir verso:', error);
        mostrarMensagem(error.message, 'error');
    } finally {
        fecharModal();
    }
}

// Fechar modal
function fecharModal() {
    confirmModal.style.display = 'none';
    versoParaExcluir = null;
}

// Cancelar edição
function cancelarEdicao() {
    limparFormulario();
}

// Limpar formulário
function limparFormulario() {
    versoForm.reset();
    versoIdInput.value = '';
    currentEditingId = null;
    formTitle.textContent = 'Adicionar Novo Verso';
    submitBtn.querySelector('.btn-text').textContent = 'Adicionar Verso';
    cancelBtn.style.display = 'none';
}

// Filtrar versos
function filtrarVersos() {
    const termo = searchInput.value.toLowerCase().trim();
    
    if (!termo) {
        renderizarVersos(versos);
        return;
    }

    const versosFiltrados = versos.filter(verso => 
        verso.livro.toLowerCase().includes(termo) ||
        verso.texto.toLowerCase().includes(termo) ||
        `${verso.capitulo}:${verso.versiculo}`.includes(termo)
    );

    renderizarVersos(versosFiltrados);
}

// Mostrar mensagens para o usuário
function mostrarMensagem(mensagem, tipo = 'info') {
    // Remover mensagens anteriores
    const mensagensAnteriores = document.querySelectorAll('.error-message, .success-message');
    mensagensAnteriores.forEach(msg => msg.remove());
    
    const div = document.createElement('div');
    div.className = tipo === 'error' ? 'error-message' : 'success-message';
    div.textContent = mensagem;
    
    // Inserir após o cabeçalho do formulário
    const formSection = document.querySelector('.form-section');
    const formTitle = formSection.querySelector('h2');
    formTitle.parentNode.insertBefore(div, formTitle.nextSibling);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

// Fechar modal clicando fora dele
confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
        fecharModal();
    }
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para cancelar edição ou fechar modal
    if (e.key === 'Escape') {
        if (confirmModal.style.display === 'flex') {
            fecharModal();
        } else if (currentEditingId !== null) {
            cancelarEdicao();
        }
    }
    
    // Ctrl+Enter para submeter formulário
    if (e.ctrlKey && e.key === 'Enter') {
        if (document.activeElement.closest('#verso-form')) {
            versoForm.dispatchEvent(new Event('submit'));
        }
    }
});