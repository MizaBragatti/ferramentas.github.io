"use client";
import { useState, useEffect } from "react";
import styles from "./Calendar.module.css";

interface Agendamento {
  id: number;
  nome: string;
  telefone: string;
  servico: string;
  data: string;
  hora: string;
}

interface DiaIndisponivel {
  id: number;
  data: string;
  hora_inicio?: string;
  hora_fim?: string;
  motivo: string;
  criado_em: string;
}

interface CalendarProps {
  onSelectDateTime: (date: string, time: string) => void;
}

export default function Calendar({ onSelectDateTime }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [diasIndisponiveis, setDiasIndisponiveis] = useState<DiaIndisponivel[]>([]);
  const [availableTimes] = useState([
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ]);

  useEffect(() => {
    // Buscar agendamentos existentes
    fetch("http://localhost:4000/agendamentos")
      .then(res => res.json())
      .then(data => setAgendamentos(data))
      .catch(err => console.error("Erro ao buscar agendamentos:", err));

    // Buscar dias indisponíveis
    fetch("http://localhost:4000/dias-indisponiveis")
      .then(res => res.json())
      .then(data => setDiasIndisponiveis(data))
      .catch(err => console.error("Erro ao buscar dias indisponíveis:", err));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  // Primeiro dia do mês e quantos dias tem
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
    setSelectedDay(null);
  };

  // Verificar se um dia tem horários disponíveis
  const hasAvailableSlots = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Se o dia inteiro está indisponível, não há slots
    if (isDayUnavailable(day)) {
      return false;
    }
    
    const dayAgendamentos = agendamentos.filter(a => a.data === dateStr);
    const occupiedTimes = dayAgendamentos.map(a => a.hora);
    
    // Contar quantos horários estão disponíveis (não ocupados e não indisponíveis)
    const availableCount = availableTimes.filter(time => {
      const isOccupied = occupiedTimes.includes(time);
      const isUnavailable = isTimeUnavailable(day, time);
      return !isOccupied && !isUnavailable;
    }).length;
    
    return availableCount > 0;
  };

  // Verificar se um horário está indisponível
  const isTimeUnavailable = (day: number, time: string) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return diasIndisponiveis.some(diaIndisponivel => {
      if (diaIndisponivel.data !== dateStr) return false;
      
      const horaInicio = diaIndisponivel.hora_inicio;
      const horaFim = diaIndisponivel.hora_fim;
      
      // Se não há horário específico, o dia inteiro está indisponível
      if (!horaInicio || horaInicio.trim() === '' || !horaFim || horaFim.trim() === '') {
        return true;
      }
      
      // Verificar se o horário está dentro da faixa indisponível (inclusive)
      const horaAtual = time.replace(':', '');
      const horaInicioNum = horaInicio.replace(':', '');
      const horaFimNum = horaFim.replace(':', '');
      
      return horaAtual >= horaInicioNum && horaAtual < horaFimNum;
    });
  };

  // Obter horários disponíveis e ocupados para um dia específico
  const getTimesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayAgendamentos = agendamentos.filter(a => a.data === dateStr);
    const occupiedTimes = dayAgendamentos.map(a => a.hora);
    
    return availableTimes.map(time => {
      const isOccupied = occupiedTimes.includes(time);
      const isUnavailable = isTimeUnavailable(day, time);
      
      return {
        time,
        available: !isOccupied && !isUnavailable,
        occupied: isOccupied,
        unavailable: isUnavailable
      };
    });
  };

  // Verificar se um dia está completamente indisponível (dia inteiro)
  const isDayUnavailable = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const result = diasIndisponiveis.some(diaIndisponivel => {
      if (diaIndisponivel.data !== dateStr) return false;
      
      // Verificar se é dia inteiro (sem horários específicos)
      const horaInicio = diaIndisponivel.hora_inicio;
      const horaFim = diaIndisponivel.hora_fim;
      
      // Considera dia inteiro se ambos os horários são null, undefined ou string vazia
      const hasNoHours = !horaInicio || horaInicio.trim() === '' || !horaFim || horaFim.trim() === '';
      
      return hasNoHours;
    });
    
    return result;
  };

  // Verificar se um dia já passou ou se é domingo/segunda ou está indisponível
  const isPastDay = (day: number) => {
    const dayDate = new Date(year, month, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dayOfWeek = dayDate.getDay(); // 0 = domingo, 1 = segunda, 2 = terça...
    
    // Não permite domingos (0) e segundas (1)
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      return true;
    }
    
    // Não permite dias indisponíveis
    if (isDayUnavailable(day)) {
      return true;
    }
    
    return dayDate < todayDate;
  };

  const handleDayClick = (day: number) => {
    if (isPastDay(day) || !hasAvailableSlots(day)) return;
    setSelectedDay(selectedDay === day ? null : day);
  };

  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available || !selectedDay) return;
    
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onSelectDateTime(dateStr, time);
    setSelectedDay(null);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Gerar dias do calendário
  const calendarDays = [];
  
  // Dias vazios do início
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className={styles.emptyDay}></div>);
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const isPast = isPastDay(day);
    const hasSlots = hasAvailableSlots(day);
    const isSelected = selectedDay === day;
    const isUnavailable = isDayUnavailable(day); // Só verdadeiro se o dia inteiro estiver indisponível
    
    let dayClasses = styles.day;
    let indicator = null;
    let title = '';
    
    if (isPast) {
      dayClasses += ` ${styles.pastDay}`;
      title = 'Data já passou ou dia não disponível';
    } else if (isUnavailable) {
      dayClasses += ` ${styles.unavailableDay}`;
      indicator = <div className={styles.unavailableIndicator}>✕</div>;
      title = 'Dia indisponível';
    } else if (!hasSlots) {
      dayClasses += ` ${styles.noSlots}`;
      title = 'Não há horários disponíveis';
    } else {
      indicator = <div className={styles.availableIndicator}></div>;
      title = 'Clique para ver horários disponíveis';
    }
    
    if (isSelected) {
      dayClasses += ` ${styles.selected}`;
    }
    
    calendarDays.push(
      <div
        key={day}
        className={dayClasses}
        onClick={() => handleDayClick(day)}
        title={title}
      >
        {day}
        {indicator}
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={goToPreviousMonth} className={styles.navButton}>‹</button>
        <h2>{monthNames[month]} {year}</h2>
        <button onClick={goToNextMonth} className={styles.navButton}>›</button>
      </div>
      
      <div className={styles.dayNames}>
        {dayNames.map(name => (
          <div key={name} className={styles.dayName}>{name}</div>
        ))}
      </div>
      
      <div className={styles.daysGrid}>
        {calendarDays}
      </div>
      
      {selectedDay && (
        <div className={styles.timeSlots}>
          <h3>Horários disponíveis - {selectedDay}/{month + 1}</h3>
          <div className={styles.timesGrid}>
            {getTimesForDay(selectedDay).map(({ time, available, occupied, unavailable }) => (
              <button
                key={time}
                className={`${styles.timeSlot} ${!available ? (occupied ? styles.occupied : styles.unavailable) : ''}`}
                onClick={() => handleTimeSelect(time, available)}
                disabled={!available}
                title={occupied ? 'Horário ocupado' : unavailable ? 'Horário indisponível' : 'Horário disponível'}
              >
                {time}
                {occupied && <span className={styles.occupiedLabel}>Ocupado</span>}
                {unavailable && <span className={styles.unavailableLabel}>Indisponível</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}