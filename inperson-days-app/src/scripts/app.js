const form = document.getElementById('days-form');
const monthYear = document.getElementById('month-year');

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth(); // 0-indexed
const monthKey = `${year}-${month + 1}`;

// Função para obter todas as quartas e quintas do mês
function getWednesdaysAndThursdays(year, month) {
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        if (date.getDay() === 3 || date.getDay() === 4) { // 3=quarta, 4=quinta
            days.push(new Date(date));
        }
        date.setDate(date.getDate() + 1);
    }
    return days;
}

// Carrega os dias marcados do localStorage
function loadCheckedDays() {
    return JSON.parse(localStorage.getItem(`inperson-days-${monthKey}`)) || [];
}

// Salva os dias marcados no localStorage
function saveCheckedDays(checked) {
    localStorage.setItem(`inperson-days-${monthKey}`, JSON.stringify(checked));
}

// Renderiza os checkboxes
function renderDays() {
    const mandatoryDays = getWednesdaysAndThursdays(year, month);
    const weekDays = getCurrentWeekdays();

    // Evita duplicidade caso algum dia obrigatório caia na semana corrente
    const allDaysMap = {};
    mandatoryDays.concat(weekDays).forEach(date => {
        const dateStr = date.toISOString().slice(0, 10);
        allDaysMap[dateStr] = date;
    });

    const allDays = Object.values(allDaysMap).sort((a, b) => a - b);

    const checkedDays = loadCheckedDays();
    form.innerHTML = '';
    allDays.forEach((date) => {
        const dateStr = date.toISOString().slice(0, 10);
        const checked = checkedDays.includes(dateStr) ? 'checked' : '';
        form.innerHTML += `
            <label>
                <input type="checkbox" data-date="${dateStr}" ${checked}>
                ${date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}
            </label><br>
        `;
    });
    // Mostra mês/ano
    monthYear.textContent = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    atualizarDiasTrabalhados();
}

// Atualiza o contador de dias trabalhados
function atualizarDiasTrabalhados() {
    const checkboxes = document.querySelectorAll('#days-form input[type="checkbox"]:checked');
    document.getElementById('dias-contagem').textContent = checkboxes.length;
}

// Evento para marcar/desmarcar dias
form.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
        const checkedDays = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
            .map(cb => cb.dataset.date);
        saveCheckedDays(checkedDays);
        atualizarDiasTrabalhados();
    }
});

renderDays();

function getCurrentWeekdays() {
    const today = new Date();
    // Segunda-feira (1) até sexta-feira (5)
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    const days = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(firstDayOfWeek);
        d.setDate(firstDayOfWeek.getDate() + i);
        days.push(new Date(d));
    }
    return days;
}