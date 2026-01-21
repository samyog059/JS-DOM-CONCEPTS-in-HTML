const Easyword = [
    { word:"computer", meaning:"An electronic device for processing data"},
    { word: "mouse", meaning: "A device to control the pointer on screen"},
    { word: "keyword", meaning:"Input device with keys"},
    { word: "monitor", meaning: "Screen that displays output"},
    { word: "printer", meaning: "Device that prints documents"},
    { word: "bug", meaning: "An error or flaw in a program"},
    { word: "bit", meaning: "Smallest unit of data(0 or 1)"},
    { word: "byte", meaning:"8 bits together"},
    { word: "website", meaning: " Collection of Web pages"},
    { word:"web browsers", meaning:"Software to access websites"},
    { word:"boot", meaning:"Start up a computer"},
    { word:"modem", meaning:"Device to connect to internet"},
    { word: "virus", meaning:"Malicious program that harms computer"},
    { word:"megabyte", meaning:"1 million bytes of data"},
    { word:"icon", meaning: "Small picture representing a program or file"}
];
const Mediumword = [
    { word:"algorithm", meaning:"step-by-step procedure to solve a program"},
    { word:"bandwidth", meaning:"Data transfer capacity of a network"},
    { word:"cache", meaning:"Temporary storage for fast access"},
    { word:"debug", meaning:"Find and fix errors in code"},
    { word:"reboot", meaning:"Restart a computer"},
    { word:"database", meaning:"Organized collection of data"},
    { word:"cyber-crime", meaning:"Crime using computers or internet"},
    { word:"dot", meaning:"(.) symbol used in URLs or files name"},
    { word:"drag", meaning:"Move an object on screen using mouse"},
    { word:"flowchart", meaning:"diagram showing steps of a process"},
    { word:"gigabyte", meaning:"1 billion bytes of data"},
    { word:"hyperlink", meaning:"Clickable link to another webpages"},
    { word:"linux", meaning:"Open-source operating system"},
    { word: "motherboard", meaning:"Main circuit board of a computer"},
    { word: "protocol", meaning:"Rules for communication between computers"},
    
];
const Hardword = [
    { word:"resolution", meaning:"Number of pixels on a screen"},
    { word:"snapshot", meaning:"Captured image of screen or data"},
    { word: "supercomputer", meaning:"Extremely fast computer for complex tasks"},
    { word: "search engine", meaning:" Tools to find information online"},
    { word:"spreadsheet", meaning:"Table used to organize numbers/data"},
    {word: "spyware", meaning:"Software that secretly collects info"},
    { word: "typeface", meaning:"Style of printed or digital text"},
    { word: "unix", meaning:"Powerful multitasking operating system"},
    { word: "webmaster", meaning:"Person managing a website"},
    { word:"cloud computing", meaning:"Using remote servers to store/process data"},
    { word: "cyberspace", meaning:"Virtual computer network world(internet)"},
    { word: "data mining", meaning:"Extracting useful info from data"},
    { word:"emoticon", meaning:"Text symbol showing emotion"},
    { word:"firewall", meaning:"Security system blocking unauthorized access"},
    { word: "IP address", meaning:"Unique number udentifying a device on network"}
];

let levelWords = [];
let currentLetters = [];
let currentWord = "";
let turn = 1; // Player 1 starts
let scores = [0,0];
let level = "Easy";

// Pick words based on level
function startGame() {
    document.getElementById("player").innerText = "Player 1's Turn";
    // Set level words
    if(level=="Easy") levelWords = Easyword.slice(0,1);
    else if(level=="Medium") levelWords = Mediumword.slice(0,15);
    else levelWords = Hardword.slice(0,15);

    pickWord();
}

// Pick random word and generate letters
function pickWord() {
    const picked = levelWords[Math.floor(Math.random()*levelWords.length)];
    currentWord = picked.word; // use the word string from the object
    currentLetters = currentWord.split('');
    shuffleLetters();
}

// Shuffle letters
function shuffleLetters() {
    for(let i=currentLetters.length-1;i>0;i--){
        const j = Math.floor(Math.random()* (i+1));
        [currentLetters[i], currentLetters[j]] = [currentLetters[j], currentLetters[i]];
    }
    document.getElementById("letters").innerText = currentLetters.join(" ");
}

// Show hint
function showHint() {
    let hint = currentWord[0] + "_".repeat(currentWord.length-1);
    document.getElementById("message").innerText = "Hint: " + hint;
}

// Submit word
function submitWord() {
    const input = document.getElementById("wordInput").value.toLowerCase();
    if(input === currentWord) {
        document.getElementById("message").innerText = "Correct! +" + currentWord.length + " points!";
        scores[turn-1] += currentWord.length;
        updateScore();
        turn = (turn==1)?2:1;
        document.getElementById("player").innerText = "Player " + turn + "'s Turn";
        document.getElementById("wordInput").value = "";
        pickWord();
    } else {
        document.getElementById("message").innerText = "Incorrect! Try again.";
    }
}

// Update scoreboard
function updateScore() {
    document.getElementById("score1").innerText = scores[0];
    document.getElementById("score2").innerText = scores[1];
}

// Set level
function setLevel(lv) {
    level = lv;
    document.getElementById("level").innerText = "Level: " + level;
    startGame();
}

// Start game on load
startGame();