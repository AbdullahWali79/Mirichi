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
const keyboardCursor = document.getElementById("keyboard-cursor");
const pauseScreen = document.getElementById("pause-screen");

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
let isPaused = false;
let highScore = localStorage.getItem("mirchiHighScore") || 0;
highScoreDisplay.textContent = highScore;

// Keyboard cursor position
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let selectedMirchi = null;

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

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (e.key === ' ' && !gameRunning) {
        startGame();
    } else if (e.key === ' ' && isPaused) {
        resumeGame();
    } else if (e.key === 'Escape' && gameRunning && !isPaused) {
        pauseGame();
    } else if (gameRunning && !isPaused) {
        switch(e.key) {
            case 'ArrowLeft':
                cursorX = Math.max(0, cursorX - 20);
                break;
            case 'ArrowRight':
                cursorX = Math.min(window.innerWidth, cursorX + 20);
                break;
            case 'ArrowUp':
                cursorY = Math.max(0, cursorY - 20);
                break;
            case 'ArrowDown':
                cursorY = Math.min(window.innerHeight, cursorY + 20);
                break;
            case 'Enter':
                if (selectedMirchi) {
                    selectedMirchi.click();
                }
                break;
        }
        updateCursor();
        checkMirchiSelection();
    }
}

function updateCursor() {
    keyboardCursor.style.left = `${cursorX - 15}px`;
    keyboardCursor.style.top = `${cursorY - 15}px`;
}

function checkMirchiSelection() {
    const mirchis = document.querySelectorAll('.mirchi');
    let newSelected = null;
    let minDistance = 50; // Minimum distance to select a mirchi

    mirchis.forEach(mirchi => {
        const rect = mirchi.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(centerX - cursorX, 2) + 
            Math.pow(centerY - cursorY, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            newSelected = mirchi;
        }
    });

    if (selectedMirchi) {
        selectedMirchi.classList.remove('keyboard-selected');
    }

    if (newSelected) {
        newSelected.classList.add('keyboard-selected');
        selectedMirchi = newSelected;
    } else {
        selectedMirchi = null;
    }
}

function pauseGame() {
    isPaused = true;
    clearInterval(timer);
    clearInterval(spawnInterval);
    pauseScreen.style.display = "flex";
}

function resumeGame() {
    isPaused = false;
    pauseScreen.style.display = "none";
    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) endGame();
    }, 1000);

    const settings = difficulties[currentDifficulty];
    spawnInterval = setInterval(spawnMirchi, settings.spawnRate);
}

function startGame() {
    score = 0;
    timeLeft = 30;
    gameRunning = true;
    isPaused = false;
    updateDisplay();

    startScreen.style.display = "none";
    gameContainer.style.display = "block";
    gameOverScreen.style.display = "none";
    pauseScreen.style.display = "none";
    mirchiContainer.innerHTML = "";

    // Reset cursor position
    cursorX = window.innerWidth / 2;
    cursorY = window.innerHeight / 2;
    updateCursor();

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
        if (!gameRunning || isPaused) return;
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
