const Easyword = [
    { word:"computer", meaning:"An electronic device for processing data"},
    { word:"mouse", meaning:"A device to control the pointer on screen"},
    { word:"keyboard", meaning:"Input device with keys"},
    { word:"monitor", meaning:"Screen that displays output"},
    { word:"printer", meaning:"Device that prints documents"},
    { word:"bug", meaning:"An error or flaw in a program"},
    { word:"bit", meaning:"Smallest unit of data (0 or 1)"},
    { word:"byte", meaning:"8 bits together"},
    { word:"website", meaning:"Collection of web pages"},
    { word:"browser", meaning:"Software to access websites"},
    { word:"boot", meaning:"Start up a computer"},
    { word:"modem", meaning:"Device to connect to internet"},
    { word:"virus", meaning:"Malicious program that harms computer"},
    { word:"megabyte", meaning:"1 million bytes of data"},
    { word:"icon", meaning:"Small picture representing a program or file"},
    { word:"link", meaning:"Clickable connection to another webpage"},
    { word:"email", meaning:"Electronic mail for communication"},
    
];

const Mediumword = [
    { word:"algorithm", meaning:"Step-by-step procedure to solve a problem"},
    { word:"bandwidth", meaning:"Data transfer capacity of a network"},
    { word:"cache", meaning:"Temporary storage for fast access"},
    { word:"debug", meaning:"Find and fix errors in code"},
    { word:"reboot", meaning:"Restart a computer"},
    { word:"database", meaning:"Organized collection of data"},
    { word:"cybercrime", meaning:"Crime using computers or internet"},
    { word:"flowchart", meaning:"Diagram showing steps of a process"},
    { word:"gigabyte", meaning:"1 billion bytes of data"},
    { word:"hyperlink", meaning:"Clickable link to another webpage"},
    { word:"linux", meaning:"Open-source operating system"},
    { word:"motherboard", meaning:"Main circuit board of a computer"},
    { word:"protocol", meaning:"Rules for communication between computers"},
    { word:"encrypt", meaning:"Convert data to secret code"},
    { word:"router", meaning:"Device that routes network traffic"},
    { word:"software", meaning:"Programs and operating information used by a computer"},
    { word:"hardware", meaning:"Physical components of a computer"},

];

const Hardword = [
    { word:"resolution", meaning:"Number of pixels on a screen"},
    { word:"supercomputer", meaning:"Extremely fast computer for complex tasks"},
    { word:"search engine", meaning:"Tool to find information online"},
    { word:"spreadsheet", meaning:"Table used to organize data"},
    { word:"spyware", meaning:"Software that secretly collects info"},
    { word:"typeface", meaning:"Style of printed or digital text"},
    { word:"unix", meaning:"Powerful multitasking operating system"},
    { word:"webmaster", meaning:"Person managing a website"},
    { word:"cloud computing", meaning:"Using remote servers to store/process data"},
    { word:"cyberspace", meaning:"Virtual computer network world"},
    { word:"data mining", meaning:"Extracting useful info from data"},
    { word:"firewall", meaning:"Security system blocking unauthorized access"},
    { word:"IP address", meaning:"Unique number identifying a device on network"},
    { word:"bandwidth", meaning:"How much data moves per second"},
    { word:"virtualization", meaning:"Running virtual machines on one host"},
    { word:"wearable technology", meaning:"Electronic devices worn on the body"}
];

const ROUND_TIME = { Easy: 50, Medium: 40, Hard: 30 };
const levelPool = { Easy: Easyword, Medium: Mediumword, Hard: Hardword };

const lettersEl = document.getElementById("letters");
const wordInput = document.getElementById("wordInput");
const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint");
const playerEl = document.getElementById("player");
const levelBadge = document.getElementById("level");
const timerBar = document.getElementById("timerBar");
const timerText = document.getElementById("timerText");
const scoreEls = [document.getElementById("score1"), document.getElementById("score2")];
const levelEls = [document.getElementById("p1Level"), document.getElementById("p2Level")];
const totalScoreEl = document.getElementById("totalScore");
const streakEl = document.getElementById("streak");
const wordsSolvedEl = document.getElementById("wordsSolved");
const introEl = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");
const levelPillsMain = document.querySelectorAll("#levels .pill");
const levelPillsOverlay = document.querySelectorAll("#overlayLevels .pill");

let level = "Easy";
let levelWords = [];
let currentWord = "";
let currentMeaning = "";
let currentLetters = [];
let selected = [];
let turn = 1;
let scores = [0, 0];
let streak = 1;
let wordsSolved = 0;
let timerId = null;
let timeLeft = ROUND_TIME[level];
let hintUsed = false;

const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

const normalize = (text) => text.replace(/\s+/g, "").toLowerCase();

function setLevelSelection(nextLevel) {
    level = nextLevel;
    document.querySelectorAll("#levels .pill, #overlayLevels .pill").forEach((btn) => {
        if (btn.dataset.level === level) btn.classList.add("active");
        else btn.classList.remove("active");
    });
}

function resetStateForNewGame() {
    scores = [0, 0];
    turn = 1;
    streak = 1;
    wordsSolved = 0;
    playerEl.innerText = "Player 1's Turn";
    updateScore();
}

function startGame() {
    levelWords = [...levelPool[level]];
    shuffleArray(levelWords);
    levelBadge.innerText = `Level: ${level}`;
    levelEls[0].innerText = level;
    levelEls[1].innerText = level;
    wordsSolved = 0;
    streak = 1;
    updateScore();
    setMessage("Tap letters or type your guess.");
    startRound();
}

function startRound() {
    const pick = levelWords[Math.floor(Math.random() * levelWords.length)];
    currentWord = pick.word;
    currentMeaning = pick.meaning;
    currentLetters = pick.word.replace(/\s+/g, "").toUpperCase().split("");
    selected = [];
    hintUsed = false;
    wordInput.value = "";
    renderLetters();
    hintEl.innerText = "Hint hidden. Tap 💡 for a clue.";
    restartTimer();
}

function renderLetters() {
    const mixed = [...currentLetters];
    shuffleArray(mixed);
    lettersEl.innerHTML = "";
    mixed.forEach((letter, idx) => {
        const btn = document.createElement("button");
        btn.textContent = letter;
        btn.dataset.id = idx;
        btn.addEventListener("click", () => toggleLetter(btn));
        lettersEl.appendChild(btn);
    });
}

function toggleLetter(btn) {
    const id = btn.dataset.id;
    const letter = btn.textContent;
    const existing = selected.findIndex((item) => item.id === id);
    if (existing >= 0) {
        selected.splice(existing, 1);
        btn.classList.remove("active");
    } else {
        selected.push({ id, letter });
        btn.classList.add("active");
    }
    wordInput.value = selected.map((l) => l.letter).join("");
}

function shuffleLetters() {
    renderLetters();
    pulse(messageEl, "Shuffled letters");
}

function showHint(initial = false) {
    const masked = currentWord[0].toUpperCase() + "_".repeat(normalize(currentWord).length - 1);
    hintEl.innerText = `${masked} · ${currentMeaning}`;
    if (!initial) {
        hintUsed = true;
        pulse(hintEl, "Hint shown (50% score penalty this word)");
    }
}

function submitWord() {
    const attempt = normalize(wordInput.value);
    if (!attempt) {
        setMessage("Type or tap letters first.", "danger");
        return;
    }
    if (attempt === normalize(currentWord)) {
        const base = currentWord.length + (level === "Hard" ? 4 : level === "Medium" ? 2 : 1);
        const bonus = Math.max(1, 1 + (streak - 1) * 0.25);
        const gained = Math.round(base * bonus);
        const netGain = hintUsed ? Math.max(1, Math.round(gained * 0.5)) : gained;
        scores[turn - 1] += netGain;
        streak += 1;
        wordsSolved += 1;
        const penaltyNote = hintUsed ? " (50% hint penalty applied)" : "";
        setMessage(`Great! +${netGain} points${penaltyNote}`, "success");
        updateScore();
        switchTurn();
        startRound();
    } else {
        setMessage("Not quite. Try a shuffle or hint.", "danger");
        streak = 1;
        streakEl.innerText = "x1";
    }
}

function setMessage(text, type = "info") {
    const colors = { success: "#10b981", danger: "#ef4444", info: "var(--muted)" };
    messageEl.style.color = colors[type] || colors.info;
    messageEl.innerText = text;
}

function updateScore() {
    scoreEls[0].innerText = scores[0];
    scoreEls[1].innerText = scores[1];
    totalScoreEl.innerText = scores[turn - 1];
    streakEl.innerText = `x${streak}`;
    wordsSolvedEl.innerText = wordsSolved;
}

function switchTurn() {
    turn = turn === 1 ? 2 : 1;
    playerEl.innerText = `Player ${turn}'s Turn`;
    totalScoreEl.innerText = scores[turn - 1];
}

function restartTimer() {
    clearInterval(timerId);
    timeLeft = ROUND_TIME[level];
    updateTimerUI();
    timerId = setInterval(() => {
        timeLeft -= 1;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            setMessage("Time's up! Switching turn.", "danger");
            streak = 1;
            switchTurn();
            startRound();
        }
    }, 1000);
}

function updateTimerUI() {
    const pct = Math.max(0, (timeLeft / ROUND_TIME[level]) * 100);
    timerBar.style.width = `${pct}%`;
    timerText.innerText = timeLeft.toString().padStart(2, "0");
}

function pulse(el, text) {
    if (text) setMessage(text);
    el.classList.remove("pulse");
    void el.offsetWidth; // restart animation
    el.classList.add("pulse");
}

function bindUI() {
    document.getElementById("submitBtn").addEventListener("click", submitWord);
    document.getElementById("shuffleBtn").addEventListener("click", shuffleLetters);
    document.getElementById("hintBtn").addEventListener("click", () => showHint());
    document.getElementById("newWordBtn").addEventListener("click", startRound);
    document.getElementById("resetBtn").addEventListener("click", () => {
        wordInput.value = "";
        selected = [];
        document.querySelectorAll(".letters button").forEach((b) => b.classList.remove("active"));
        setMessage("Cleared selection.");
    });
    wordInput.addEventListener("input", () => {
        selected = [];
        document.querySelectorAll(".letters button").forEach((b) => b.classList.remove("active"));
    });
    wordInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitWord();
    });
    levelPillsOverlay.forEach((btn) => {
        btn.addEventListener("click", () => setLevelSelection(btn.dataset.level));
    });

    levelPillsMain.forEach((btn) => {
        btn.addEventListener("click", () => {
            setLevelSelection(btn.dataset.level);
            resetStateForNewGame();
            startGame();
        });
    });

    startBtn.addEventListener("click", () => {
        introEl.classList.add("hidden");
        resetStateForNewGame();
        startGame();
        wordInput.focus();
    });
}

bindUI();