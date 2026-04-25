function getRecommendedGame(games) {
  const playableGames = getPlayableGames(games);

  if (playableGames.length === 0) {
    return null;
  }

  const activeRotationGames = playableGames.filter(game =>
    isActiveRotationSlot(game.rotationSlot)
  );

  const recommendationPool =
    activeRotationGames.length > 0 ? activeRotationGames : playableGames;

  const scoredGames = recommendationPool.map(game => {
    const scoreBreakdown = calculateGameScore(game, activeRotationGames.length > 0);

    return {
      game,
      score: scoreBreakdown.total,
      reasons: scoreBreakdown.reasons
    };
  });

  scoredGames.sort((a, b) => b.score - a.score);

  return scoredGames[0];
}

function suggestRotation(games) {
  const playableGames = getPlayableGames(games);

  if (playableGames.length === 0) {
    return null;
  }

  const currentMain = getPlayableSlotGame(playableGames, "Main");
  const currentSide = getPlayableSlotGame(playableGames, "Side");
  const currentCasual = getPlayableSlotGame(playableGames, "Casual");

  const usedIds = [];

  const mainPick = currentMain
    ? createKeepSlotSuggestion(currentMain, "Main")
    : getBestSlotPick(playableGames, "Main", usedIds);

  if (mainPick?.game?.id) {
    usedIds.push(mainPick.game.id);
  }

  const sidePick = currentSide && !usedIds.includes(currentSide.id)
    ? createKeepSlotSuggestion(currentSide, "Side")
    : getBestSlotPick(playableGames, "Side", usedIds);

  if (sidePick?.game?.id) {
    usedIds.push(sidePick.game.id);
  }

  const casualPick = currentCasual && !usedIds.includes(currentCasual.id)
    ? createKeepSlotSuggestion(currentCasual, "Casual")
    : getBestSlotPick(playableGames, "Casual", usedIds);

  return {
    Main: mainPick,
    Side: sidePick,
    Casual: casualPick
  };
}

function getPlayableGames(games) {
  return games.filter(game =>
    game.status !== "Completed" &&
    game.status !== "100% Complete" &&
    game.rotationSlot !== "Completed"
  );
}

function getPlayableSlotGame(games, slot) {
  return games.find(game => game.rotationSlot === slot) || null;
}

function createKeepSlotSuggestion(game, slot) {
  return {
    game,
    score: 999,
    isKept: true,
    reasons: [
      `Already in the ${slot} slot and still playable.`,
      "Keeping this game avoids unnecessary rotation reshuffling."
    ]
  };
}

function getBestSlotPick(games, slot, excludedIds) {
  const validExcludedIds = excludedIds.filter(Boolean);

  const availableGames = games.filter(game =>
    !validExcludedIds.includes(game.id) &&
    game.rotationSlot !== "Completed" &&
    game.rotationSlot !== slot
  );

  if (availableGames.length === 0) {
    return null;
  }

  const scoredGames = availableGames.map(game => {
    const scoreBreakdown = calculateSlotScore(game, slot);

    return {
      game,
      score: scoreBreakdown.total,
      isKept: false,
      reasons: scoreBreakdown.reasons
    };
  });

  scoredGames.sort((a, b) => b.score - a.score);

  return scoredGames[0];
}

function calculateSlotScore(game, slot) {
  let total = 0;
  const reasons = [];

  if (game.rotationSlot === "Backlog") {
    total += 10;
    reasons.push("Available from the backlog.");
  }

  if (game.rotationSlot === "Paused") {
    total += 15;
    reasons.push("Paused game that can be brought back into rotation.");
  }

  if (game.status === "Playing") {
    total += 20;
    reasons.push("Already started, so it has momentum.");
  }

  if (game.status === "Paused") {
    total += 10;
    reasons.push("Paused status suggests this can be resumed.");
  }

  if (game.status === "Not Started") {
    total += 5;
    reasons.push("Fresh backlog option.");
  }

  if (game.progress >= 70 && game.progress < 100) {
    total += 25;
    reasons.push("Close to completion.");
  } else if (game.progress >= 40) {
    total += 15;
    reasons.push("Solid progress already made.");
  } else if (game.progress > 0) {
    total += 8;
    reasons.push("Some progress has already been made.");
  }

  if (slot === "Main") {
    if (game.gameType === "Open World" || game.gameType === "TTRPG" || game.gameType === "Story-Based") {
      total += 30;
      reasons.push("This type suits main focus.");
    }

    if (game.gameType === "Horror" && game.progress > 0) {
      total += 25;
      reasons.push("Good candidate for focused completion.");
    }

    if (game.gameType === "Souls-like") {
      total += 12;
      reasons.push("Souls-like games can work well with focused attention.");
    }
  }

  if (slot === "Side") {
    if (
      game.gameType === "Souls-like" ||
      game.gameType === "Turn Based" ||
      game.gameType === "Stealth" ||
      game.gameType === "Survival"
    ) {
      total += 30;
      reasons.push("This type works well as a side game.");
    }

    if (game.gameType === "Open World" || game.gameType === "TTRPG") {
      total -= 8;
      reasons.push("This may be a bit heavy for a side slot.");
    }
  }

  if (slot === "Casual") {
    if (game.gameType === "Rogue" || game.gameType === "Survival" || game.gameType === "Turn Based") {
      total += 30;
      reasons.push("This type works well for casual sessions.");
    }

    if (game.gameType === "Open World" || game.gameType === "TTRPG") {
      total -= 15;
      reasons.push("This is probably too involved for a casual slot.");
    }

    if (game.progress === 0) {
      total += 5;
      reasons.push("Easy to try without disrupting your main focus.");
    }
  }

  return {
    total,
    reasons
  };
}

function calculateGameScore(game, hasActiveRotation) {
  let total = 0;
  const reasons = [];

  if (game.rotationSlot === "Main") {
    total += 60;
    reasons.push("This is currently in your main rotation slot.");
  }

  if (game.rotationSlot === "Side") {
    total += 35;
    reasons.push("This is in your side rotation slot.");
  }

  if (game.rotationSlot === "Casual") {
    total += 20;
    reasons.push("This is a lower-pressure casual rotation game.");
  }

  if (game.rotationSlot === "Backlog") {
    total += hasActiveRotation ? 0 : 10;
    reasons.push("This is still in the backlog, so it is only suggested if no active rotation games exist.");
  }

  if (game.rotationSlot === "Paused") {
    total += hasActiveRotation ? 5 : 15;
    reasons.push("This game is paused, so it is a possible return option.");
  }

  if (game.status === "Playing") {
    total += 30;
    reasons.push("You have already started this game.");
  }

  if (game.status === "Paused") {
    total += 8;
    reasons.push("Your status says this is paused, so it may be worth returning to later.");
  }

  if (game.status === "Not Started") {
    total += 4;
    reasons.push("This game has not been started yet.");
  }

  if (game.progress >= 70 && game.progress < 100) {
    total += 25;
    reasons.push("You are close to finishing this game.");
  } else if (game.progress >= 40) {
    total += 15;
    reasons.push("You have already made solid progress.");
  } else if (game.progress > 0) {
    total += 8;
    reasons.push("You have at least started making progress.");
  }

  if (game.gameType === "Open World" || game.gameType === "TTRPG") {
    if (game.rotationSlot === "Main") {
      total += 10;
      reasons.push("Large games usually work best when they are given main focus.");
    }
  }

  if (game.gameType === "Horror" && game.progress >= 50) {
    total += 8;
    reasons.push("This horror game already has good progress, so finishing momentum matters.");
  }

  if (game.gameType === "Rogue" || game.gameType === "Survival") {
    if (game.rotationSlot === "Casual") {
      total += 6;
      reasons.push("This type works well as a casual rotation option.");
    }
  }

  return {
    total,
    reasons
  };
}

function isActiveRotationSlot(slot) {
  return slot === "Main" || slot === "Side" || slot === "Casual";
}