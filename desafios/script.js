document.addEventListener('DOMContentLoaded', () => {
    const challengeNameInput = document.getElementById('challengeName');
    const totalDaysInput = document.getElementById('totalDays');
    const startChallengeBtn = document.getElementById('startChallenge');
    const resetChallengeBtn = document.getElementById('resetChallenge');

    const inputSection = document.querySelector('.input-section');
    const challengeDisplay = document.querySelector('.challenge-display');
    const currentChallengeTitle = document.getElementById('currentChallengeTitle');
    const completedDaysCount = document.getElementById('completedDaysCount');
    const totalDaysDisplay = document.getElementById('totalDaysDisplay');
    const daysContainer = document.getElementById('daysContainer');

    let challenge = null;

    // Carregar desafio do localStorage (se existir)
    function loadChallenge() {
        const storedChallenge = localStorage.getItem('dailyChallenge');
        if (storedChallenge) {
            challenge = JSON.parse(storedChallenge);
            renderChallenge();
            challengeDisplay.style.display = 'block';
            inputSection.style.display = 'none';
        }
    }

    // Salvar desafio no localStorage
    function saveChallenge() {
        localStorage.setItem('dailyChallenge', JSON.stringify(challenge));
    }

    // Iniciar um novo desafio
    startChallengeBtn.addEventListener('click', () => {
        const name = challengeNameInput.value.trim();
        const days = parseInt(totalDaysInput.value);

        if (!name) {
            alert('Por favor, insira o nome do desafio.');
            return;
        }
        if (isNaN(days) || days <= 0) {
            alert('Por favor, insira um número válido de dias.');
            return;
        }

        challenge = {
            name: name,
            totalDays: days,
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
            challengeDisplay.style.display = 'none';
            inputSection.style.display = 'block';
            daysContainer.innerHTML = ''; // Limpa os dias exibidos
        }
    });

    // Renderizar o desafio na tela
    function renderChallenge() {
        if (!challenge) return;

        currentChallengeTitle.textContent = challenge.name;
        totalDaysDisplay.textContent = challenge.totalDays;

        const completedCount = challenge.completedDays.filter(day => day).length;
        completedDaysCount.textContent = completedCount;

        daysContainer.innerHTML = ''; // Limpa os dias anteriores

        for (let i = 0; i < challenge.totalDays; i++) {
            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');
            dayBox.textContent = i + 1; // Número do dia
            dayBox.dataset.dayIndex = i; // Armazena o índice do dia

            if (challenge.completedDays[i]) {
                dayBox.classList.add('completed');
            }

            dayBox.addEventListener('click', () => {
                toggleDayCompletion(i);
            });
            daysContainer.appendChild(dayBox);
        }
    }

    // Alternar o status de completude de um dia
    function toggleDayCompletion(index) {
        if (challenge) {
            challenge.completedDays[index] = !challenge.completedDays[index];
            saveChallenge();
            renderChallenge(); // Renderiza novamente para atualizar a visualização
        }
    }

    // Carregar o desafio ao carregar a página
    loadChallenge();
});