// ...existing code...

document.addEventListener('DOMContentLoaded', () => {
    const totalDaysCount = document.getElementById('dias-contagem');
    let attendedDays = new Set();

    // Função para gerar uma chave única para cada mês/ano
    function getStorageKey(year, month) {
        return `attendance-${year}-${month}`;
    }

    // Carrega os dias marcados do localStorage
    function loadAttendance(year, month) {
        const key = getStorageKey(year, month);
        const data = localStorage.getItem(key);
        attendedDays = new Set(data ? JSON.parse(data) : []);
    }

    // Salva os dias marcados no localStorage
    function saveAttendance(year, month) {
        const key = getStorageKey(year, month);
        localStorage.setItem(key, JSON.stringify(Array.from(attendedDays)));
    }

    function createCalendar(year, month) {
        const calendar = document.getElementById('calendar');
        const calendarHeader = document.getElementById('calendar-header');
        calendar.innerHTML = '';
        calendarHeader.innerHTML = '';

        // Cabeçalho dos dias da semana (segunda a sexta)
        const weekDays = ['seg', 'ter', 'qua', 'qui', 'sex'];
        weekDays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.textContent = day;
            calendarHeader.appendChild(dayHeader);
        });

        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let dayOfWeek = firstDay.getDay();
        let offset = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

        // Preenche espaços vazios antes do primeiro dia útil
        for (let i = 0; i < offset && i < 5; i++) {
            const empty = document.createElement('div');
            calendar.appendChild(empty);
        }

        // Cria os dias do mês, pulando sábados (6) e domingos (0)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const weekDay = date.getDay();
            if (weekDay === 0 || weekDay === 6) continue;

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;

            // Desabilita feriados nacionais
            if (isFeriado(date)) {
                dayDiv.classList.add('feriado');
                dayDiv.title = 'Feriado Nacional';
                dayDiv.style.pointerEvents = 'none';
                dayDiv.style.opacity = '0.5';
            } else {
                if (attendedDays.has(day)) {
                    dayDiv.classList.add('selected');
                }
                dayDiv.addEventListener('click', function () {
                    if (attendedDays.has(day)) {
                        attendedDays.delete(day);
                        dayDiv.classList.remove('selected');
                    } else {
                        attendedDays.add(day);
                        dayDiv.classList.add('selected');
                    }
                    updateAttendanceCount();
                    saveAttendance(year, month);
                });
            }
            calendar.appendChild(dayDiv);
        }
        updateAttendanceCount();
    }

    function updateAttendanceCount() {
        document.getElementById('dias-contagem').textContent = attendedDays.size;
    }

    // Inicializa o calendário com o mês atual e carrega os dados do localStorage
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    loadAttendance(year, month);
    createCalendar(year, month);
    document.getElementById('month-year').textContent =
        today.toLocaleString('default', { month: 'long', year: 'numeric' });
});

const FERIADOS_FIXOS = [
    '01-01', // Confraternização Universal
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
];

// Calcula Corpus Christi (60 dias após a Páscoa)
function getCorpusChristi(year) {
    function getEasterDate(y) {
        var f = Math.floor,
            G = y % 19,
            C = f(y / 100),
            H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
            I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
            J = (y + f(y / 4) + I + 2 - C + f(C / 4)) % 7,
            L = I - J,
            month = 3 + f((L + 40) / 44),
            day = L + 28 - 31 * f(month / 4);
        return new Date(y, month - 1, day);
    }
    const pascoa = getEasterDate(year);
    const corpusChristi = new Date(pascoa);
    corpusChristi.setDate(pascoa.getDate() + 60);
    return corpusChristi;
}

function isFeriado(date) {
    const mmdd = date.toISOString().slice(5, 10);
    if (FERIADOS_FIXOS.includes(mmdd)) return true;
    const cc = getCorpusChristi(date.getFullYear());
    return date.getDate() === cc.getDate() && date.getMonth() === cc.getMonth();
}