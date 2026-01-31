// Add or edit questions in this array to expand the quiz.
const questionBank = [
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Control Program Utility", "Core Peripheral Unit"],
    answer: 0,
    hint: "It executes instructions and performs calculations."
  },
  {
    question: "Which part of a computer is considered the main circuit board?",
    options: ["SSD", "RAM", "Motherboard", "Power Supply"],
    answer: 2,
    hint: "All core components plug into it."
  },
  {
    question: "What does HTTP stand for?",
    options: ["Hyperlink Transfer Process", "Hypertext Transfer Protocol", "High Text Transmission Program", "Host Transfer Protocol"],
    answer: 1,
    hint: "It is the protocol used by browsers to fetch pages."
  },
  {
    question: "Binary numbers use which base?",
    options: ["2", "8", "10", "16"],
    answer: 0,
    hint: "Only 0 and 1 appear."
  },
  {
    question: "Which component temporarily stores data for quick access?",
    options: ["RAM", "HDD", "GPU", "Power Supply"],
    answer: 0,
    hint: "It is cleared when the computer powers off."
  },
  {
    question: "What does the command line instruction 'cd' do?",
    options: ["Copy data", "Create directory", "Change directory", "Clear display"],
    answer: 2,
    hint: "It moves you to another folder."
  },
  {
    question: "Which device converts digital signals to a form suitable for transmission over phone lines?",
    options: ["Router", "Modem", "Switch", "Repeater"],
    answer: 1,
    hint: "Its name combines 'modulator' and 'demodulator'."
  },
  {
    question: "What type of software is an operating system?",
    options: ["Application software", "System software", "Utility software", "Firmware"],
    answer: 1,
    hint: "It manages hardware and other programs."
  },
  {
    question: "Which storage is non-volatile?",
    options: ["RAM", "Cache", "Registers", "SSD"],
    answer: 3,
    hint: "It keeps data without power."
  },
  {
    question: "What does GPU stand for?",
    options: ["General Processing Unit", "Graphical Performance Utility", "Graphics Processing Unit", "Grid Processing Unit"],
    answer: 2,
    hint: "It accelerates rendering images and video."
  },
  {
    question: "Which protocol secures web traffic with encryption?",
    options: ["FTP", "HTTP", "SSH", "HTTPS"],
    answer: 3,
    hint: "It adds TLS on top of HTTP."
  },
  {
    question: "Which part of a URL identifies the server or domain?",
    options: ["Protocol", "Path", "Hostname", "Query string"],
    answer: 2,
    hint: "It sits between // and the first /."
  },
  {
    question: "What is the main function of DNS?",
    options: ["Encrypt data", "Translate domain names to IP addresses", "Manage email", "Host websites"],
    answer: 1,
    hint: "It translates human-friendly names to IP addresses."
  },
  {
    question: "Which programming language is primarily used for web development on the client side?",
    options: ["Python", "Java", "JavaScript", "C++"],
    answer: 2,
    hint: "It runs in the browser."
  }
];

const QUESTION_TIME = 15;
const BASE_POINTS = 12;
const HINT_PENALTY = 0.5; // score is halved when hint is used

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("score");
const timerText = document.getElementById("timerText");
const timeLabel = document.getElementById("timeLabel");
const timerBar = document.getElementById("timerBar");
const statusEl = document.getElementById("status");
const hintEl = document.getElementById("hint");
const hintBtn = document.getElementById("hintBtn");
const nextBtn = document.getElementById("nextBtn");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const state = {
  order: [],
  index: 0,
  score: 0,
  hintUsed: false,
  answered: false,
  timerId: null,
  timeLeft: QUESTION_TIME
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function resetState() {
  clearInterval(state.timerId);
  state.order = shuffle([...Array(questionBank.length).keys()]);
  state.index = 0;
  state.score = 0;
  scoreEl.textContent = "0";
  renderQuestion();
}

function renderQuestion() {
  clearInterval(state.timerId);
  state.hintUsed = false;
  state.answered = false;
  hintBtn.disabled = false;
  nextBtn.disabled = true;
  hintEl.textContent = "Hint is hidden until requested.";
  statusEl.className = "eyebrow";
  const q = questionBank[state.order[state.index]];
  questionEl.textContent = q.question;
  progressEl.textContent = `${state.index + 1} / ${questionBank.length}`;
  optionsEl.innerHTML = "";

  q.options.forEach((option, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => selectOption(btn, i));
    optionsEl.appendChild(btn);
  });

  state.timeLeft = QUESTION_TIME;
  updateTimerUI();
  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    updateTimerUI();
    if (state.timeLeft <= 0) {
      clearInterval(state.timerId);
      lockQuestion("Time is up. Correct answer shown.");
    }
  }, 1000);

  const isLast = state.index === questionBank.length - 1;
  nextBtn.textContent = isLast ? "Finish" : "Next";
  statusEl.textContent = "Pick the best answer.";
}

function updateTimerUI() {
  const pct = Math.max(0, (state.timeLeft / QUESTION_TIME) * 100);
  timerBar.style.width = `${pct}%`;
  timerText.textContent = `${state.timeLeft.toString().padStart(2, "0")}s`;
  timeLabel.textContent = timerText.textContent;
}

function selectOption(btn, choiceIndex) {
  if (state.answered) return;
  const q = questionBank[state.order[state.index]];
  const isCorrect = choiceIndex === q.answer;
  state.answered = true;
  clearInterval(state.timerId);

  const buttons = Array.from(optionsEl.querySelectorAll(".option-btn"));
  buttons.forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.answer) b.classList.add("correct");
  });

  if (isCorrect) {
    const timeBonus = Math.max(0, Math.floor(state.timeLeft / 5));
    const base = BASE_POINTS + timeBonus;
    const earned = state.hintUsed ? Math.max(1, Math.round(base * HINT_PENALTY)) : base;
    state.score += earned;
    scoreEl.textContent = state.score.toString();
    btn.classList.add("correct");
    statusEl.textContent = `Correct! +${earned} points${state.hintUsed ? " (hint penalty)" : ""}`;
    statusEl.className = "eyebrow status-good";
  } else {
    btn.classList.add("wrong");
    statusEl.textContent = "Not quite. Study the correct answer and keep going.";
    statusEl.className = "eyebrow status-bad";
  }

  nextBtn.disabled = false;
  hintBtn.disabled = true;
}

function lockQuestion(message) {
  state.answered = true;
  const q = questionBank[state.order[state.index]];
  Array.from(optionsEl.querySelectorAll(".option-btn")).forEach((b, idx) => {
    b.disabled = true;
    if (idx === q.answer) b.classList.add("correct");
  });
  statusEl.textContent = message;
  statusEl.className = "eyebrow status-bad";
  nextBtn.disabled = false;
  hintBtn.disabled = true;
}

function showHint() {
  if (state.answered) return;
  const q = questionBank[state.order[state.index]];
  hintEl.textContent = q.hint;
  state.hintUsed = true;
  hintBtn.disabled = true;
}

function nextQuestion() {
  if (!state.answered) return;
  const nextIndex = state.index + 1;
  if (nextIndex >= questionBank.length) {
    endQuiz();
    return;
  }
  state.index = nextIndex;
  renderQuestion();
}

function endQuiz() {
  clearInterval(state.timerId);
  questionEl.textContent = "Quiz complete!";
  optionsEl.innerHTML = "";
  statusEl.textContent = "Press Restart to try again or add more questions in quiz.js.";
  statusEl.className = "eyebrow";
  progressEl.textContent = `${questionBank.length} / ${questionBank.length}`;
  nextBtn.disabled = true;
  hintBtn.disabled = true;
  hintEl.textContent = "";
}

function init() {
  startBtn.addEventListener("click", resetState);
  restartBtn.addEventListener("click", resetState);
  hintBtn.addEventListener("click", showHint);
  nextBtn.addEventListener("click", nextQuestion);
  progressEl.textContent = `0 / ${questionBank.length}`;
  timerBar.style.width = "100%";
}

init();
