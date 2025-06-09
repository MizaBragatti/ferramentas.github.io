document.addEventListener('DOMContentLoaded', () => {
    const challengeNameInput = document.getElementById('challengeName');
    const totalDaysInput = document.getElementById('totalDays');
    const startDateInput = document.getElementById('startDate'); // Novo campo
    const startChallengeBtn = document.getElementById('startChallenge');
    const resetChallengeBtn = document.getElementById('resetChallenge');

    const inputSection = document.querySelector('.input-section');
    const challengeDisplay = document.querySelector('.challenge-display');
    const currentChallengeTitle = document.getElementById('currentChallengeTitle');
    const completedDaysCount = document.getElementById('completedDaysCount');
    const totalDaysDisplay = document.getElementById('totalDaysDisplay');
    const challengeStartDateDisplay = document.getElementById('challengeStartDate'); // Novo elemento
    const calendarContainer = document.getElementById('calendarContainer'); // Alterado para calendarContainer

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    let challenge = null;

    // Carregar desafio do localStorage (se existir)
    function loadChallenge() {
        const storedChallenge = localStorage.getItem('dailyChallenge');
        if (storedChallenge) {
            challenge = JSON.parse(storedChallenge);
            // Converter a string da data de volta para um objeto Date
            challenge.startDate = new Date(challenge.startDate); 
            renderChallenge();
            challengeDisplay.style.display = 'block';
            inputSection.style.display = 'none';
        }
    }

    // Salvar desafio no localStorage
    function saveChallenge() {
        // Armazenar a data como string para fácil serialização
        const challengeToSave = {
            ...challenge,
            startDate: challenge.startDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
        };
        localStorage.setItem('dailyChallenge', JSON.stringify(challengeToSave));
    }

    // Iniciar um novo desafio
    startChallengeBtn.addEventListener('click', () => {
        const name = challengeNameInput.value.trim();
        const days = parseInt(totalDaysInput.value);
        const startDateString = startDateInput.value;

        if (!name) {
            alert('Por favor, insira o nome do desafio.');
            return;
        }
        if (isNaN(days) || days <= 0) {
            alert('Por favor, insira um número válido de dias.');
            return;
        }
        if (!startDateString) {
            alert('Por favor, selecione a data de início do desafio.');
            return;
        }

        const startDate = new Date(startDateString + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso horário
        startDate.setHours(0, 0, 0, 0); // Zera hora, minuto, segundo e milissegundo

        challenge = {
            name: name,
            totalDays: days,
            startDate: startDate,
            completedDays: Array(days).fill(false) // Array para controlar quais dias foram completados
        };
        saveChallenge();
        renderChallenge();

        inputSection.style.display = 'none';
        challengeDisplay.style.display = 'block';
    });

    // Reiniciar desafio
    resetChallengeBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja reiniciar o desafio? Todo o progresso será perdido.')) {
            localStorage.removeItem('dailyChallenge');
            challenge = null;
            challengeNameInput.value = '';
            totalDaysInput.value = '30';
            startDateInput.value = ''; // Limpa o campo de data
            challengeDisplay.style.display = 'none';
            inputSection.style.display = 'block';
            calendarContainer.innerHTML = ''; // Limpa o calendário
        }
    });

    // Renderizar o desafio na tela
    function renderChallenge() {
        if (!challenge) return;

        currentChallengeTitle.textContent = challenge.name;
        totalDaysDisplay.textContent = challenge.totalDays;
        challengeStartDateDisplay.textContent = challenge.startDate.toLocaleDateString('pt-BR');
        
        const completedCount = challenge.completedDays.filter(day => day).length;
        completedDaysCount.textContent = completedCount;

        calendarContainer.innerHTML = ''; // Limpa o calendário anterior

        // Adiciona os cabeçalhos dos dias da semana
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            calendarContainer.appendChild(dayHeader);
        });

        // Calcula o dia da semana do primeiro dia do desafio (0=Domingo, 6=Sábado)
        const firstDayOfWeek = challenge.startDate.getDay();

        // Adiciona caixas vazias para preencher os dias antes do início do desafio
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyBox = document.createElement('div');
            emptyBox.classList.add('day-box', 'empty');
            calendarContainer.appendChild(emptyBox);
        }

        // Adiciona os dias do desafio
        for (let i = 0; i < challenge.totalDays; i++) {
            const currentDay = new Date(challenge.startDate);
            currentDay.setDate(challenge.startDate.getDate() + i); // Adiciona 'i' dias à data de início

            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');
            dayBox.innerHTML = `<span class="date-number">${currentDay.getDate()}</span>`; // Exibe apenas o número do dia

            // Opcional: Adicionar a data completa como um atributo para debug ou tooltip
            dayBox.title = currentDay.toLocaleDateString('pt-BR');

            // Verifica se o dia atual é o dia "i" do desafio e se está completo
            if (challenge.completedDays[i]) {
                dayBox.classList.add('completed');
            }

            dayBox.dataset.dayIndex = i; // Armazena o índice do dia do desafio (0 a totalDays-1)

            dayBox.addEventListener('click', () => {
                toggleDayCompletion(i); // Passa o índice do dia do desafio
            });
            calendarContainer.appendChild(dayBox);
        }
    }

    // Alternar o status de completude de um dia
    function toggleDayCompletion(index) {
        if (challenge && index >= 0 && index < challenge.totalDays) {
            challenge.completedDays[index] = !challenge.completedDays[index];
            saveChallenge();
            renderChallenge(); // Renderiza novamente para atualizar a visualização
        }
    }

    // Carregar o desafio ao carregar a página
    loadChallenge();
});