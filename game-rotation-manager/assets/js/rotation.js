function getRecommendedGame(games) {
  const playableGames = games.filter(game =>
    game.status !== "Completed" &&
    game.status !== "100% Complete" &&
    game.rotationSlot !== "Completed"
  );

  if (playableGames.length === 0) {
    return null;
  }

  const activeRotationGames = playableGames.filter(game =>
    game.rotationSlot === "Main" ||
    game.rotationSlot === "Side" ||
    game.rotationSlot === "Casual"
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