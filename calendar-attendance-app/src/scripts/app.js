// This file contains the JavaScript logic for the calendar attendance application.

document.addEventListener('DOMContentLoaded', () => {
    const daysContainer = document.createElement('div');
    daysContainer.classList.add('calendar');

    const totalDaysCount = document.getElementById('dias-contagem');
    let attendedDays = new Set();

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

        // Encontrar o primeiro dia útil (segunda-feira) do mês
        let currentRow = [];
        let dayOfWeek = firstDay.getDay();
        let offset = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Ajusta para segunda=0, domingo=6

        // Preenche espaços vazios antes do primeiro dia útil
        for (let i = 0; i < offset && i < 5; i++) {
            const empty = document.createElement('div');
            calendar.appendChild(empty);
        }

        // Cria os dias do mês, pulando sábados (6) e domingos (0)
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const weekDay = date.getDay();
            if (weekDay === 0 || weekDay === 6) continue; // pula domingos e sábados

            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;
            dayDiv.addEventListener('click', function () {
                dayDiv.classList.toggle('selected');
                updateAttendanceCount();
            });
            calendar.appendChild(dayDiv);
        }
    }

    function updateAttendanceCount() {
        const selectedDays = document.querySelectorAll('.calendar-day.selected').length;
        document.getElementById('dias-contagem').textContent = selectedDays;
    }
    function toggleAttendance(day) {
        const dateKey = `${day}-${new Date().getMonth()}-${new Date().getFullYear()}`;
        if (attendedDays.has(dateKey)) {
            attendedDays.delete(dateKey);
        } else {
            attendedDays.add(dateKey);
        }
        updateTotalDays();
    }

    function updateTotalDays() {
        totalDaysCount.textContent = attendedDays.size;
    }

    const currentDate = new Date();
    createCalendar(currentDate.getMonth(), currentDate.getFullYear());

    // Inicializa o calendário com o mês atual
    const today = new Date();
    createCalendar(today.getFullYear(), today.getMonth());
    document.getElementById('month-year').textContent =
        today.toLocaleString('default', { month: 'long', year: 'numeric' });
});