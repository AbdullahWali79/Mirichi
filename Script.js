const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const mirchiContainer = document.getElementById("mirchi-container");
const scoreDisplay = document.querySelector("#score span");
const timerDisplay = document.querySelector("#timer span");
const finalScoreDisplay = document.getElementById("final-score");
const gameOverScreen = document.getElementById("game-over");
const highScoreDisplay = document.querySelector("#high-score span");
const highScoreEndDisplay = document.getElementById("high-score-end");

let score = 0;
let timeLeft = 30;
let timer;
let spawnInterval;
let gameRunning = false;
let highScore = localStorage.getItem("mirchiHighScore") || 0;
highScoreDisplay.textContent = highScore;

startBtn.onclick = startGame;
restartBtn.onclick = startGame;

function startGame() {
  score = 0;
  timeLeft = 30;
  gameRunning = true;
  updateDisplay();

  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  gameOverScreen.style.display = "none";
  mirchiContainer.innerHTML = "";

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) endGame();
  }, 1000);

  spawnInterval = setInterval(spawnMirchi, 800);
}

function spawnMirchi() {
  const el = document.createElement("div");
  const isBomb = Math.random() < 0.15;
  el.className = "mirchi";
  if (isBomb) {
    el.classList.add("bomb");
    el.textContent = "💣";
  } else {
    el.textContent = "🌶️";
  }

  const left = Math.random() * (window.innerWidth - 50);
  el.style.left = `${left}px`;

  el.addEventListener("click", () => {
    if (!gameRunning) return;
    if (isBomb) {
      endGame();
    } else {
      score += 5;
      timeLeft += 2;
      el.remove();
      updateDisplay();
    }
  });

  mirchiContainer.appendChild(el);

  setTimeout(() => {
    if (el.parentNode) el.remove();
  }, 5000);
}

function updateDisplay() {
  scoreDisplay.textContent = score;
  timerDisplay.textContent = timeLeft;
}

function endGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(spawnInterval);
  finalScoreDisplay.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("mirchiHighScore", highScore);
  }

  highScoreDisplay.textContent = highScore;
  highScoreEndDisplay.textContent = highScore;
  gameOverScreen.style.display = "flex";
}
