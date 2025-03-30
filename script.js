document.addEventListener("DOMContentLoaded", () => {
  // Game elements
  const gameBoard = document.getElementById("game-board");
  const levelDisplay = document.getElementById("level-display");
  const scoreDisplay = document.getElementById("score-display");
  const timerDisplay = document.getElementById("timer");
  const startScreen = document.getElementById("start-screen");
  const levelCompleteScreen = document.getElementById("level-complete");
  const gameCompleteScreen = document.getElementById("game-complete");
  const levelTimeDisplay = document.getElementById("level-time");
  const levelScoreDisplay = document.getElementById("level-score");
  const starRating = document.querySelector(".star-rating");
  const finalScoreDisplay = document.getElementById("final-score");
  const totalTimeDisplay = document.getElementById("total-time");

  // Buttons
  const levelButtons = document.querySelectorAll("#level-select button");
  const nextLevelButton = document.getElementById("next-level");
  const levelMenuButton = document.getElementById("level-menu");
  const playAgainButton = document.getElementById("play-again");

  // Game state
  let currentLevel = 1;
  let score = 0;
  let totalScore = 0;
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;
  let matchedPairs = 0;
  let timer = null;
  let seconds = 0;
  let totalSeconds = 0;
  let cardSymbols = [];
  let cardsCount = 0;
  let gridSize = { rows: 0, cols: 0 };

  // Level configurations
  const levels = [
    { rows: 3, cols: 4, symbols: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍉"] },
    {
      rows: 4,
      cols: 4,
      symbols: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"],
    },
    {
      rows: 4,
      cols: 5,
      symbols: ["🌞", "🌙", "⭐", "☁️", "🌈", "❄️", "🔥", "💧", "🌪️", "⚡"],
    },
    {
      rows: 5,
      cols: 6,
      symbols: [
        "🚗",
        "🚕",
        "🚙",
        "🚌",
        "🚎",
        "🏎️",
        "🚓",
        "🚑",
        "🚒",
        "✈️",
        "🚁",
        "🚂",
        "🛴",
        "🚲",
        "⛵",
      ],
    },
  ];

  // Initialize event listeners
  function init() {
    levelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentLevel = parseInt(button.dataset.level);
        startGame(currentLevel);
      });
    });

    nextLevelButton.addEventListener("click", () => {
      if (currentLevel < levels.length) {
        currentLevel++;
        startGame(currentLevel);
      } else {
        showGameComplete();
      }
    });

    levelMenuButton.addEventListener("click", showStartScreen);
    playAgainButton.addEventListener("click", showStartScreen);
  }

  // Start game with selected level
  function startGame(level) {
    // Reset state
    score = 0;
    seconds = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    // Update UI
    levelDisplay.textContent = `Level: ${level}`;
    scoreDisplay.textContent = `Score: ${score}`;
    timerDisplay.textContent = "Time: 00:00";

    // Hide overlays
    startScreen.classList.remove("active");
    levelCompleteScreen.classList.remove("active");
    gameCompleteScreen.classList.remove("active");

    // Set up level
    const levelConfig = levels[level - 1];
    gridSize = { rows: levelConfig.rows, cols: levelConfig.cols };

    // Create symbols array with pairs
    const pairsNeeded = (levelConfig.rows * levelConfig.cols) / 2;
    cardSymbols = [];

    // Get the required number of symbols for this level
    const selectedSymbols = levelConfig.symbols.slice(0, pairsNeeded);

    // Create pairs
    cardSymbols = [...selectedSymbols, ...selectedSymbols];

    // Shuffle the cards
    cardSymbols = shuffleArray(cardSymbols);
    cardsCount = cardSymbols.length;

    // Create the game board
    createGameBoard();

    // Start the timer
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
  }

  // Create game board with cards
  function createGameBoard() {
    gameBoard.innerHTML = "";
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize.cols}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${gridSize.rows}, 1fr)`;

    cardSymbols.forEach((symbol, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.symbol = symbol;
      card.dataset.index = index;

      const cardContent = document.createElement("div");
      cardContent.classList.add("card-content");
      cardContent.textContent = symbol;

      card.appendChild(cardContent);
      card.addEventListener("click", flipCard);
      gameBoard.appendChild(card);
    });
  }

  // Handle card flip
  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flipped");

    if (!firstCard) {
      // First card flipped
      firstCard = this;
      return;
    }

    // Second card flipped
    secondCard = this;
    checkForMatch();
  }

  // Check if flipped cards match
  function checkForMatch() {
    lockBoard = true;

    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;

    if (isMatch) {
      disableCards();
      updateScore(true);
    } else {
      unflipCards();
      updateScore(false);
    }

    // Check if level is complete
    if (matchedPairs === cardsCount / 2) {
      setTimeout(() => levelComplete(), 500);
    }
  }

  // Handle matched cards
  function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matchedPairs++;
    resetBoard();
  }

  // Handle unmatched cards
  function unflipCards() {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetBoard();
    }, 1000);
  }

  // Reset board after a turn
  function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  // Update score
  function updateScore(isMatch) {
    if (isMatch) {
      // Points for matches based on level
      const matchPoints = currentLevel * 50;
      score += matchPoints;
    } else {
      // Small penalty for mismatches
      score = Math.max(0, score - 10);
    }

    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Update timer
  function updateTimer() {
    seconds++;
    totalSeconds++;

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    timerDisplay.textContent = `Time: ${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // Handle level completion
  function levelComplete() {
    clearInterval(timer);

    // Add time bonus
    const timeBonus = Math.max(0, 300 - seconds) * currentLevel;
    score += timeBonus;
    totalScore += score;

    // Update level complete screen
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    levelTimeDisplay.textContent = `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
    levelScoreDisplay.textContent = score;

    // Calculate star rating
    let stars = "";
    const maxPossibleScore =
      (cardsCount / 2) * (currentLevel * 50) + 300 * currentLevel;
    const percentage = (score / maxPossibleScore) * 100;

    if (percentage >= 80) stars = "⭐⭐⭐";
    else if (percentage >= 60) stars = "⭐⭐";
    else stars = "⭐";

    starRating.textContent = stars;

    // Show level complete screen
    setTimeout(() => {
      levelCompleteScreen.classList.add("active");

      // Enable/disable next level button
      if (currentLevel < levels.length) {
        nextLevelButton.style.display = "inline-block";
      } else {
        nextLevelButton.style.display = "none";
      }
    }, 500);
  }

  // Show start screen
  function showStartScreen() {
    startScreen.classList.add("active");
    levelCompleteScreen.classList.remove("active");
    gameCompleteScreen.classList.remove("active");

    // Reset scores and timer
    totalScore = 0;
    totalSeconds = 0;
    clearInterval(timer);
  }

  // Show game complete screen
  function showGameComplete() {
    levelCompleteScreen.classList.remove("active");
    gameCompleteScreen.classList.add("active");

    // Update final stats
    finalScoreDisplay.textContent = totalScore;

    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    totalTimeDisplay.textContent = `${String(minutes).padStart(
      2,
      "0"
    )}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  // Helper function to shuffle an array
  function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Initialize the game
  init();
});
