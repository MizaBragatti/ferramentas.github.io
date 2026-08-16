const { firebase } = window;

const state = {
  drivers: [],
  editingId: null,
  user: null
};

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const logoutBtn = document.getElementById("logoutBtn");
const driversList = document.getElementById("driversList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const totalDrivers = document.getElementById("totalDrivers");
const favoriteDrivers = document.getElementById("favoriteDrivers");
const categoryDrivers = document.getElementById("categoryDrivers");
const newDriverBtn = document.getElementById("newDriverBtn");
const randomDriverBtn = document.getElementById("randomDriverBtn");
const driverModal = document.getElementById("driverModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelDriverBtn = document.getElementById("cancelDriverBtn");
const driverForm = document.getElementById("driverForm");
const modalTitle = document.getElementById("modalTitle");

const isFirebaseConfigured = () => {
  return !!(
    window.firebaseConfig &&
    window.firebaseConfig.apiKey &&
    window.firebaseConfig.projectId &&
    window.firebaseConfig.apiKey !== "SUA_API_KEY"
  );
};

const showMessage = (text, type = "info") => {
  authMessage.textContent = text;
  authMessage.className = `message ${type}`;
  authMessage.classList.remove("hidden");
};

const clearMessage = () => {
  authMessage.textContent = "";
  authMessage.className = "message hidden";
};

const showLogin = () => {
  appSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
};

const showApp = () => {
  loginSection.classList.add("hidden");
  appSection.classList.remove("hidden");
};

const openModal = (driver = null) => {
  state.editingId = driver ? driver.id : null;
  modalTitle.textContent = driver ? "Editar driver" : "Novo driver";

  document.getElementById("driverText").value = driver?.text || "";
  document.getElementById("driverCategory").value = driver?.category || "";
  document.getElementById("driverSource").value = driver?.source || "";
  document.getElementById("driverTags").value = driver?.tags?.join(", ") || "";
  document.getElementById("driverNotes").value = driver?.notes || "";
  document.getElementById("driverFavorite").checked = Boolean(driver?.favorite);

  driverModal.classList.remove("hidden");
  driverModal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  driverForm.reset();
  state.editingId = null;
  driverModal.classList.add("hidden");
  driverModal.setAttribute("aria-hidden", "true");
};

const getUniqueCategories = (drivers) => {
  return [...new Set(drivers.map((driver) => driver.category).filter(Boolean))].sort();
};

const renderCategoryFilter = () => {
  const categories = getUniqueCategories(state.drivers);
  const currentValue = categoryFilter.value || "all";

  categoryFilter.innerHTML = '<option value="all">Todas</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    if (category === currentValue) option.selected = true;
    categoryFilter.appendChild(option);
  });

  if (!categories.includes(currentValue) && currentValue !== "all") {
    categoryFilter.value = "all";
  }
};

const getFilteredDrivers = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  return state.drivers.filter((driver) => {
    const textMatch = !searchTerm ||
      driver.text.toLowerCase().includes(searchTerm) ||
      driver.category.toLowerCase().includes(searchTerm) ||
      driver.tags.join(" ").toLowerCase().includes(searchTerm) ||
      (driver.notes || "").toLowerCase().includes(searchTerm);

    const categoryMatch = selectedCategory === "all" || driver.category === selectedCategory;
    return textMatch && categoryMatch;
  });
};

const updateStats = () => {
  totalDrivers.textContent = String(state.drivers.length);
  favoriteDrivers.textContent = String(state.drivers.filter((driver) => driver.favorite).length);
  categoryDrivers.textContent = String(getUniqueCategories(state.drivers).length);
};

const renderDrivers = () => {
  const filteredDrivers = getFilteredDrivers();

  if (!filteredDrivers.length) {
    driversList.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum driver encontrado</h3>
        <p>Adicione uma frase ou ajuste os filtros para continuar.</p>
      </div>
    `;
    renderCategoryFilter();
    updateStats();
    return;
  }

  driversList.innerHTML = filteredDrivers
    .map(
      (driver) => `
        <article class="driver-card">
          <div class="driver-card-header">
            <div class="driver-badges">
              <span class="category-pill">${driver.category || "Sem categoria"}</span>
              ${driver.source ? `<span class="source-pill">${driver.source}</span>` : ""}
              ${driver.favorite ? '<span class="tag-pill">⭐ Favorito</span>' : ""}
            </div>
          </div>

          <p>“${driver.text}”</p>

          ${driver.tags && driver.tags.length ? `
            <div class="driver-badges">
              ${driver.tags.map((tag) => `<span class="tag-pill">#${tag}</span>`).join("")}
            </div>
          ` : ""}

          ${driver.notes ? `<p><strong>Observação:</strong> ${driver.notes}</p>` : ""}

          <div class="driver-actions">
            <div class="driver-badges">
              ${driver.favorite ? '<span class="tag-pill">Instalado como destaque</span>' : '<span class="tag-pill">Driver em standby</span>'}
            </div>

            <div class="driver-badges">
              <button class="secondary-action" type="button" data-action="edit" data-id="${driver.id}">Editar</button>
              <button class="danger-action" type="button" data-action="delete" data-id="${driver.id}">Excluir</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  renderCategoryFilter();
  updateStats();
};

const normalizeDriver = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    text: data.text || "",
    category: data.category || "Sem categoria",
    source: data.source || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    notes: data.notes || "",
    favorite: Boolean(data.favorite),
    createdAt: data.createdAt || null
  };
};

const ensureCollection = async () => {
  if (!isFirebaseConfigured()) {
    return;
  }

  const collectionName = "drivers";
  const db = firebase.firestore();
  const ref = db.collection(collectionName);
  const snapshot = await ref.limit(1).get();

  if (snapshot.empty) {
    await ref.add({
      text: "A disciplina é a interface que transforma intenção em execução.",
      category: "Disciplina",
      source: "Pablo Marçal",
      tags: ["ação", "disciplina"],
      notes: "Frase para reforçar consistência diária.",
      favorite: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
};

const loadDrivers = async () => {
  if (!isFirebaseConfigured()) {
    state.drivers = [];
    renderDrivers();
    return;
  }

  const db = firebase.firestore();
  const snapshot = await db.collection("drivers").orderBy("createdAt", "desc").get();
  state.drivers = snapshot.docs.map(normalizeDriver);
  renderDrivers();
};

const addDriver = async (payload) => {
  if (!isFirebaseConfigured()) {
    showMessage("Configure o firebase-config.js antes de usar o banco de dados.", "error");
    return;
  }

  const db = firebase.firestore();
  await db.collection("drivers").add({
    ...payload,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await loadDrivers();
};

const updateDriver = async (driverId, payload) => {
  if (!isFirebaseConfigured()) {
    showMessage("Configure o firebase-config.js antes de usar o banco de dados.", "error");
    return;
  }

  const db = firebase.firestore();
  await db.collection("drivers").doc(driverId).update({
    ...payload,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  await loadDrivers();
};

const deleteDriver = async (driverId) => {
  if (!window.confirm("Deseja excluir esse driver mental?")) {
    return;
  }

  if (!isFirebaseConfigured()) {
    showMessage("Configure o firebase-config.js antes de usar o banco de dados.", "error");
    return;
  }

  const db = firebase.firestore();
  await db.collection("drivers").doc(driverId).delete();
  await loadDrivers();
};

const isUserAllowed = (user) => {
  const email = user?.email?.toLowerCase();
  const allowed = Array.isArray(window.allowedEmails) ? window.allowedEmails : [];
  return Boolean(email && allowed.some((entry) => entry.toLowerCase() === email));
};

const handleAuthState = (user) => {
  state.user = user;

  if (!user) {
    showLogin();
    return;
  }

  if (!isUserAllowed(user)) {
    showMessage("Este email não está autorizado para acessar o sistema.", "error");
    firebase.auth().signOut();
    showLogin();
    return;
  }

  clearMessage();
  showApp();
  loadDrivers();
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isFirebaseConfigured()) {
    showMessage("Preencha o firebase-config.js com as credenciais do projeto antes de entrar.", "error");
    return;
  }

  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    showMessage(error.message, "error");
  }
});

logoutBtn.addEventListener("click", async () => {
  await firebase.auth().signOut();
  showLogin();
});

newDriverBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelDriverBtn.addEventListener("click", closeModal);

searchInput.addEventListener("input", renderDrivers);
categoryFilter.addEventListener("change", renderDrivers);

randomDriverBtn.addEventListener("click", () => {
  if (!state.drivers.length) {
    showMessage("Ainda não há drivers cadastrados.", "info");
    return;
  }

  const random = state.drivers[Math.floor(Math.random() * state.drivers.length)];
  if (random) {
    const message = `${random.category}: “${random.text}”`;
    showMessage(message, "success");
  }
});

driverForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    text: document.getElementById("driverText").value.trim(),
    category: document.getElementById("driverCategory").value.trim(),
    source: document.getElementById("driverSource").value.trim(),
    tags: document.getElementById("driverTags").value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: document.getElementById("driverNotes").value.trim(),
    favorite: document.getElementById("driverFavorite").checked
  };

  if (!payload.text || !payload.category) {
    showMessage("Preencha a frase e a categoria antes de salvar.", "error");
    return;
  }

  try {
    if (state.editingId) {
      await updateDriver(state.editingId, payload);
    } else {
      await addDriver(payload);
    }

    closeModal();
    renderDrivers();
    showMessage("Driver salvo com sucesso.", "success");
  } catch (error) {
    showMessage(error.message, "error");
  }
});

driversList.addEventListener("click", async (event) => {
  const target = event.target;
  const action = target.dataset.action;
  const id = target.dataset.id;

  if (!action || !id) return;

  const driver = state.drivers.find((item) => item.id === id);

  if (!driver) return;

  if (action === "edit") {
    openModal(driver);
    return;
  }

  if (action === "delete") {
    await deleteDriver(id);
  }
});

const bootstrap = () => {
  if (!isFirebaseConfigured()) {
    showMessage("Configure o firebase-config.js com suas chaves do Firebase para habilitar o login e o banco.", "error");
    showLogin();
    return;
  }

  firebase.initializeApp(window.firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged((user) => {
    handleAuthState(user);
  });

  db.settings({ experimentalForceLongPolling: true });
  ensureCollection();
};

if (window.firebase && window.firebaseConfig) {
  bootstrap();
} else {
  showMessage("Erro ao carregar o Firebase. Verifique a conexão e as configurações.", "error");
  showLogin();
}
