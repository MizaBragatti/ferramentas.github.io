let countdownInterval;

// Carregar data de nascimento salva ao carregar a página
window.addEventListener('DOMContentLoaded', function() {
    const savedBirthdate = localStorage.getItem('birthdate');
    const savedAge = localStorage.getItem('customAge');
    
    if (savedBirthdate) {
        document.getElementById('birthdate').value = savedBirthdate;
        document.getElementById('clearBtn').classList.add('show');
    }
    
    if (savedAge) {
        document.getElementById('customAge').value = savedAge;
    }
    
    if (savedBirthdate) {
        calculate();
    }
    
    // Adicionar máscara de data ao campo
    const birthdateInput = document.getElementById('birthdate');
    const clearBtn = document.getElementById('clearBtn');
    
    birthdateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        if (value.length >= 5) {
            value = value.substring(0, 5) + '/' + value.substring(5, 9);
        }
        
        e.target.value = value;
        
        // Mostrar ou esconder botão de limpar
        if (value.length > 0) {
            clearBtn.classList.add('show');
        } else {
            clearBtn.classList.remove('show');
        }
    });
    
    // Permitir apagar completamente com backspace
    birthdateInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace') {
            const cursorPos = e.target.selectionStart;
            const value = e.target.value;
            
            // Se está tentando apagar uma barra, apaga o número antes dela
            if (cursorPos > 0 && value[cursorPos - 1] === '/') {
                e.preventDefault();
                e.target.value = value.substring(0, cursorPos - 2) + value.substring(cursorPos);
                e.target.setSelectionRange(cursorPos - 2, cursorPos - 2);
            }
            // Se só resta 1 caractere ou menos, limpa tudo
            else if (value.length <= 1) {
                e.target.value = '';
            }
        }
    });
});

function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function calculate() {
    const birthdateInput = document.getElementById('birthdate').value;
    if (!birthdateInput) {
        alert('Por favor, insira sua data de nascimento!');
        return;
    }

    // Validar e converter formato DD/MM/AAAA para Date
    const parts = birthdateInput.split('/');
    if (parts.length !== 3) {
        alert('Por favor, use o formato DD/MM/AAAA');
        return;
    }
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript usa mês 0-11
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        alert('Data inválida! Use o formato DD/MM/AAAA');
        return;
    }
    
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) {
        alert('Data fora do intervalo válido!');
        return;
    }

    // Salvar data de nascimento no localStorage
    localStorage.setItem('birthdate', birthdateInput);
    
    // Obter idade limite personalizada
    const customAge = parseInt(document.getElementById('customAge').value) || 120;
    
    // Validar que não ultrapasse 120 anos
    if (customAge < 1 || customAge > 120) {
        alert('A idade limite deve estar entre 1 e 120 anos!');
        return;
    }
    
    localStorage.setItem('customAge', customAge);

    const birthdate = new Date(year, month, day);
    document.getElementById('results').classList.remove('hidden');

    // Calcular anos personalizados em dias e horas (sem considerar anos bissextos)
    const totalDays = customAge * 365;
    document.getElementById('ageTitle').textContent = `${customAge} Anos Equivalem a:`;
    document.getElementById('days120').textContent = totalDays.toLocaleString('pt-BR');
    document.getElementById('hours120').textContent = (totalDays * 24).toLocaleString('pt-BR');

    // Calcular estatísticas
    updateStats(birthdate, customAge);

    // Criar visualizações de timeline
    createYearsGrid(birthdate, customAge);
    createMonthsGrid();
    createDaysGrid();

    // Iniciar contagem regressiva
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    updateCountdown(birthdate, customAge);
    countdownInterval = setInterval(() => updateCountdown(birthdate, customAge), 1000);
}

function clearInput() {
    document.getElementById('birthdate').value = '';
    document.getElementById('clearBtn').classList.remove('show');
    document.getElementById('birthdate').focus();
}

function clearData() {
    // Limpar campo de entrada
    clearInput();
    
    // Limpar localStorage
    localStorage.removeItem('birthdate');
    localStorage.removeItem('customAge');
    
    // Resetar idade para 120
    document.getElementById('customAge').value = '120';
    
    // Esconder resultados
    document.getElementById('results').classList.add('hidden');
    
    // Parar contagem regressiva
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
}

function updateStats(birthdate, customAge) {
    const now = new Date();
    
    // Dia da semana que nasceu
    const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const birthWeekday = weekdays[birthdate.getDay()];
    document.getElementById('birthWeekday').textContent = birthWeekday;
    
    // Dias vividos
    const diffTime = now - birthdate;
    const daysLived = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    document.getElementById('daysLived').textContent = daysLived.toLocaleString('pt-BR');

    // Tempo vivido
    const lived = calculateDetailedTime(birthdate, now);
    document.getElementById('timeLived').textContent = 
        `${lived.years}a ${lived.months}m ${lived.days}d`;

    // Expectativa brasileira (76 anos)
    const expectancy76 = new Date(birthdate);
    expectancy76.setFullYear(expectancy76.getFullYear() + 76);
    
    if (now < expectancy76) {
        const remaining76 = calculateDetailedTime(now, expectancy76);
        document.getElementById('expectancyBR').textContent = 
            `Faltam ${remaining76.years}a ${remaining76.months}m ${remaining76.days}d`;
    } else {
        const exceeded76 = calculateDetailedTime(expectancy76, now);
        document.getElementById('expectancyBR').textContent = 
            `+${exceeded76.years}a ${exceeded76.months}m ${exceeded76.days}d`;
    }

    // Tempo até a idade limite personalizada
    const limitAge = new Date(birthdate);
    limitAge.setFullYear(limitAge.getFullYear() + customAge);
    
    document.getElementById('timeTo120Label').textContent = `Tempo até ${customAge} Anos`;
    document.getElementById('countdownTitle').textContent = `⏱️ Contagem Regressiva até ${customAge} Anos`;
    
    if (now < limitAge) {
        const remainingAge = calculateDetailedTime(now, limitAge);
        document.getElementById('timeTo120').textContent = 
            `${remainingAge.years}a ${remainingAge.months}m ${remainingAge.days}d`;
    } else {
        document.getElementById('timeTo120').textContent = 'Completado!';
    }
}

function calculateDetailedTime(startDate, endDate) {
    let years = 0;
    let months = 0;
    let days = 0;

    let current = new Date(startDate);
    const end = new Date(endDate);

    // Calcular anos
    while (true) {
        const nextYear = new Date(current);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        if (nextYear <= end) {
            years++;
            current = nextYear;
        } else {
            break;
        }
    }

    // Calcular meses
    while (true) {
        const nextMonth = new Date(current);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (nextMonth <= end) {
            months++;
            current = nextMonth;
        } else {
            break;
        }
    }

    // Calcular dias
    days = Math.floor((end - current) / (1000 * 60 * 60 * 24));

    return { years, months, days };
}

function updateCountdown(birthdate, customAge) {
    const now = new Date();
    const limitAge = new Date(birthdate);
    limitAge.setFullYear(limitAge.getFullYear() + customAge);

    if (now >= limitAge) {
        document.getElementById('countYears').textContent = '0';
        document.getElementById('countMonths').textContent = '0';
        document.getElementById('countDays').textContent = '0';
        document.getElementById('countHours').textContent = '0';
        document.getElementById('countMinutes').textContent = '0';
        document.getElementById('countSeconds').textContent = '0';
        return;
    }

    const remaining = calculateDetailedTime(now, limitAge);
    
    // Calcular horas, minutos e segundos restantes no dia atual
    let current = new Date(now);
    current.setFullYear(current.getFullYear() + remaining.years);
    current.setMonth(current.getMonth() + remaining.months);
    current.setDate(current.getDate() + remaining.days);

    const diffMs = limitAge - current;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    document.getElementById('countYears').textContent = remaining.years;
    document.getElementById('countMonths').textContent = remaining.months;
    document.getElementById('countDays').textContent = remaining.days;
    document.getElementById('countHours').textContent = hours;
    document.getElementById('countMinutes').textContent = minutes;
    document.getElementById('countSeconds').textContent = seconds;
}

function createYearsGrid(birthdate, customAge) {
    const grid = document.getElementById('yearsGrid');
    grid.innerHTML = '';

    const birthYear = birthdate.getFullYear();
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < customAge; i++) {
        const year = birthYear + i;
        const div = document.createElement('div');
        div.className = 'year-item';
        div.textContent = year;

        if (year < currentYear) {
            div.classList.add('passed');
        } else if (year === currentYear) {
            div.classList.add('current');
        } else {
            div.classList.add('future');
        }

        grid.appendChild(div);
    }
}

function createMonthsGrid() {
    const grid = document.getElementById('monthsGrid');
    grid.innerHTML = '';

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();

    months.forEach((month, index) => {
        const div = document.createElement('div');
        div.className = 'month-item';
        div.textContent = month;

        if (index < currentMonth) {
            div.classList.add('passed');
        } else if (index === currentMonth) {
            div.classList.add('current');
        } else {
            div.classList.add('future');
        }

        grid.appendChild(div);
    });
}

function createDaysGrid() {
    const grid = document.getElementById('daysGrid');
    grid.innerHTML = '';

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    
    // Descobrir em qual dia da semana começa o mês (0 = Domingo, 1 = Segunda, etc.)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Adicionar cabeçalhos dos dias da semana
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    weekDays.forEach(day => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Adicionar células vazias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfMonth; i++) {
        const empty = document.createElement('div');
        empty.className = 'day-item empty';
        grid.appendChild(empty);
    }
    
    // Adicionar os dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.className = 'day-item';
        div.textContent = i;

        if (i < currentDay) {
            div.classList.add('passed');
        } else if (i === currentDay) {
            div.classList.add('current');
        } else {
            div.classList.add('future');
        }

        grid.appendChild(div);
    }
}
