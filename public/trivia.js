const socket = io("https://pegasus-delta.vercel.app");

// UI Elements
const questionCountEl = document.getElementById('question-count');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const messageEl = document.getElementById('message');
const leaderboardListEl = document.getElementById('leaderboard-list');
const startGameBtn = document.getElementById('start-game-btn');
const hostControls = document.getElementById('host-controls');

let players = new Map();

// --- Admin Controls ---
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';
if (!isAdmin) {
    hostControls.style.display = 'none';
}

// --- Event Listeners ---
startGameBtn.addEventListener('click', () => {
    socket.emit('trivia:start');
    startGameBtn.style.display = 'none';
});

optionsEl.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const answerIndex = parseInt(e.target.dataset.index, 10);
        socket.emit('trivia:submit_answer', answerIndex);
        
        optionsEl.querySelectorAll('button').forEach(btn => btn.disabled = true);
        e.target.style.borderColor = '#fff';
    }
});

// --- Socket Handlers ---
socket.on('connect', () => {
    const name = sessionStorage.getItem('playerName') || `Player${Math.floor(Math.random() * 1000)}`;
    sessionStorage.setItem('playerName', name);
    socket.emit('player:join', name);
});

socket.on('players:update', (playerList) => {
    players.clear();
    playerList.forEach(p => players.set(p.id, p));
    updateLeaderboard([]);
});

socket.on('trivia:current_scores', (scores) => {
    updateLeaderboard(scores);
});

socket.on('trivia:new_question', ({ question, options, index, total }) => {
    messageEl.textContent = '';
    questionEl.textContent = question;
    questionCountEl.textContent = `Question ${index + 1} of ${total}`;
    optionsEl.innerHTML = '';
    
    options.forEach((option, i) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.dataset.index = i;
        optionsEl.appendChild(button);
    });
});

socket.on('trivia:timer_update', (time) => {
    timerEl.textContent = time;
});

socket.on('trivia:round_end', ({ answer, scores }) => {
    const buttons = optionsEl.querySelectorAll('button');
    buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === answer) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('incorrect');
        }
    });
    updateLeaderboard(scores);
});

socket.on('trivia:game_over', (finalScores) => {
    questionEl.textContent = "Game Over!";
    optionsEl.innerHTML = '';
    messageEl.textContent = "Thanks for playing!";
    updateLeaderboard(finalScores);
    if(isAdmin) startGameBtn.style.display = 'block';
});

// --- Helper Functions ---
function updateLeaderboard(scores) {
    const sortedScores = scores.sort((a, b) => b[1] - a[1]);
    
    leaderboardListEl.innerHTML = '';
    sortedScores.forEach(([id, score]) => {
        const player = players.get(id);
        const playerName = player ? player.name : 'Unknown';
        
        const li = document.createElement('li');
        li.innerHTML = `<span>${playerName}</span><span>${score}</span>`;
        leaderboardListEl.appendChild(li);
    });
}
