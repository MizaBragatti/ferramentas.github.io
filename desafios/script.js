document.addEventListener('DOMContentLoaded', function () {
    // Elementos principais
    const mainScreen = document.getElementById('mainScreen');
    const challengeFormScreen = document.getElementById('challengeFormScreen');
    const challengeDisplayScreen = document.getElementById('challengeDisplayScreen');

    // Elementos da tela principal
    const challengeLinks = document.getElementById('challengeLinks');
    const addChallengeBtn = document.getElementById('addChallengeBtn');

    // Elementos do formulário
    const formTitle = document.getElementById('formTitle');
    const challengeNameInput = document.getElementById('challengeName');
    const totalDaysInput = document.getElementById('totalDays');
    const startDateInput = document.getElementById('startDate');
    const saveChallengeBtn = document.getElementById('saveChallenge');
    const cancelChallengeBtn = document.getElementById('cancelChallenge');

    // Elementos da tela de acompanhamento
    const backToMainBtn = document.getElementById('backToMain');
    const currentChallengeTitle = document.getElementById('currentChallengeTitle');
    const completedDaysCount = document.getElementById('completedDaysCount');
    const totalDaysDisplay = document.getElementById('totalDaysDisplay');
    const challengeStartDate = document.getElementById('challengeStartDate');
    const calendarContainer = document.getElementById('calendarContainer');
    const resetChallengeBtn = document.getElementById('resetChallenge');

    // Estado
    let editingChallengeId = null;

    // Utilidades de armazenamento
    function getChallenges() {
        return JSON.parse(localStorage.getItem('challenges') || '[]');
    }
    function saveChallenges(challenges) {
        localStorage.setItem('challenges', JSON.stringify(challenges));
    }

    // Função para formatar data no padrão brasileiro (dd-mm-aaaa)
    function formatDateBR(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    // Navegação entre telas
    function showScreen(screen) {
        mainScreen.style.display = 'none';
        challengeFormScreen.style.display = 'none';
        challengeDisplayScreen.style.display = 'none';
        screen.style.display = '';
    }

    // Renderiza lista de desafios na tela principal
    function renderChallengeLinks() {
        const challenges = getChallenges();
        challengeLinks.innerHTML = '';
        
        // Atualiza estatísticas
        updateStatsDisplay(challenges);
        
        if (challenges.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<span style="color: #8b4513; font-weight: 500;">🌟 Nenhum desafio cadastrado ainda. Que tal começar sua jornada?</span>';
            li.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
            li.style.padding = '30px';
            li.style.borderRadius = '15px';
            li.style.boxShadow = '0 8px 25px rgba(252, 182, 159, 0.3)';
            li.style.listStyle = 'none';
            challengeLinks.appendChild(li);
            return;
        }
        challenges.forEach(challenge => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            
            // Calcula progresso
            const progress = Math.round((challenge.completedDays.length / challenge.totalDays) * 100);
            const progressText = progress > 0 ? ` (${progress}% completo)` : '';
            
            link.innerHTML = `${challenge.name}${progressText}`;
            link.onclick = (e) => {
                e.preventDefault();
                showChallenge(challenge.id);
            };
            li.appendChild(link);
            challengeLinks.appendChild(li);
        });
    }
    
    // Atualiza display de estatísticas
    function updateStatsDisplay(challenges) {
        const statsElement = document.getElementById('statsSummary');
        if (!statsElement) return;
        
        const totalChallenges = challenges.length;
        const totalCompletedDays = challenges.reduce((sum, challenge) => sum + challenge.completedDays.length, 0);
        const activeChallenges = challenges.filter(challenge => challenge.completedDays.length < challenge.totalDays).length;
        
        if (totalChallenges === 0) {
            statsElement.innerHTML = '🚀 Pronto para começar sua primeira conquista?';
        } else {
            statsElement.innerHTML = `📊 ${totalChallenges} desafio${totalChallenges > 1 ? 's' : ''} • ${totalCompletedDays} dias conquistados • ${activeChallenges} ativo${activeChallenges !== 1 ? 's' : ''}`;
        }
    }

    // Cria um novo desafio
    function createChallenge(name, totalDays, startDate) {
        return {
            id: Date.now().toString(),
            name,
            totalDays: Number(totalDays),
            startDate,
            completedDays: []
        };
    }

    // Exibe o formulário para novo desafio
    addChallengeBtn.onclick = () => {
        editingChallengeId = null;
        formTitle.textContent = 'Novo Desafio';
        challengeNameInput.value = '';
        totalDaysInput.value = 30;
        startDateInput.value = '';
        showScreen(challengeFormScreen);
    };

    // Salva desafio (novo ou edição)
    saveChallengeBtn.onclick = () => {
        const name = challengeNameInput.value.trim();
        const totalDays = totalDaysInput.value;
        const startDate = startDateInput.value;
        if (!name || !totalDays || !startDate) {
            alert('Preencha todos os campos!');
            return;
        }
        let challenges = getChallenges();
        if (editingChallengeId) {
            // Editar existente
            const challenge = challenges.find(c => c.id === editingChallengeId);
            if (challenge) {
                challenge.name = name;
                challenge.totalDays = Number(totalDays);
                challenge.startDate = startDate;
            }
        } else {
            // Novo desafio
            const newChallenge = createChallenge(name, totalDays, startDate);
            challenges.push(newChallenge);
        }
        saveChallenges(challenges);
        renderChallengeLinks();
        showScreen(mainScreen);
    };

    // Cancelar criação/edição
    cancelChallengeBtn.onclick = () => {
        showScreen(mainScreen);
    };

    // Exibe acompanhamento de um desafio
    function showChallenge(id) {
        const challenges = getChallenges();
        const challenge = challenges.find(c => c.id === id);
        if (!challenge) return;
        currentChallengeTitle.textContent = challenge.name;
        completedDaysCount.textContent = challenge.completedDays.length;
        totalDaysDisplay.textContent = challenge.totalDays;
        challengeStartDate.textContent = formatDateBR(challenge.startDate);
        renderCalendar(challenge);
        // Salva id do desafio atual para reiniciar
        challengeDisplayScreen.dataset.challengeId = challenge.id;
        showScreen(challengeDisplayScreen);
    }

    // Renderiza o calendário do desafio
    function renderCalendar(challenge) {
        calendarContainer.innerHTML = '';
        
        // Adiciona os cabeçalhos dos dias da semana
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            calendarContainer.appendChild(dayHeader);
        });
        
        // Calcula o dia da semana de início
        const startDate = new Date(challenge.startDate);
        const startDayOfWeek = startDate.getDay(); // 0 = domingo, 1 = segunda, etc.
        
        // Adiciona células vazias antes do primeiro dia
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day-box empty';
            calendarContainer.appendChild(emptyDay);
        }
        
        // Adiciona os dias do desafio
        for (let i = 1; i <= challenge.totalDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.className = challenge.completedDays.includes(i) ? 'day-box completed' : 'day-box';
            
            const dateNumber = document.createElement('span');
            dateNumber.className = 'date-number';
            dateNumber.textContent = i;
            dayBox.appendChild(dateNumber);
            
            dayBox.onclick = () => {
                toggleDay(challenge.id, i);
            };
            calendarContainer.appendChild(dayBox);
        }
    }

    // Marca/desmarca um dia como completo
    function toggleDay(challengeId, day) {
        const challenges = getChallenges();
        const challenge = challenges.find(c => c.id === challengeId);
        if (!challenge) return;
        const idx = challenge.completedDays.indexOf(day);
        if (idx > -1) {
            challenge.completedDays.splice(idx, 1);
        } else {
            challenge.completedDays.push(day);
        }
        saveChallenges(challenges);
        showChallenge(challengeId);
        renderChallengeLinks();
    }

    // Reiniciar desafio
    resetChallengeBtn.onclick = () => {
        const id = challengeDisplayScreen.dataset.challengeId;
        if (!id) return;
        const challenges = getChallenges();
        const challenge = challenges.find(c => c.id === id);
        if (!challenge) return;
        if (!confirm('Tem certeza que deseja reiniciar este desafio?')) return;
        challenge.completedDays = [];
        saveChallenges(challenges);
        showChallenge(id);
        renderChallengeLinks();
    };

    // Voltar para tela principal
    backToMainBtn.onclick = () => {
        showScreen(mainScreen);
    };

    // Inicialização
    function init() {
        renderChallengeLinks();
        showScreen(mainScreen);
    }

    init();
});