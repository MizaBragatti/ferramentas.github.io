const STORAGE_KEY = 'desafio-maior-vendedor';
const CHECK_SECONDS = 180;

const windows = {
  manha: { label: 'Manhã', start: 5 * 60, end: 11 * 60 + 59 },
  tarde: { label: 'Tarde', start: 12 * 60, end: 17 * 60 + 59 },
  noite: { label: 'Noite', start: 18 * 60, end: 24 * 60 - 1, altEnd: 5 * 60 - 1 }
};

const dom = {
  activeTitle: document.getElementById('active-title'),
  activeStatus: document.getElementById('active-status'),
  windowChecks: document.getElementById('window-checks'),
  globalProgress: document.getElementById('global-progress'),
  pergaminhoList: document.getElementById('pergaminho-list'),
  currentWindow: document.getElementById('current-window'),
  dayStatus: document.getElementById('day-status'),
  countdown: document.getElementById('countdown'),
  startBtn: document.getElementById('start-btn'),
  finishBtn: document.getElementById('finish-btn'),
  message: document.getElementById('message'),
  resetAlert: document.getElementById('reset-alert'),
  keepBtn: document.getElementById('keep-btn'),
  resetBtn: document.getElementById('reset-btn'),
  editorPergaminho: document.getElementById('editor-pergaminho'),
  editorDia: document.getElementById('editor-dia'),
  editorManha: document.getElementById('editor-manha'),
  editorTarde: document.getElementById('editor-tarde'),
  editorNoite: document.getElementById('editor-noite'),
  editorSave: document.getElementById('editor-save')
};

let state = loadState();
let timer = null;
let remaining = CHECK_SECONDS;
let currentWindow = getCurrentWindow();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultState();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    pergaminhos: Array.from({ length: 10 }, (_, index) => ({
      numero: index + 1,
      diasConcluidos: 0,
      checkIns: {
        manha: { done: false, at: null },
        tarde: { done: false, at: null },
        noite: { done: false, at: null }
      },
      liberado: index === 0,
      bloqueado: index !== 0
    })),
    pergaminhoAtivo: 1,
    diaAtual: 1,
    ultimoCheckInAt: null
  };
}

function getMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

function getCurrentWindow(date = new Date()) {
  const minutes = getMinutes(date);
  if (minutes >= windows.manha.start && minutes <= windows.manha.end) return 'manha';
  if (minutes >= windows.tarde.start && minutes <= windows.tarde.end) return 'tarde';
  if (minutes >= windows.noite.start || minutes <= windows.noite.altEnd) return 'noite';
  return null;
}

function isWindowValid(janela, now = new Date()) {
  return getCurrentWindow(now) === janela;
}

function hoursBetween(dateA, dateB) {
  return Math.abs(dateA.getTime() - dateB.getTime()) / (1000 * 60 * 60);
}

function canStartCheckIn(janela, now = new Date()) {
  const active = state.pergaminhos[state.pergaminhoAtivo - 1];
  if (!active || !active.liberado) return false;
  if (!isWindowValid(janela, now)) return false;
  if (active.checkIns[janela].done) return false;

  const prev = janela === 'tarde' ? 'manha' : janela === 'noite' ? 'tarde' : null;
  if (prev) {
    const prevCheck = active.checkIns[prev];
    if (!prevCheck.done || !prevCheck.at) return false;
    const diff = hoursBetween(now, new Date(prevCheck.at));
    if (diff < 4) return false;
  }

  return true;
}

function registerCheckIn(janela, now = new Date()) {
  const active = state.pergaminhos[state.pergaminhoAtivo - 1];
  if (!active) return;

  active.checkIns[janela] = { done: true, at: now.toISOString() };
  state.ultimoCheckInAt = now.toISOString();

  if (active.checkIns.manha.done && active.checkIns.tarde.done && active.checkIns.noite.done) {
    active.diasConcluidos += 1;
    active.checkIns = {
      manha: { done: false, at: null },
      tarde: { done: false, at: null },
      noite: { done: false, at: null }
    };

    if (active.diasConcluidos >= 30) {
      const next = state.pergaminhos[active.numero];
      if (next) {
        next.liberado = true;
        next.bloqueado = false;
        state.pergaminhoAtivo = next.numero;
        state.diaAtual = next.diasConcluidos + 1;
      }
    } else {
      state.diaAtual = active.diasConcluidos + 1;
    }
  }

  saveState();
  render();
}

function needsReset(now = new Date()) {
  if (!state.ultimoCheckInAt) return false;
  const last = new Date(state.ultimoCheckInAt);
  return hoursBetween(now, last) > 24;
}

function resetCurrentPergaminho() {
  const active = state.pergaminhos[state.pergaminhoAtivo - 1];
  if (!active) return;
  active.diasConcluidos = 0;
  active.checkIns = {
    manha: { done: false, at: null },
    tarde: { done: false, at: null },
    noite: { done: false, at: null }
  };
  state.diaAtual = 1;
  state.ultimoCheckInAt = null;
  saveState();
  render();
}

function buildProgress() {
  const total = 30 * state.pergaminhos.length;
  const done = state.pergaminhos.reduce((sum, p) => sum + p.diasConcluidos, 0);
  return Math.round((done / total) * 100);
}

function renderPergaminhos() {
  dom.pergaminhoList.innerHTML = '';
  state.pergaminhos.forEach((item) => {
    const card = document.createElement('article');
    card.className = `pergaminho-card ${item.liberado ? 'active' : ''}`;
    card.innerHTML = `
      <span>Pergaminho ${item.numero}</span>
      <strong>${item.diasConcluidos}/30</strong>
      <p>${item.liberado ? 'Ativo' : 'Bloqueado'}</p>
    `;
    dom.pergaminhoList.appendChild(card);
  });
}

function initEditor() {
  for (let i = 1; i <= 10; i += 1) {
    const option = document.createElement('option');
    option.value = `${i}`;
    option.textContent = `Pergaminho ${i}`;
    dom.editorPergaminho.appendChild(option);
  }

  dom.editorPergaminho.addEventListener('change', renderEditor);
  dom.editorSave.addEventListener('click', saveEditorState);
  renderEditor();
}

function renderEditor() {
  const selected = Number(dom.editorPergaminho.value) - 1;
  const item = state.pergaminhos[selected];
  dom.editorDia.value = `${item.diasConcluidos + 1}`;
  dom.editorManha.checked = item.checkIns.manha.done;
  dom.editorTarde.checked = item.checkIns.tarde.done;
  dom.editorNoite.checked = item.checkIns.noite.done;
}

function saveEditorState() {
  const selected = Number(dom.editorPergaminho.value) - 1;
  const dia = Math.min(30, Math.max(1, Number(dom.editorDia.value)));
  const item = state.pergaminhos[selected];

  item.diasConcluidos = dia - 1;
  item.checkIns.manha = {
    done: dom.editorManha.checked,
    at: dom.editorManha.checked ? new Date().toISOString() : null
  };
  item.checkIns.tarde = {
    done: dom.editorTarde.checked,
    at: dom.editorTarde.checked ? new Date().toISOString() : null
  };
  item.checkIns.noite = {
    done: dom.editorNoite.checked,
    at: dom.editorNoite.checked ? new Date().toISOString() : null
  };

  state.pergaminhoAtivo = selected + 1;
  state.diaAtual = dia;
  state.ultimoCheckInAt = new Date().toISOString();

  state.pergaminhos.forEach((p, index) => {
    p.liberado = index <= selected;
    p.bloqueado = index > selected;
  });

  saveState();
  render();
  dom.message.textContent = 'Progresso ajustado com sucesso.';
}

function render() {
  currentWindow = getCurrentWindow();
  const active = state.pergaminhos[state.pergaminhoAtivo - 1];

  dom.activeTitle.textContent = `Pergaminho ${active.numero}`;
  dom.activeStatus.textContent = `${active.diasConcluidos} de 30 dias concluídos`;
  dom.windowChecks.textContent = [
    active.checkIns.manha.done ? 'Manhã ✓' : 'Manhã ×',
    active.checkIns.tarde.done ? 'Tarde ✓' : 'Tarde ×',
    active.checkIns.noite.done ? 'Noite ✓' : 'Noite ×'
  ].join(' • ');

  dom.globalProgress.textContent = `${buildProgress()}%`;
  dom.currentWindow.textContent = currentWindow ? windows[currentWindow].label : 'Fora de horário';
  dom.dayStatus.textContent = `Dia ${state.diaAtual} de 30`;
  dom.countdown.textContent = `${remaining}s`;
  dom.resetAlert.classList.toggle('hidden', !needsReset());
  dom.startBtn.disabled = !currentWindow || !canStartCheckIn(currentWindow) || timer !== null;
  dom.finishBtn.disabled = timer !== null || remaining > 0;
  renderPergaminhos();
}

function startReading() {
  if (!currentWindow || !canStartCheckIn(currentWindow)) {
    dom.message.textContent = 'Não é possível iniciar leitura agora.';
    return;
  }

  dom.message.textContent = 'Leitura iniciada. Aguarde o timer terminar.';
  remaining = CHECK_SECONDS;
  render();

  timer = setInterval(() => {
    remaining -= 1;
    dom.countdown.textContent = `${remaining}s`;
    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      render();
      dom.message.textContent = 'Pronto para concluir a leitura.';
    }
  }, 1000);
}

function finishReading() {
  if (timer !== null || remaining > 0) return;
  registerCheckIn(currentWindow);
  dom.message.textContent = 'Leitura validada com sucesso.';
}

dom.startBtn.addEventListener('click', startReading);
dom.finishBtn.addEventListener('click', finishReading);
dom.keepBtn.addEventListener('click', () => {
  dom.resetAlert.classList.add('hidden');
});
dom.resetBtn.addEventListener('click', () => {
  resetCurrentPergaminho();
  dom.resetAlert.classList.add('hidden');
  dom.message.textContent = 'Progresso reiniciado para o pergaminho atual.';
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    state = loadState();
    render();
  }
});

render();
initEditor();
