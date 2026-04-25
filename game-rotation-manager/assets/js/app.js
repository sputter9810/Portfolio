const STORAGE_KEY = "gameRotationManager.games";

const gameForm = document.getElementById("gameForm");
const gameList = document.getElementById("gameList");
const gameTypeFilter = document.getElementById("gameTypeFilter");
const rotationSlotFilter = document.getElementById("rotationSlotFilter");
const statusFilter = document.getElementById("statusFilter");
const searchInput = document.getElementById("searchInput");
const focusModeToggle = document.getElementById("focusModeToggle");
const recommendBtn = document.getElementById("recommendBtn");
const suggestRotationBtn = document.getElementById("suggestRotationBtn");
const recommendation = document.getElementById("recommendation");
const rotationSuggestion = document.getElementById("rotationSuggestion");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");

let games = loadGames();
let editingGameId = null;
let latestSuggestedRotation = null;

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
    games = games.map(game => {
      if (game.id !== editingGameId) {
        return game;
      }

      return {
        ...game,
        ...normalisedGameData
      };
    });

    games = enforceUniqueActiveSlots(games, editingGameId, normalisedGameData.rotationSlot);

    editingGameId = null;
    resetFormMode();
  } else {
    const newGame = {
      id: crypto.randomUUID(),
      ...normalisedGameData
    };

    games.push(newGame);
    games = enforceUniqueActiveSlots(games, newGame.id, newGame.rotationSlot);
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
focusModeToggle.addEventListener("change", renderApp);
exportBtn.addEventListener("click", exportBackup);
importInput.addEventListener("change", importBackup);

recommendBtn.addEventListener("click", function () {
  const result = getRecommendedGame(games);

  if (!result) {
    recommendation.innerHTML = "<p>Everything is completed. Time to add more games.</p>";
    return;
  }

  recommendation.innerHTML = `
    <h3>${escapeHtml(result.game.title)}</h3>
    <p class="recommendation-score">Recommendation Score: ${result.score}</p>
    <p><strong>Type:</strong> ${escapeHtml(result.game.gameType)}</p>
    <p><strong>Rotation Slot:</strong> ${escapeHtml(result.game.rotationSlot)}</p>
    <p><strong>Status:</strong> ${escapeHtml(result.game.status)}</p>
    <p><strong>Progress:</strong> ${result.game.progress}%</p>

    <div class="recommendation-reasons">
      <strong>Why this game?</strong>
      <ul>
        ${result.reasons.map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    </div>
  `;
});

suggestRotationBtn.addEventListener("click", function () {
  latestSuggestedRotation = suggestRotation(games);
  renderRotationSuggestion();
});

function renderRotationSuggestion() {
  rotationSuggestion.classList.remove("hidden");

  if (!latestSuggestedRotation) {
    rotationSuggestion.innerHTML = "<p>No suitable rotation could be suggested.</p>";
    return;
  }

  const activeSlots = getCurrentActiveSlots();
  const warnings = [];

  if (activeSlots.Main && latestSuggestedRotation.Main?.game.id !== activeSlots.Main.id) {
    warnings.push(`Current Main is ${activeSlots.Main.title}. Applying will replace it.`);
  }

  if (activeSlots.Side && latestSuggestedRotation.Side?.game.id !== activeSlots.Side.id) {
    warnings.push(`Current Side is ${activeSlots.Side.title}. Applying will replace it.`);
  }

  if (activeSlots.Casual && latestSuggestedRotation.Casual?.game.id !== activeSlots.Casual.id) {
    warnings.push(`Current Casual is ${activeSlots.Casual.title}. Applying will replace it.`);
  }

  rotationSuggestion.innerHTML = `
    <h3>Suggested Rotation</h3>

    ${warnings.length > 0 ? `
      <div class="warning-box">
        <strong>Slot replacement warning:</strong>
        <ul>
          ${warnings.map(warning => `<li>${escapeHtml(warning)}</li>`).join("")}
        </ul>
      </div>
    ` : ""}

    ${createSuggestedSlotMarkup("Main", latestSuggestedRotation.Main)}
    ${createSuggestedSlotMarkup("Side", latestSuggestedRotation.Side)}
    ${createSuggestedSlotMarkup("Casual", latestSuggestedRotation.Casual)}

    <button id="applyRotationBtn" class="secondary-button">Apply Suggested Rotation</button>
  `;

  document.getElementById("applyRotationBtn").addEventListener("click", applySuggestedRotation);
}

function createSuggestedSlotMarkup(slot, suggestion) {
  if (!suggestion) {
    return `
      <div class="suggested-slot">
        <h4>${slot}</h4>
        <p>No suitable game found.</p>
      </div>
    `;
  }

  const keptLabel = suggestion.isKept ? `<span class="kept-label">Kept</span>` : `<span class="new-label">New Pick</span>`;

  return `
    <div class="suggested-slot">
      <h4>${slot}: ${escapeHtml(suggestion.game.title)} ${keptLabel}</h4>
      <p class="recommendation-score">Slot Score: ${suggestion.score}</p>
      <p><strong>Type:</strong> ${escapeHtml(suggestion.game.gameType)}</p>
      <p><strong>Current Slot:</strong> ${escapeHtml(suggestion.game.rotationSlot)}</p>
      <p><strong>Status:</strong> ${escapeHtml(suggestion.game.status)}</p>
      <ul>
        ${suggestion.reasons.slice(0, 3).map(reason => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function applySuggestedRotation() {
  if (!latestSuggestedRotation) {
    return;
  }

  const suggestedSlots = {
    Main: latestSuggestedRotation.Main?.game.id,
    Side: latestSuggestedRotation.Side?.game.id,
    Casual: latestSuggestedRotation.Casual?.game.id
  };

  games = games.map(game => {
    if (game.id === suggestedSlots.Main) {
      return normaliseGameState({ ...game, rotationSlot: "Main", status: "Playing" });
    }

    if (game.id === suggestedSlots.Side) {
      return normaliseGameState({ ...game, rotationSlot: "Side", status: "Playing" });
    }

    if (game.id === suggestedSlots.Casual) {
      return normaliseGameState({ ...game, rotationSlot: "Casual", status: "Playing" });
    }

    if (
      isActiveRotationSlot(game.rotationSlot) &&
      game.id !== suggestedSlots.Main &&
      game.id !== suggestedSlots.Side &&
      game.id !== suggestedSlots.Casual
    ) {
      return normaliseGameState({
        ...game,
        rotationSlot: game.progress > 0 ? "Paused" : "Backlog",
        status: game.progress > 0 ? "Paused" : "Not Started"
      });
    }

    return game;
  });

  saveGames();
  renderApp();

  rotationSuggestion.innerHTML = `
    <h3>Suggested Rotation Applied</h3>
    <p>Your active trio has been updated.</p>
  `;
}

function getCurrentActiveSlots() {
  return {
    Main: games.find(game => game.rotationSlot === "Main"),
    Side: games.find(game => game.rotationSlot === "Side"),
    Casual: games.find(game => game.rotationSlot === "Casual")
  };
}

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

  updatedGame.progress = clampProgress(Number(updatedGame.progress) || 0);

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
    isActiveRotationSlot(updatedGame.rotationSlot) &&
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

function enforceUniqueActiveSlots(gameListToUpdate, activeGameId, slot) {
  if (!isActiveRotationSlot(slot)) {
    return gameListToUpdate;
  }

  return gameListToUpdate.map(game => {
    if (game.id === activeGameId || game.rotationSlot !== slot) {
      return game;
    }

    return normaliseGameState({
      ...game,
      rotationSlot: game.progress > 0 ? "Paused" : "Backlog",
      status: game.progress > 0 ? "Paused" : "Not Started"
    });
  });
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
    isActiveRotationSlot(game.rotationSlot)
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
  const focusModeEnabled = focusModeToggle.checked;

  const filteredGames = games.filter(game => {
    const matchesFocusMode =
      !focusModeEnabled || isActiveRotationSlot(game.rotationSlot);

    const matchesGameType =
      selectedGameType === "All" || game.gameType === selectedGameType;

    const matchesRotationSlot =
      selectedRotationSlot === "All" || game.rotationSlot === selectedRotationSlot;

    const matchesStatus =
      selectedStatus === "All" || game.status === selectedStatus;

    const matchesSearch =
      game.title.toLowerCase().includes(searchTerm);

    return matchesFocusMode && matchesGameType && matchesRotationSlot && matchesStatus && matchesSearch;
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
      updateProgress(button.dataset.progressId, Number(button.dataset.progressValue));
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
        <h3>${escapeHtml(game.title)}</h3>
        <span class="rotation-pill ${getRotationClass(game.rotationSlot)}">${escapeHtml(game.rotationSlot)}</span>
      </div>

      <p class="game-meta"><strong>Type:</strong> ${escapeHtml(game.gameType)}</p>
      <p class="game-meta"><strong>Status:</strong> ${escapeHtml(game.status)}</p>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${game.progress}%"></div>
      </div>

      <p class="game-meta"><strong>Progress:</strong> ${game.progress}%</p>

      ${game.notes ? `<p>${escapeHtml(game.notes)}</p>` : ""}

      <div class="card-actions">
        <button data-edit-id="${game.id}">Edit</button>
        <button class="delete-button" data-delete-id="${game.id}">Delete</button>
      </div>

      <div class="progress-actions">
        <button data-progress-id="${game.id}" data-progress-value="-10">-10%</button>
        <button data-progress-id="${game.id}" data-progress-value="5">+5%</button>
        <button data-progress-id="${game.id}" data-progress-value="10">+10%</button>
        <button data-progress-id="${game.id}" data-progress-value="100">Set 100%</button>
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

function updateProgress(id, changeAmount) {
  games = games.map(game => {
    if (game.id !== id) {
      return game;
    }

    const updatedProgress =
      changeAmount === 100
        ? 100
        : clampProgress(game.progress + changeAmount);

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

    if (isActiveRotationSlot(rotationSlot)) {
      updatedStatus = "Playing";
    }

    return normaliseGameState({
      ...game,
      rotationSlot,
      status: updatedStatus
    });
  });

  games = enforceUniqueActiveSlots(games, id, rotationSlot);

  saveGames();
  renderApp();
}

function markComplete(id) {
  games = games.map(game => {
    if (game.id !== id) {
      return game;
    }

    return normaliseGameState({
      ...game,
      rotationSlot: "Completed",
      status: "Completed",
      progress: game.progress >= 100 ? 100 : game.progress
    });
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

function isActiveRotationSlot(slot) {
  return slot === "Main" || slot === "Side" || slot === "Casual";
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function exportBackup() {
  const backup = {
    appName: "Game Rotation Manager",
    version: "0.2.0",
    exportedAt: new Date().toISOString(),
    games
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "game-rotation-manager-backup.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const backup = JSON.parse(reader.result);

      if (!backup.games || !Array.isArray(backup.games)) {
        alert("Invalid backup file.");
        return;
      }

      games = migrateGames(backup.games);
      saveGames();
      renderApp();

      alert("Backup imported successfully.");
    } catch (error) {
      alert("Could not import backup file.");
    } finally {
      importInput.value = "";
    }
  };

  reader.readAsText(file);
}