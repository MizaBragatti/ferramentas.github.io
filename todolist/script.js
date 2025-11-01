// Variáveis globais
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let currentUser = null;
let unsubscribeTasks = null;

// CONFIGURAÇÃO: Emails autorizados a acessar as tarefas compartilhadas
const AUTHORIZED_EMAILS = [
    'mizabgt@gmail.com',
    'nicolasdesenvolvedor123@gmail.com'
];

// Verificar autenticação
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        console.log('✅ Usuário autenticado:', user.email);
        
        // Atualizar nome do usuário na interface
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = user.displayName || user.email;
        }
        
        // Inicializar aplicação
        initializeApp();
    } else {
        console.log('❌ Usuário não autenticado');
        // Não está logado, redirecionar para login
        window.location.href = 'login.html';
    }
});

// Fazer logout
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        // Cancelar listener de tarefas
        if (unsubscribeTasks) {
            unsubscribeTasks();
        }
        
        auth.signOut().then(() => {
            showToast('Logout realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
            showToast('Erro ao sair', 'error');
        });
    }
}

// Inicializar aplicação
function initializeApp() {
    console.log('🚀 Inicializando aplicação...');
    
    try {
        showLoading(true);
        setupEventListeners();
        loadTasks();
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        showToast('Erro ao carregar aplicação', 'error');
        showLoading(false);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Enter no input para adicionar tarefa
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Enter no input de edição
    document.getElementById('editTaskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveEditTask();
        }
    });

    // Fechar modal clicando fora dele
    document.getElementById('editModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });

    // Esc para fechar modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });
}

// Carregar tarefas do Firestore
function loadTasks() {
    if (!currentUser) {
        console.error('❌ Erro: Usuário não autenticado');
        showToast('Usuário não autenticado', 'error');
        return;
    }

    console.log('📥 Carregando tarefas compartilhadas...');

    try {
        // Cancelar listener anterior se existir
        if (unsubscribeTasks) {
            unsubscribeTasks();
        }

        // Buscar todas as tarefas que pertencem aos emails autorizados
        // Como Firestore não permite 'where in' com arrays grandes de forma eficiente,
        // vamos buscar tarefas onde userEmail está na lista de autorizados
        const baseQuery = db.collection('tasks')
            .orderBy('createdAt', 'desc');

        // Filtrar por emails autorizados
        const queryBy = baseQuery.where('userEmail', 'in', AUTHORIZED_EMAILS);
        console.log('🔎 Buscando tarefas dos emails autorizados:', AUTHORIZED_EMAILS);

        unsubscribeTasks = queryBy.onSnapshot(
                (snapshot) => {
                    console.log('📦 Tarefas recebidas:', snapshot.size);
                    
                    tasks = [];
                    snapshot.forEach((doc) => {
                        tasks.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });

                    console.log('✅ Total de tarefas:', tasks.length);
                    renderTasks();
                    updateCounters();
                    showLoading(false);
                    
                    if (tasks.length === 0) {
                        console.log('ℹ️ Nenhuma tarefa encontrada');
                    }
                },
                (error) => {
                    console.error('❌ Erro ao carregar tarefas:', error);
                    showLoading(false);
                    
                    // Verificar se é erro de índice
                    if (error.code === 'failed-precondition') {
                        showToast('⚠️ É necessário criar um índice no Firestore. Verifique o console.', 'error');
                        console.error('🔧 ÍNDICE NECESSÁRIO. Acesse:', error.message);
                    } else if (error.code === 'permission-denied') {
                        showToast('❌ Permissão negada. Verifique as regras do Firestore.', 'error');
                        console.error('🔒 Verifique as regras de segurança do Firestore');
                    } else {
                        showToast('Erro ao carregar tarefas: ' + error.message, 'error');
                    }
                }
            );
    } catch (error) {
        console.error('❌ Erro ao configurar listener:', error);
        showToast('Erro ao configurar carregamento de tarefas', 'error');
        showLoading(false);
    }
}

// Adicionar nova tarefa
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        showToast('Por favor, digite uma tarefa', 'error');
        taskInput.focus();
        return;
    }

    if (taskText.length > 100) {
        showToast('A tarefa deve ter no máximo 100 caracteres', 'error');
        return;
    }

    try {
        // Desabilitar botão durante o envio
        const addBtn = document.getElementById('addTaskBtn');
        addBtn.disabled = true;
        addBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';

        const newTask = {
            text: taskText,
            completed: false,
            priority: prioritySelect.value,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('tasks').add(newTask);
        
        // Limpar formulário
        taskInput.value = '';
        prioritySelect.value = 'media';
        
        showToast('Tarefa adicionada com sucesso!', 'success');
        taskInput.focus();
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        showToast('Erro ao adicionar tarefa. Tente novamente.', 'error');
    } finally {
        // Reabilitar botão
        const addBtn = document.getElementById('addTaskBtn');
        addBtn.disabled = false;
        addBtn.innerHTML = '<i class="fas fa-plus"></i> Adicionar';
    }
}

// Alternar status de conclusão da tarefa
async function toggleTask(taskId) {
    try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        await db.collection('tasks').doc(taskId).update({
            completed: !task.completed,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const status = !task.completed ? 'concluída' : 'reaberta';
        showToast(`Tarefa ${status}!`, 'success');
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        showToast('Erro ao atualizar tarefa', 'error');
    }
}

// Abrir modal de edição
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;
    document.getElementById('editTaskInput').value = task.text;
    document.getElementById('editPrioritySelect').value = task.priority;
    document.getElementById('editModal').style.display = 'block';
    document.getElementById('editTaskInput').focus();
}

// Salvar edição da tarefa
async function saveEditTask() {
    const editInput = document.getElementById('editTaskInput');
    const editPrioritySelect = document.getElementById('editPrioritySelect');
    const newText = editInput.value.trim();

    if (!newText) {
        showToast('Por favor, digite um texto para a tarefa', 'error');
        editInput.focus();
        return;
    }

    if (newText.length > 100) {
        showToast('A tarefa deve ter no máximo 100 caracteres', 'error');
        return;
    }

    try {
        await db.collection('tasks').doc(editingTaskId).update({
            text: newText,
            priority: editPrioritySelect.value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        closeEditModal();
        showToast('Tarefa atualizada com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao editar tarefa:', error);
        showToast('Erro ao editar tarefa', 'error');
    }
}

// Fechar modal de edição
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    editingTaskId = null;
}

// Excluir tarefa
async function deleteTask(taskId) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }

    try {
        await db.collection('tasks').doc(taskId).delete();
        showToast('Tarefa excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        showToast('Erro ao excluir tarefa', 'error');
    }
}

// Limpar todas as tarefas concluídas
async function clearCompleted() {
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
        showToast('Não há tarefas concluídas para excluir', 'error');
        return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${completedTasks.length} tarefa(s) concluída(s)?`)) {
        return;
    }

    try {
        // Excluir todas as tarefas concluídas
        const batch = db.batch();
        completedTasks.forEach(task => {
            const taskRef = db.collection('tasks').doc(task.id);
            batch.delete(taskRef);
        });
        
        await batch.commit();
        showToast(`${completedTasks.length} tarefa(s) excluída(s) com sucesso!`, 'success');
    } catch (error) {
        console.error('Erro ao limpar tarefas concluídas:', error);
        showToast('Erro ao limpar tarefas concluídas', 'error');
    }
}

// Filtrar tarefas
function filterTasks(filter) {
    currentFilter = filter;
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderTasks();
}

// Renderizar tarefas na tela
function renderTasks() {
    console.log('🎨 Renderizando tarefas... Total:', tasks.length, 'Filtro:', currentFilter);
    
    const tasksList = document.getElementById('tasksList');
    const emptyState = document.getElementById('emptyState');
    
    if (!tasksList || !emptyState) {
        console.error('❌ Elementos da DOM não encontrados');
        return;
    }
    
    // Filtrar tarefas baseado no filtro atual
    let filteredTasks = tasks;
    if (currentFilter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }

    console.log('📊 Tarefas filtradas:', filteredTasks.length);

    // Mostrar estado vazio se não houver tarefas
    if (filteredTasks.length === 0) {
        tasksList.style.display = 'none';
        emptyState.style.display = 'block';
        console.log('ℹ️ Mostrando estado vazio');
        return;
    }

    tasksList.style.display = 'block';
    emptyState.style.display = 'none';

    // Renderizar tarefas
    tasksList.innerHTML = filteredTasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-date">${formatDate(task.createdAt)}</div>
            <div class="task-content">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask('${task.id}')"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-priority priority-${task.priority}">${task.priority}</span>
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="editTask('${task.id}')" title="Editar tarefa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteTask('${task.id}')" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </li>
    `).join('');
    
    console.log('✅ Tarefas renderizadas com sucesso');
}

// Atualizar contadores
function updateCounters() {
    const totalCount = tasks.length;
    const pendingCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    document.getElementById('totalCount').textContent = totalCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
}

// Formatar data
function formatDate(timestamp) {
    if (!timestamp || !timestamp.toDate) {
        return 'Agora';
    }
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return diffInMinutes <= 1 ? 'Agora' : `${diffInMinutes}min`;
    } else if (diffInHours < 24) {
        return `${diffInHours}h`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return diffInDays === 1 ? '1 dia' : `${diffInDays} dias`;
    }
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.style.display = 'block';
    } else {
        loading.style.display = 'none';
    }
}

// Mostrar notificação toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// As funções já são globais por padrão (não são módulos ES6)