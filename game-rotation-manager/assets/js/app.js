const STORAGE_KEY = "gameRotationManager.games";

const gameForm = document.getElementById("gameForm");
const gameList = document.getElementById("gameList");
const gameTypeFilter = document.getElementById("gameTypeFilter");
const rotationSlotFilter = document.getElementById("rotationSlotFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const recommendBtn = document.getElementById("recommendBtn");
const recommendation = document.getElementById("recommendation");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let games = loadGames();
let editingGameId = null;

renderApp();

gameForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const gameData = {
    title: document.getElementById("title").value.trim(),
    gameType: document.getElementById("gameType").value,
    rotationSlot: document.getElementById("rotationSlot").value,
    status: document.getElementById("status").value,
    progress: clampProgress(Number(document.getElementById("progress").value) || 0),
    notes: document.getElementById("notes").value.trim()
  };

  const normalisedGameData = normaliseGameState(gameData);

  if (editingGameId) {
    games = games.map(game =>
      game.id === editingGameId
        ? { ...game, ...normalisedGameData }
        : game
    );

    editingGameId = null;
    resetFormMode();
  } else {
    games.push({
      id: crypto.randomUUID(),
      ...normalisedGameData
    });
  }

  saveGames();
  gameForm.reset();
  renderApp();
});

cancelEditBtn.addEventListener("click", function () {
  editingGameId = null;
  gameForm.reset();
  resetFormMode();
});

gameTypeFilter.addEventListener("change", renderApp);
rotationSlotFilter.addEventListener("change", renderApp);
statusFilter.addEventListener("change", renderApp);
searchInput.addEventListener("input", renderApp);

recommendBtn.addEventListener("click", function () {
  const result = getRecommendedGame(games);

  if (!result) {
    recommendation.innerHTML = "<p>Everything is completed. Time to add more games.</p>";
    return;
  }

  recommendation.innerHTML = `
    <h3>${result.game.title}</h3>
    <p class="recommendation-score">Recommendation Score: ${result.score}</p>
    <p><strong>Type:</strong> ${result.game.gameType}</p>
    <p><strong>Rotation Slot:</strong> ${result.game.rotationSlot}</p>
    <p><strong>Status:</strong> ${result.game.status}</p>
    <p><strong>Progress:</strong> ${result.game.progress}%</p>

    <div class="recommendation-reasons">
      <strong>Why this game?</strong>
      <ul>
        ${result.reasons.map(reason => `<li>${reason}</li>`).join("")}
      </ul>
    </div>
  `;
});

function loadGames() {
  const savedGames = localStorage.getItem(STORAGE_KEY);

  if (savedGames) {
    const migratedGames = migrateGames(JSON.parse(savedGames));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedGames));
    return migratedGames;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedGames));
  return seedGames;
}

function migrateGames(savedGames) {
  return savedGames.map(game => {
    const { platform, category, rotationType, ...cleanGame } = game;

    const migratedGame = {
      ...cleanGame,
      gameType: mapToCoreGameType(cleanGame.gameType || category),
      rotationSlot: cleanGame.rotationSlot || mapOldRotationTypeToSlot(rotationType),
      progress: clampProgress(Number(cleanGame.progress) || 0),
      notes: cleanGame.notes || ""
    };

    return normaliseGameState(migratedGame);
  });
}

function mapToCoreGameType(type) {
  const typeMap = {
    Stealth: "Stealth",
    TTRPG: "TTRPG",
    "Turn Based": "Turn Based",
    "Open World": "Open World",
    "Story-Based": "Story-Based",
    Survival: "Survival",
    Rogue: "Rogue",
    "Souls-like": "Souls-like",
    Horror: "Horror",

    "Large Campaign": "Open World",
    "Story Game": "Story-Based",
    Roguelike: "Rogue",
    "Completionist Project": "Horror",
    "Casual / Arcade": "Rogue",
    Other: "Story-Based"
  };

  return typeMap[type] || "Story-Based";
}

function mapOldRotationTypeToSlot(rotationType) {
  if (rotationType === "Main") {
    return "Main";
  }

  if (rotationType === "Side") {
    return "Side";
  }

  if (rotationType === "Casual") {
    return "Casual";
  }

  return "Backlog";
}

function normaliseGameState(game) {
  const updatedGame = { ...game };

  if (updatedGame.status === "100% Complete") {
    updatedGame.rotationSlot = "Completed";
    updatedGame.progress = 100;
  }

  if (updatedGame.status === "Completed" && updatedGame.rotationSlot !== "Completed") {
    updatedGame.rotationSlot = "Completed";
  }

  if (updatedGame.rotationSlot === "Completed" && updatedGame.status !== "100% Complete") {
    updatedGame.status = updatedGame.progress >= 100 ? "100% Complete" : "Completed";
  }

  if (updatedGame.rotationSlot === "Paused" && updatedGame.status !== "Completed" && updatedGame.status !== "100% Complete") {
    updatedGame.status = "Paused";
  }

  if (
    (updatedGame.rotationSlot === "Main" ||
      updatedGame.rotationSlot === "Side" ||
      updatedGame.rotationSlot === "Casual") &&
    updatedGame.status === "Not Started"
  ) {
    updatedGame.status = "Playing";
  }

  if (updatedGame.progress >= 100 && updatedGame.status !== "100% Complete") {
    updatedGame.progress = 100;
    updatedGame.status = "100% Complete";
    updatedGame.rotationSlot = "Completed";
  }

  return updatedGame;
}

function saveGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function renderApp() {
  renderStats();
  renderGames();
}

function renderStats() {
  document.getElementById("totalGames").textContent = games.length;

  document.getElementById("activeRotationGames").textContent = games.filter(game =>
    game.rotationSlot === "Main" ||
    game.rotationSlot === "Side" ||
    game.rotationSlot === "Casual"
  ).length;

  document.getElementById("backlogGames").textContent = games.filter(game =>
    game.rotationSlot === "Backlog"
  ).length;

  document.getElementById("hundredPercentGames").textContent = games.filter(game =>
    game.status === "100% Complete"
  ).length;
}

function renderGames() {
  const selectedGameType = gameTypeFilter.value;
  const selectedRotationSlot = rotationSlotFilter.value;
  const selectedStatus = statusFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  const filteredGames = games.filter(game => {
    const matchesGameType =
      selectedGameType === "All" || game.gameType === selectedGameType;

    const matchesRotationSlot =
      selectedRotationSlot === "All" || game.rotationSlot === selectedRotationSlot;

    const matchesStatus =
      selectedStatus === "All" || game.status === selectedStatus;

    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm);

    return matchesGameType && matchesRotationSlot && matchesStatus && matchesSearch;
  });

  if (filteredGames.length === 0) {
    gameList.innerHTML = `<p class="empty-state">No games match the current filters.</p>`;
    return;
  }

  gameList.innerHTML = filteredGames.map(game => createGameCard(game)).join("");

  document.querySelectorAll("[data-edit-id]").forEach(button => {
    button.addEventListener("click", function () {
      startEdit(button.dataset.editId);
    });
  });

  document.querySelectorAll("[data-delete-id]").forEach(button => {
    button.addEventListener("click", function () {
      deleteGame(button.dataset.deleteId);
    });
  });

  document.querySelectorAll("[data-progress-id]").forEach(button => {
    button.addEventListener("click", function () {
      increaseProgress(button.dataset.progressId);
    });
  });

  document.querySelectorAll("[data-slot-id]").forEach(button => {
    button.addEventListener("click", function () {
      updateRotationSlot(button.dataset.slotId, button.dataset.slotValue);
    });
  });

  document.querySelectorAll("[data-complete-id]").forEach(button => {
    button.addEventListener("click", function () {
      markComplete(button.dataset.completeId);
    });
  });
}

function createGameCard(game) {
  return `
    <article class="game-card">
      <div class="game-card-header">
        <h3>${game.title}</h3>
        <span class="rotation-pill ${getRotationClass(game.rotationSlot)}">${game.rotationSlot}</span>
      </div>

      <p class="game-meta"><strong>Type:</strong> ${game.gameType}</p>
      <p class="game-meta"><strong>Status:</strong> ${game.status}</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${game.progress}%"></div>
      </div>

      <p class="game-meta"><strong>Progress:</strong> ${game.progress}%</p>

      ${game.notes ? `<p>${game.notes}</p>` : ""}

      <div class="card-actions">
        <button data-edit-id="${game.id}">Edit</button>
        <button data-progress-id="${game.id}">+10%</button>
        <button class="delete-button" data-delete-id="${game.id}">Delete</button>
      </div>

      <div class="quick-actions">
        <button data-slot-id="${game.id}" data-slot-value="Main">Set Main</button>
        <button data-slot-id="${game.id}" data-slot-value="Side">Set Side</button>
        <button data-slot-id="${game.id}" data-slot-value="Casual">Set Casual</button>
        <button data-slot-id="${game.id}" data-slot-value="Backlog">Backlog</button>
        <button data-slot-id="${game.id}" data-slot-value="Paused">Pause</button>
        <button data-complete-id="${game.id}">Complete</button>
      </div>
    </article>
  `;
}

function startEdit(id) {
  const game = games.find(game => game.id === id);

  if (!game) {
    return;
  }

  editingGameId = id;

  document.getElementById("title").value = game.title;
  document.getElementById("gameType").value = game.gameType;
  document.getElementById("rotationSlot").value = game.rotationSlot;
  document.getElementById("status").value = game.status;
  document.getElementById("progress").value = game.progress;
  document.getElementById("notes").value = game.notes;

  formTitle.textContent = "Edit Game";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetFormMode() {
  formTitle.textContent = "Add Game";
  submitBtn.textContent = "Add Game";
  cancelEditBtn.classList.add("hidden");
}

function deleteGame(id) {
  games = games.filter(game => game.id !== id);

  if (editingGameId === id) {
    editingGameId = null;
    gameForm.reset();
    resetFormMode();
  }

  saveGames();
  renderApp();
}

function increaseProgress(id) {
  games = games.map(game => {
    if (game.id !== id) {
      return game;
    }

    const updatedProgress = Math.min(game.progress + 10, 100);

    return normaliseGameState({
      ...game,
      progress: updatedProgress
    });
  });

  saveGames();
  renderApp();
}

function updateRotationSlot(id, rotationSlot) {
  games = games.map(game => {
    if (game.id !== id) {
      return game;
    }

    let updatedStatus = game.status;

    if (rotationSlot === "Backlog") {
      updatedStatus = game.progress > 0 ? "Paused" : "Not Started";
    }

    if (rotationSlot === "Paused") {
      updatedStatus = "Paused";
    }

    if (
      rotationSlot === "Main" ||
      rotationSlot === "Side" ||
      rotationSlot === "Casual"
    ) {
      updatedStatus = "Playing";
    }

    return normaliseGameState({
      ...game,
      rotationSlot,
      status: updatedStatus
    });
  });

  saveGames();
  renderApp();
}

function markComplete(id) {
  games = games.map(game => {
    if (game.id !== id) {
      return game;
    }

    return {
      ...game,
      rotationSlot: "Completed",
      status: "Completed",
      progress: game.progress >= 100 ? 100 : game.progress
    };
  });

  saveGames();
  renderApp();
}

function getRotationClass(rotationSlot) {
  if (rotationSlot === "Main") {
    return "rotation-main";
  }

  if (rotationSlot === "Side") {
    return "rotation-side";
  }

  if (rotationSlot === "Casual") {
    return "rotation-casual";
  }

  if (rotationSlot === "Backlog") {
    return "rotation-backlog";
  }

  if (rotationSlot === "Paused") {
    return "rotation-paused";
  }

  return "rotation-completed";
}

function clampProgress(progress) {
  if (progress < 0) {
    return 0;
  }

  if (progress > 100) {
    return 100;
  }

  return progress;
}