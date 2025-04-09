// Menu Elements
const mainMenu = document.getElementById("main-menu");
const settingsMenu = document.getElementById("settings-menu");
const howToPlayMenu = document.getElementById("how-to-play-menu");
const creditsMenu = document.getElementById("credits-menu");
const playBtn = document.getElementById("play-btn");
const settingsBtn = document.getElementById("settings-btn");
const howToPlayBtn = document.getElementById("how-to-play-btn");
const creditsBtn = document.getElementById("credits-btn");
const menuBtn = document.getElementById("menu-btn");
const backBtns = document.querySelectorAll(".back-btn");

// Settings Elements
const soundToggle = document.getElementById("sound-toggle");
const vibrationToggle = document.getElementById("vibration-toggle");
const darkModeToggle = document.getElementById("dark-mode-toggle");

// Game Elements
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
const menuSound = document.getElementById("menu-sound");

// Settings
let settings = {
    sound: true,
    vibration: true,
    darkMode: false
};

// Achievements
const achievements = {
    firstGame: { name: "First Game", description: "Play your first game", earned: false },
    score100: { name: "Century", description: "Score 100 points", earned: false },
    score500: { name: "Half Thousand", description: "Score 500 points", earned: false },
    score1000: { name: "Thousand Club", description: "Score 1000 points", earned: false },
    noBombs: { name: "Bomb Dodger", description: "Complete a game without hitting any bombs", earned: false },
    powerUpMaster: { name: "Power Up Master", description: "Collect 10 power-ups", earned: false },
    timeMaster: { name: "Time Master", description: "Survive for 2 minutes", earned: false }
};

// Statistics
let stats = {
    gamesPlayed: 0,
    totalScore: 0,
    highestScore: 0,
    bombsHit: 0,
    powerUpsCollected: 0,
    totalTimePlayed: 0
};

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem("mirchiSettings");
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        soundToggle.checked = settings.sound;
        vibrationToggle.checked = settings.vibration;
        darkModeToggle.checked = settings.darkMode;
        if (settings.darkMode) {
            document.body.classList.add("dark-mode");
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem("mirchiSettings", JSON.stringify(settings));
}

// Play sound if enabled
function playSound(sound) {
    if (settings.sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
    }
}

// Vibrate if enabled
function vibrate() {
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Menu Navigation
function showMenu(menu) {
    mainMenu.style.display = "none";
    settingsMenu.style.display = "none";
    howToPlayMenu.style.display = "none";
    creditsMenu.style.display = "none";
    startScreen.style.display = "none";
    gameContainer.style.display = "none";
    
    menu.style.display = "block";
    playSound(menuSound);
}

// Event Listeners for Menu Buttons
playBtn.addEventListener("click", () => {
    showMenu(startScreen);
});

settingsBtn.addEventListener("click", () => {
    showMenu(settingsMenu);
});

howToPlayBtn.addEventListener("click", () => {
    showMenu(howToPlayMenu);
});

creditsBtn.addEventListener("click", () => {
    showMenu(creditsMenu);
});

menuBtn.addEventListener("click", () => {
    pauseGame();
    showMenu(mainMenu);
});

backBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        showMenu(mainMenu);
    });
});

// Settings Toggles
soundToggle.addEventListener("change", () => {
    settings.sound = soundToggle.checked;
    saveSettings();
});

vibrationToggle.addEventListener("change", () => {
    settings.vibration = vibrationToggle.checked;
    saveSettings();
});

darkModeToggle.addEventListener("change", () => {
    settings.darkMode = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", settings.darkMode);
    saveSettings();
});

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Difficulty settings
const difficulties = {
    easy: { 
        spawnRate: isMobile ? 1000 : 800, 
        bombChance: 0.15, 
        timeBonus: 2, 
        scoreMultiplier: 1 
    },
    medium: { 
        spawnRate: isMobile ? 800 : 600, 
        bombChance: 0.2, 
        timeBonus: 1.5, 
        scoreMultiplier: 1.5 
    },
    hard: { 
        spawnRate: isMobile ? 600 : 400, 
        bombChance: 0.25, 
        timeBonus: 1, 
        scoreMultiplier: 2 
    }
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

// Touch controls
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Initialize touch controls if on mobile
if (isMobile) {
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);
    document.addEventListener('touchend', handleTouchEnd, false);
    
    // Prevent default touch behaviors
    document.addEventListener('touchmove', (e) => {
        if (gameRunning && !isPaused) {
            e.preventDefault();
        }
    }, { passive: false });
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!gameRunning || isPaused) return;
    
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
    
    const mirchis = document.querySelectorAll('.mirchi');
    mirchis.forEach(mirchi => {
        const rect = mirchi.getBoundingClientRect();
        if (touchEndX >= rect.left && touchEndX <= rect.right &&
            touchEndY >= rect.top && touchEndY <= rect.bottom) {
            mirchi.classList.add('touch-highlight');
        } else {
            mirchi.classList.remove('touch-highlight');
        }
    });
}

function handleTouchEnd(e) {
    if (!gameRunning || isPaused) return;
    
    const mirchis = document.querySelectorAll('.mirchi');
    mirchis.forEach(mirchi => {
        const rect = mirchi.getBoundingClientRect();
        if (touchEndX >= rect.left && touchEndX <= rect.right &&
            touchEndY >= rect.top && touchEndY <= rect.bottom) {
            mirchi.click();
        }
        mirchi.classList.remove('touch-highlight');
    });
}

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

// Keyboard controls (only if not on mobile)
if (!isMobile) {
    document.addEventListener('keydown', handleKeyPress);
}

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
    let minDistance = 50;

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

    if (!isMobile) {
        cursorX = window.innerWidth / 2;
        cursorY = window.innerHeight / 2;
        updateCursor();
    }

    timer = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) endGame();
    }, 1000);

    const settings = difficulties[currentDifficulty];
    spawnInterval = setInterval(spawnMirchi, settings.spawnRate);

    stats.gamesPlayed++;
    stats.totalTimePlayed += timeLeft;
    saveAchievementsAndStats();
}

// Power-ups
const powerUps = {
    timeFreeze: {
        emoji: "⏱️",
        duration: 5000,
        effect: () => {
            clearInterval(timer);
            setTimeout(() => {
                timer = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    if (timeLeft <= 0) endGame();
                }, 1000);
            }, 5000);
        }
    },
    doublePoints: {
        emoji: "2️⃣",
        duration: 10000,
        effect: () => {
            scoreMultiplier = 2;
            setTimeout(() => {
                scoreMultiplier = 1;
            }, 10000);
        }
    },
    shield: {
        emoji: "🛡️",
        duration: 8000,
        effect: () => {
            hasShield = true;
            setTimeout(() => {
                hasShield = false;
            }, 8000);
        }
    }
};

let scoreMultiplier = 1;
let hasShield = false;
let activePowerUps = [];

function spawnPowerUp() {
    if (Math.random() < 0.05) { // 5% chance to spawn power-up
        const powerUpTypes = Object.keys(powerUps);
        const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const powerUp = powerUps[randomPowerUp];
        
        const el = document.createElement("div");
        el.className = "power-up";
        el.textContent = powerUp.emoji;
        el.dataset.type = randomPowerUp;
        
        const left = Math.random() * (window.innerWidth - 50);
        el.style.left = `${left}px`;
        
        el.addEventListener("click", () => {
            if (!gameRunning || isPaused) return;
            playSound(clickSound);
            vibrate();
            activatePowerUp(randomPowerUp);
            el.remove();
        });
        
        mirchiContainer.appendChild(el);
        
        setTimeout(() => {
            if (el.parentNode) el.remove();
        }, 5000);
    }
}

function activatePowerUp(type) {
    const powerUp = powerUps[type];
    powerUp.effect();
    activePowerUps.push({
        type,
        endTime: Date.now() + powerUp.duration
    });
    updatePowerUpDisplay();
}

function updatePowerUpDisplay() {
    const powerUpContainer = document.getElementById("power-up-container");
    powerUpContainer.innerHTML = "";
    
    activePowerUps.forEach(powerUp => {
        const el = document.createElement("div");
        el.className = "active-power-up";
        el.textContent = powerUps[powerUp.type].emoji;
        powerUpContainer.appendChild(el);
    });
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

    // Random size variation (smaller on mobile)
    const size = isMobile ? (1 + Math.random() * 0.3) : (1 + Math.random() * 0.5);
    el.style.transform = `scale(${size})`;

    el.addEventListener("click", () => {
        if (!gameRunning || isPaused) return;
        if (isBomb) {
            playSound(bombSound);
            vibrate();
            endGame();
        } else {
            playSound(clickSound);
            vibrate();
            score += Math.floor(5 * settings.scoreMultiplier);
            timeLeft += settings.timeBonus;
            el.remove();
            updateDisplay();
        }
    });

    mirchiContainer.appendChild(el);

    // Add power-up spawning
    spawnPowerUp();

    setTimeout(() => {
        if (el.parentNode) el.remove();
    }, 5000);
}

function updateDisplay() {
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
}

function endGame() {
    if (hasShield) {
        hasShield = false;
        playSound(clickSound);
        vibrate();
        return;
    }
    
    stats.totalScore += score;
    if (score > stats.highestScore) {
        stats.highestScore = score;
    }
    stats.bombsHit++;
    
    checkAchievements();
    saveAchievementsAndStats();
    
    gameRunning = false;
    clearInterval(timer);
    clearInterval(spawnInterval);
    finalScoreDisplay.textContent = score;
    playSound(gameOverSound);
    vibrate();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("mirchiHighScore", highScore);
    }

    highScoreDisplay.textContent = highScore;
    highScoreEndDisplay.textContent = highScore;
    gameOverScreen.style.display = "flex";
}

// Prevent scrolling on mobile
if (isMobile) {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
}

// Initialize
loadSettings();
showMenu(mainMenu);

// Add power-up container to HTML
document.getElementById("header").innerHTML += '<div id="power-up-container"></div>';

// Load achievements and stats
function loadAchievementsAndStats() {
    const savedAchievements = localStorage.getItem("mirchiAchievements");
    const savedStats = localStorage.getItem("mirchiStats");
    
    if (savedAchievements) {
        const loadedAchievements = JSON.parse(savedAchievements);
        Object.keys(loadedAchievements).forEach(key => {
            if (achievements[key]) {
                achievements[key].earned = loadedAchievements[key].earned;
            }
        });
    }
    
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
}

// Save achievements and stats
function saveAchievementsAndStats() {
    localStorage.setItem("mirchiAchievements", JSON.stringify(achievements));
    localStorage.setItem("mirchiStats", JSON.stringify(stats));
}

// Check achievements
function checkAchievements() {
    // First Game
    if (stats.gamesPlayed === 1) {
        achievements.firstGame.earned = true;
    }
    
    // Score achievements
    if (score >= 100) achievements.score100.earned = true;
    if (score >= 500) achievements.score500.earned = true;
    if (score >= 1000) achievements.score1000.earned = true;
    
    // No bombs achievement
    if (stats.bombsHit === 0) {
        achievements.noBombs.earned = true;
    }
    
    // Power Up Master
    if (stats.powerUpsCollected >= 10) {
        achievements.powerUpMaster.earned = true;
    }
    
    // Time Master
    if (stats.totalTimePlayed >= 120) {
        achievements.timeMaster.earned = true;
    }
    
    saveAchievementsAndStats();
}

// Add achievements menu
const achievementsMenu = document.createElement("div");
achievementsMenu.id = "achievements-menu";
achievementsMenu.innerHTML = `
    <h2>Achievements</h2>
    <div class="achievements-list"></div>
    <button class="back-btn">Back to Menu</button>
`;
document.body.appendChild(achievementsMenu);

// Add stats menu
const statsMenu = document.createElement("div");
statsMenu.id = "stats-menu";
statsMenu.innerHTML = `
    <h2>Statistics</h2>
    <div class="stats-list">
        <div class="stat-item">Games Played: <span id="games-played">0</span></div>
        <div class="stat-item">Total Score: <span id="total-score">0</span></div>
        <div class="stat-item">Highest Score: <span id="highest-score">0</span></div>
        <div class="stat-item">Bombs Hit: <span id="bombs-hit">0</span></div>
        <div class="stat-item">Power-ups Collected: <span id="power-ups-collected">0</span></div>
        <div class="stat-item">Total Time Played: <span id="total-time">0</span>s</div>
    </div>
    <button class="back-btn">Back to Menu</button>
`;
document.body.appendChild(statsMenu);

// Update stats display
function updateStatsDisplay() {
    document.getElementById("games-played").textContent = stats.gamesPlayed;
    document.getElementById("total-score").textContent = stats.totalScore;
    document.getElementById("highest-score").textContent = stats.highestScore;
    document.getElementById("bombs-hit").textContent = stats.bombsHit;
    document.getElementById("power-ups-collected").textContent = stats.powerUpsCollected;
    document.getElementById("total-time").textContent = stats.totalTimePlayed;
}

// Update achievements display
function updateAchievementsDisplay() {
    const achievementsList = document.querySelector(".achievements-list");
    achievementsList.innerHTML = "";
    
    Object.entries(achievements).forEach(([key, achievement]) => {
        const achievementEl = document.createElement("div");
        achievementEl.className = `achievement-item ${achievement.earned ? "earned" : "locked"}`;
        achievementEl.innerHTML = `
            <span class="achievement-icon">${achievement.earned ? "🏆" : "🔒"}</span>
            <div class="achievement-info">
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
            </div>
        `;
        achievementsList.appendChild(achievementEl);
    });
}

// Initialize
loadAchievementsAndStats();
updateStatsDisplay();
updateAchievementsDisplay();
