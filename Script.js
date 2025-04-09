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
const difficultyDisplay = document.querySelector("#difficulty-display span");

// Sound effects
const clickSound = document.getElementById("click-sound");
const bombSound = document.getElementById("bomb-sound");
const gameOverSound = document.getElementById("game-over-sound");

// Difficulty settings
const difficulties = {
    easy: { spawnRate: 800, bombChance: 0.15, timeBonus: 2, scoreMultiplier: 1 },
    medium: { spawnRate: 600, bombChance: 0.2, timeBonus: 1.5, scoreMultiplier: 1.5 },
    hard: { spawnRate: 400, bombChance: 0.25, timeBonus: 1, scoreMultiplier: 2 }
};

let currentDifficulty = 'easy';
let score = 0;
let timeLeft = 30;
let timer;
let spawnInterval;
let gameRunning = false;
let highScore = localStorage.getItem("mirchiHighScore") || 0;
highScoreDisplay.textContent = highScore;

// Difficulty selection
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        difficultyDisplay.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    });
});

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

    const settings = difficulties[currentDifficulty];
    spawnInterval = setInterval(spawnMirchi, settings.spawnRate);
}

function spawnMirchi() {
    const el = document.createElement("div");
    const settings = difficulties[currentDifficulty];
    const isBomb = Math.random() < settings.bombChance;
    
    el.className = "mirchi";
    if (isBomb) {
        el.classList.add("bomb");
        el.textContent = "💣";
    } else {
        el.textContent = "🌶️";
    }

    const left = Math.random() * (window.innerWidth - 50);
    el.style.left = `${left}px`;

    // Random size variation
    const size = 1 + Math.random() * 0.5;
    el.style.transform = `scale(${size})`;

    el.addEventListener("click", () => {
        if (!gameRunning) return;
        if (isBomb) {
            bombSound.play();
            endGame();
        } else {
            clickSound.play();
            score += Math.floor(5 * settings.scoreMultiplier);
            timeLeft += settings.timeBonus;
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
    gameOverSound.play();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("mirchiHighScore", highScore);
    }

    highScoreDisplay.textContent = highScore;
    highScoreEndDisplay.textContent = highScore;
    gameOverScreen.style.display = "flex";
}
