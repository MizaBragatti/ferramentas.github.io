// Gerenciador de Lista de Versículos
class ListaVersosManager {
    constructor() {
        this.versos = JSON.parse(localStorage.getItem('versiculos') || '[]');
        this.versosFiltrados = [...this.versos];
        this.visualizacaoCompacta = false;
        this.versoParaExcluir = null;
        
        this.carregarLista();
        this.initEventListeners();
    }

    // Inicializar event listeners
    initEventListeners() {
        // Atualizar lista quando voltar para a página
        window.addEventListener('focus', () => {
            this.recarregarDados();
        });

        // Storage event para sincronização
        window.addEventListener('storage', (e) => {
            if (e.key === 'versiculos') {
                this.recarregarDados();
            }
        });
    }

    // Recarregar dados do localStorage
    recarregarDados() {
        this.versos = JSON.parse(localStorage.getItem('versiculos') || '[]');
        this.filtrarVersos();
    }

    // Carregar e exibir lista
    carregarLista() {
        this.renderizarLista();
        this.atualizarContador();
        this.verificarEstadoVazio();
    }

    // Filtrar versículos
    filtrarVersos() {
        const textoFiltro = document.getElementById('filtroTexto').value.toLowerCase().trim();
        const livroFiltro = document.getElementById('filtroLivro').value;

        this.versosFiltrados = this.versos.filter(verso => {
            const matchTexto = !textoFiltro || 
                verso.texto.toLowerCase().includes(textoFiltro) ||
                verso.livro.toLowerCase().includes(textoFiltro) ||
                verso.referencia.toLowerCase().includes(textoFiltro) ||
                (verso.observacoes && verso.observacoes.toLowerCase().includes(textoFiltro));

            const matchLivro = !livroFiltro || verso.livro === livroFiltro;

            return matchTexto && matchLivro;
        });

        this.renderizarLista();
        this.atualizarContador();
        this.verificarEstadoVazio();
    }

    // Renderizar lista de versículos
    renderizarLista() {
        const container = document.getElementById('listaVersos');
        
        if (this.versosFiltrados.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Ordenar por livro, capítulo e versículo
        const versosOrdenados = this.versosFiltrados.sort((a, b) => {
            if (a.livro !== b.livro) return a.livro.localeCompare(b.livro);
            if (a.capitulo !== b.capitulo) return a.capitulo - b.capitulo;
            return a.versiculo - b.versiculo;
        });

        container.innerHTML = versosOrdenados.map(verso => 
            this.visualizacaoCompacta ? this.renderVersoCompacto(verso) : this.renderVersoCompleto(verso)
        ).join('');
    }

    // Render versículo completo
    renderVersoCompleto(verso) {
        return `
            <div class="verse-card" data-id="${verso.id}">
                <div class="verse-header">
                    <div class="verse-reference">${verso.referencia}</div>
                    <div class="verse-date">📅 ${verso.dataCadastro}</div>
                </div>
                
                <div class="verse-content">
                    <div class="verse-text">"${verso.texto}"</div>
                    ${verso.observacoes ? `<div class="verse-notes">📝 ${verso.observacoes}</div>` : ''}
                </div>
                
                <div class="verse-actions">
                    <button onclick="editarVerso(${verso.id})" class="btn-small btn-edit">
                        ✏️ Editar
                    </button>
                    <button onclick="copiarVerso(${verso.id})" class="btn-small btn-copy">
                        📋 Copiar
                    </button>
                    <button onclick="confirmarExclusaoVerso(${verso.id})" class="btn-small btn-delete">
                        🗑️ Excluir
                    </button>
                </div>
                
                ${verso.dataModificacao && verso.dataModificacao !== verso.dataCadastro ? 
                    `<div class="verse-modified">Modificado em: ${verso.dataModificacao}</div>` : ''
                }
            </div>
        `;
    }

    // Render versículo compacto
    renderVersoCompacto(verso) {
        return `
            <div class="verse-card compact" data-id="${verso.id}">
                <div class="compact-content">
                    <div class="compact-reference">${verso.referencia}</div>
                    <div class="compact-text">"${verso.texto.substring(0, 100)}${verso.texto.length > 100 ? '...' : ''}"</div>
                </div>
                <div class="compact-actions">
                    <button onclick="editarVerso(${verso.id})" class="btn-icon" title="Editar">✏️</button>
                    <button onclick="copiarVerso(${verso.id})" class="btn-icon" title="Copiar">📋</button>
                    <button onclick="confirmarExclusaoVerso(${verso.id})" class="btn-icon" title="Excluir">🗑️</button>
                </div>
            </div>
        `;
    }

    // Alternar visualização
    toggleView() {
        this.visualizacaoCompacta = !this.visualizacaoCompacta;
        const btn = document.getElementById('toggleViewBtn');
        
        if (this.visualizacaoCompacta) {
            btn.innerHTML = '📄 Visualização Completa';
            btn.title = 'Mudar para visualização completa';
        } else {
            btn.innerHTML = '📱 Visualização Compacta';
            btn.title = 'Mudar para visualização compacta';
        }
        
        this.renderizarLista();
    }

    // Atualizar contador
    atualizarContador() {
        document.getElementById('totalVersos').textContent = this.versosFiltrados.length;
    }

    // Verificar estado vazio
    verificarEstadoVazio() {
        const emptyState = document.getElementById('emptyState');
        const versesList = document.getElementById('listaVersos');
        
        if (this.versos.length === 0) {
            emptyState.style.display = 'block';
            versesList.style.display = 'none';
        } else if (this.versosFiltrados.length === 0) {
            emptyState.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>Nenhum resultado encontrado</h3>
                <p>Tente ajustar os filtros de busca.</p>
                <button onclick="limparFiltros()" class="btn-secondary">🔄 Limpar Filtros</button>
            `;
            emptyState.style.display = 'block';
            versesList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            versesList.style.display = 'block';
        }
    }

    // Editar versículo
    editarVerso(id) {
        window.location.href = `cadastro.html?edit=${id}`;
    }

    // Copiar versículo
    copiarVerso(id) {
        const verso = this.versos.find(v => v.id === id);
        if (!verso) return;

        const textoCompleto = `${verso.referencia}\n"${verso.texto}"${verso.observacoes ? `\n\nObservações: ${verso.observacoes}` : ''}`;
        
        navigator.clipboard.writeText(textoCompleto).then(() => {
            this.mostrarMensagem('Versículo copiado para a área de transferência! 📋', 'success');
        }).catch(() => {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = textoCompleto;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.mostrarMensagem('Versículo copiado para a área de transferência! 📋', 'success');
        });
    }

    // Confirmar exclusão
    confirmarExclusaoVerso(id) {
        const verso = this.versos.find(v => v.id === id);
        if (!verso) return;

        this.versoParaExcluir = id;
        document.getElementById('modalMensagem').textContent = 
            `Tem certeza que deseja excluir o versículo ${verso.referencia}?`;
        document.getElementById('modalConfirmacao').style.display = 'flex';
    }

    // Executar exclusão
    excluirVerso() {
        if (!this.versoParaExcluir) return;

        this.versos = this.versos.filter(v => v.id !== this.versoParaExcluir);
        localStorage.setItem('versiculos', JSON.stringify(this.versos));
        
        this.versoParaExcluir = null;
        this.recarregarDados();
        this.mostrarMensagem('Versículo excluído com sucesso! 🗑️', 'success');
    }

    // Limpar filtros
    limparFiltros() {
        document.getElementById('filtroTexto').value = '';
        document.getElementById('filtroLivro').value = '';
        this.filtrarVersos();
    }

    // Mostrar mensagem
    mostrarMensagem(texto, tipo) {
        const messagesDiv = document.getElementById('messages');
        messagesDiv.innerHTML = '';
        
        const mensagem = document.createElement('div');
        mensagem.className = `message ${tipo}`;
        mensagem.textContent = texto;
        
        messagesDiv.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.remove();
        }, 4000);
    }
}

// Funções globais
function filtrarVersos() {
    window.listaManager.filtrarVersos();
}

function toggleView() {
    window.listaManager.toggleView();
}

function editarVerso(id) {
    window.listaManager.editarVerso(id);
}

function copiarVerso(id) {
    window.listaManager.copiarVerso(id);
}

function confirmarExclusaoVerso(id) {
    window.listaManager.confirmarExclusaoVerso(id);
}

function confirmarExclusao() {
    window.listaManager.excluirVerso();
    fecharModal();
}

function fecharModal() {
    document.getElementById('modalConfirmacao').style.display = 'none';
    window.listaManager.versoParaExcluir = null;
}

function limparFiltros() {
    window.listaManager.limparFiltros();
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.listaManager = new ListaVersosManager();
});

// Fechar modal com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        fecharModal();
    }
});