// Estado da aplicação
let livros = [];
let versos = [];
let versosFiltrados = [];
let currentView = 'list'; // 'list' ou 'grid'

// Elementos do DOM
const searchInput = document.getElementById('search-input');
const testamentoFilter = document.getElementById('testamento-filter');
const livroFilter = document.getElementById('livro-filter');
const addNewBtn = document.getElementById('add-new-btn');
const refreshBtn = document.getElementById('refresh-btn');
const versosContainer = document.getElementById('versos-container');
const loadingDiv = document.getElementById('loading');
const versosCount = document.getElementById('versos-count');
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');
const confirmModal = document.getElementById('confirm-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();
    carregarVersos();
    configurarEventListeners();
});

function configurarEventListeners() {
    searchInput.addEventListener('input', debounce(filtrarVersos, 300));
    document.getElementById('search-btn').addEventListener('click', filtrarVersos);
    testamentoFilter.addEventListener('change', filtrarVersos);
    livroFilter.addEventListener('change', filtrarVersos);
    addNewBtn.addEventListener('click', () => window.location.href = 'cadastro.html');
    refreshBtn.addEventListener('click', carregarVersos);
    viewGridBtn.addEventListener('click', () => alternarVisualizacao('grid'));
    viewListBtn.addEventListener('click', () => alternarVisualizacao('list'));
    
    if (confirmModal) {
        document.getElementById('confirm-delete').addEventListener('click', confirmarExclusao);
        document.getElementById('cancel-delete').addEventListener('click', fecharModal);
    }
}

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
        
        // Popular filtro de livros
        livroFilter.innerHTML = '<option value="">Todos os Livros</option>';
        livros.forEach(livro => {
            const option = document.createElement('option');
            option.value = livro.id;
            option.textContent = livro.nome;
            livroFilter.appendChild(option);
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
    versosFiltrados = versosParaRenderizar;
    atualizarEstatisticas();
    
    if (versosParaRenderizar.length === 0) {
        versosContainer.innerHTML = `
            <div class="empty-state">
                <h3>📖 Nenhum verso encontrado</h3>
                <p>Experimente ajustar os filtros ou <a href="cadastro.html">adicionar um novo verso</a></p>
            </div>
        `;
        return;
    }

    const viewClass = currentView === 'grid' ? 'versos-grid' : 'versos-list';
    versosContainer.className = viewClass;

    versosContainer.innerHTML = versosParaRenderizar.map(verso => `
        <div class="verso-card ${currentView === 'grid' ? 'card-grid' : 'card-list'}" data-id="${verso.id}">
            <div class="verso-header">
                <div class="verso-reference">
                    ${verso.livro} ${verso.capitulo}:${verso.versiculo}
                </div>
                <div class="verso-actions">
                    <button class="btn btn-small btn-edit" onclick="editarVerso(${verso.id})" title="Editar">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-small btn-delete" onclick="excluirVerso(${verso.id})" title="Excluir">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
            <div class="verso-text">
                "${verso.texto}"
            </div>
            <div class="verso-footer">
                <span class="verso-length">${verso.texto.length} caracteres</span>
            </div>
        </div>
    `).join('');
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const total = versosFiltrados.length;
    const texto = total === 1 ? '1 verso encontrado' : `${total} versos encontrados`;
    versosCount.textContent = texto;
}

// Alternar visualização
function alternarVisualizacao(novaView) {
    currentView = novaView;
    
    // Atualizar botões
    viewGridBtn.classList.toggle('active', novaView === 'grid');
    viewListBtn.classList.toggle('active', novaView === 'list');
    
    // Re-renderizar com nova visualização
    renderizarVersos(versosFiltrados);
}

// Mostrar/ocultar loading
function mostrarLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}



// Editar verso - redirecionar para página de cadastro
function editarVerso(id) {
    window.location.href = `cadastro.html?edit=${id}`;
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
    const testamentoSelecionado = testamentoFilter.value;
    const livroSelecionado = livroFilter.value;
    
    let versosFiltrados = [...versos];
    
    // Filtro por termo de busca
    if (termo) {
        versosFiltrados = versosFiltrados.filter(verso => 
            verso.livro.toLowerCase().includes(termo) ||
            verso.texto.toLowerCase().includes(termo) ||
            `${verso.capitulo}:${verso.versiculo}`.includes(termo) ||
            `${verso.livro} ${verso.capitulo}:${verso.versiculo}`.toLowerCase().includes(termo)
        );
    }
    
    // Filtro por testamento
    if (testamentoSelecionado) {
        const livrosDoTestamento = livros
            .filter(livro => livro.testamento === testamentoSelecionado)
            .map(livro => livro.nome);
        
        versosFiltrados = versosFiltrados.filter(verso => 
            livrosDoTestamento.includes(verso.livro)
        );
    }
    
    // Filtro por livro específico
    if (livroSelecionado) {
        const livroNome = livros.find(livro => livro.id == livroSelecionado)?.nome;
        if (livroNome) {
            versosFiltrados = versosFiltrados.filter(verso => verso.livro === livroNome);
        }
    }

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
    
    // Inserir no cabeçalho
    const header = document.querySelector('header');
    header.appendChild(div);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.remove();
        }
    }, 5000);
}

// Configurar modal de confirmação (se existir)
if (confirmModal) {
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            fecharModal();
        }
    });
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para fechar modal
    if (e.key === 'Escape') {
        if (confirmModal && confirmModal.style.display === 'flex') {
            fecharModal();
        }
    }
    
    // F5 para atualizar
    if (e.key === 'F5') {
        e.preventDefault();
        carregarVersos();
    }
});