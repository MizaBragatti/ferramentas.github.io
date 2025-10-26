"use client";
import styles from "./page.module.css";
import { useState } from "react";
import Calendar from "../components/Calendar";

export default function Home() {
  const [showCalendar, setShowCalendar] = useState(true);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    servico: "",
    data: "",
    hora: ""
  });
  const [mensagem, setMensagem] = useState("");

  function formatarTelefone(valor: string) {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');
    
    // Formatar baseado na quantidade de dígitos
    if (numeros.length <= 2) {
      return `(${numeros}`;
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else {
      // Limita a 11 dígitos
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    
    if (name === 'telefone') {
      const telefoneFormatado = formatarTelefone(value);
      setForm({ ...form, [name]: telefoneFormatado });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleDateTimeSelect(date: string, time: string) {
    setForm({ ...form, data: date, hora: time });
    setShowCalendar(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    
    // Validar se o telefone tem pelo menos 10 dígitos
    const numerosTelefone = form.telefone.replace(/\D/g, '');
    if (numerosTelefone.length < 10) {
      setMensagem("Por favor, digite um telefone válido com pelo menos 10 dígitos.");
      return;
    }
    
    try {
      const res = await fetch("http://localhost:4000/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMensagem("Agendamento enviado! Em breve entraremos em contato pelo WhatsApp.");
        setForm({ nome: "", telefone: "", servico: "", data: "", hora: "" });
        setShowCalendar(true);
      } else {
        setMensagem("Erro ao enviar agendamento. Tente novamente.");
      }
    } catch {
      setMensagem("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Agende seu horário</h1>
        
        {showCalendar ? (
          <div>
            <p className={styles.subtitle}>Selecione uma data e horário disponível:</p>
            <Calendar onSelectDateTime={handleDateTimeSelect} />
          </div>
        ) : (
          <div>
            <div className={styles.selectedDateTime}>
              <p><strong>Data selecionada:</strong> {new Date(form.data).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {form.hora}</p>
              <button 
                className={styles.changeButton}
                onClick={() => setShowCalendar(true)}
              >
                Alterar data/horário
              </button>
            </div>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <label>
                Nome
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome"
                />
              </label>
              <label>
                Telefone (WhatsApp)
                <input
                  type="tel"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  required
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </label>
              <label>
                Serviço
                <select name="servico" value={form.servico} onChange={handleChange} required>
                  <option value="">Selecione</option>
                  <option value="Corte">Corte</option>
                  <option value="Coloração">Coloração</option>
                  <option value="Escova">Escova</option>
                  <option value="Manicure">Manicure</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>
              <button className={styles.primary} type="submit">Confirmar Agendamento</button>
            </form>
          </div>
        )}
        
        {mensagem && <p className={styles.success}>{mensagem}</p>}
      </main>
    </div>
  );
}
