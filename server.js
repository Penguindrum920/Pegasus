const path = require('path');
const http = require('http');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
  allowEIO3: false,
});

// Middleware
app.use(compression());
//app.use(helmet({
//  contentSecurityPolicy: false,
//  crossOriginEmbedderPolicy: false, // Add this line
//}));
app.use(cors());
app.use(morgan('tiny'));

// Basic rate limiting for HTTP endpoints (not for websockets)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  legacyHeaders: false,
  standardHeaders: true,
});
app.use(limiter);

// Members route now served by Vite build output at /public/members
const publicDir = path.join(__dirname, 'public');

// Explicitly handle members route before static files
app.get('/members', (_req, res) => {
  console.log('Serving React members app');
  res.sendFile(path.join(publicDir, 'members', 'index.html'));
});

app.get('/members/', (_req, res) => {
  console.log('Serving React members app (with trailing slash)');
  res.sendFile(path.join(publicDir, 'members', 'index.html'));
});

// Static files
app.use(express.static(publicDir));
// Serve Three.js locally to avoid CDN caching issues
app.use('/vendor', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));

// Serve members assets
app.use('/members/assets', express.static(path.join(publicDir, 'members', 'assets')));

// Serve textures for the solar system
app.use('/textures', express.static(path.join(publicDir, 'textures')));

// Serve member images from multiple possible locations
app.use('/assets/members', express.static(path.join(publicDir, 'assets', 'members')));
app.use('/members/images', express.static(path.join(publicDir, 'assets', 'members')));
app.use('/images', express.static(path.join(publicDir, 'assets', 'members')));

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Simple in-memory game state (sufficient for ~150 users)
const players = new Map(); // socketId -> { name, x, y, color }

function getInitialPosition() {
  const x = Math.floor(Math.random() * 800) + 20;
  const y = Math.floor(Math.random() * 500) + 20;
  return { x, y };
}

function broadcastPlayerList() {
  const list = Array.from(players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    x: p.x,
    y: p.y,
    color: p.color,
  }));
  io.emit('players', list);
}

function broadcastGameState() {
  const gameState = {
    players: Array.from(players.values()),
    timestamp: Date.now(),
  };
  io.emit('gameState', gameState);
}
// =============================================================
// TRIVIA GAME STATE AND LOGIC
// =============================================================

const triviaState = {
    isRoundActive: false,
    currentQuestionIndex: -1,
    scores: new Map(), // socket.id -> score
    timer: 10, // Timer is 10 seconds
    roundTimeout: null,
};

// 20 fun questions
const triviaQuestions = [
    { question: "What does the <a> tag represent in HTML?", options: ["An article", "An abbreviation", "A hyperlink", "An accent"], answer: 2 },
    { question: "Which CSS property is used to make text bold?", options: ["font-style", "font-weight", "text-decoration", "text-transform"], answer: 1 },
    { question: "What symbol is used to select an element by its ID in CSS?", options: [". (dot)", "# (hash)", "$ (dollar)", "& (ampersand)"], answer: 1 },
    { question: "In JavaScript, what does `===` check for?", options: ["Value only", "Reference only", "Value and type", "If a variable exists"], answer: 2 },
    { question: "Which `git` command is used to upload your local commits to GitHub?", options: ["git upload", "git fetch", "git commit", "git push"], answer: 3 },
    { question: "What company originally developed the React library?", options: ["Google", "Microsoft", "Facebook (Meta)", "Oracle"], answer: 2 },
    { question: "The 'This is Fine' meme features a dog in a room that is...?", options: ["Flooding", "On fire", "Freezing", "Full of cats"], answer: 1 },
    { question: "What is the main purpose of an API?", options: ["To style websites", "To allow applications to communicate", "To secure a database", "To animate elements"], answer: 1 },
    { question: "What does 'CSS' stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Syntax", "Colorful Styling Sheets"], answer: 0 },
    { question: "In the 'Distracted Boyfriend' meme, what does the boyfriend's original partner usually represent?", options: ["A new trend", "A fun distraction", "The responsible choice", "A past mistake"], answer: 2 },
    { question: "Which of these is a popular version control system?", options: ["Docker", "Webpack", "Git", "Node.js"], answer: 2 },
    { question: "What does '404' mean in HTTP status codes?", options: ["OK", "Server Error", "Redirect", "Not Found"], answer: 3 },
    { question: "The 'Stonks' meme character is typically associated with...?", options: ["Good financial decisions", "Expert cooking skills", "Questionable financial decisions", "Athletic success"], answer: 2 },
    { question: "What does the `<img>` tag need in order to display an image?", options: ["class attribute", "style attribute", "src attribute", "alt attribute"], answer: 2 },
    { question: "In VS Code, what is the default shortcut to open the command palette?", options: ["Ctrl+P", "Ctrl+Shift+P", "Ctrl+Alt+P", "Ctrl+Space"], answer: 1 },
    { question: "Which of these is NOT a programming language?", options: ["Python", "JavaScript", "HTML", "Java"], answer: 2 },
    { question: "What is the block-building game that was sold to Microsoft for $2.5 billion?", options: ["Roblox", "Terraria", "Fortnite", "Minecraft"], answer: 3 },
    { question: "Which company's logo is a bitten apple?", options: ["Samsung", "Microsoft", "Apple", "Google"], answer: 2 },
    { question: "What does 'NaN' stand for in JavaScript?", options: ["No Action Needed", "Not a Number", "New Asset Name", "Null and Negated"], answer: 1 },
    { question: "What is the mascot of GitHub?", options: ["The Octocat", "The GitGopher", "The CodeCat", "The HubLlama"], answer: 0 }
];

function startNextRound() {
    if (triviaState.roundTimeout) clearTimeout(triviaState.roundTimeout);

    triviaState.currentQuestionIndex++;
    if (triviaState.currentQuestionIndex >= triviaQuestions.length) {
        io.emit('trivia:game_over', Array.from(triviaState.scores.entries()));
        triviaState.isRoundActive = false;
        triviaState.currentQuestionIndex = -1;
        triviaState.scores.clear();
        return;
    }

    triviaState.isRoundActive = true;
    triviaState.timer = 10;
    const currentQuestion = triviaQuestions[triviaState.currentQuestionIndex];
    
    const questionData = {
        question: currentQuestion.question,
        options: currentQuestion.options,
        index: triviaState.currentQuestionIndex,
        total: triviaQuestions.length
    };
    io.emit('trivia:new_question', questionData);
    
    const countdown = setInterval(() => {
        triviaState.timer--;
        io.emit('trivia:timer_update', triviaState.timer);
        if (triviaState.timer <= 0) clearInterval(countdown);
    }, 1000);

    triviaState.roundTimeout = setTimeout(() => {
        clearInterval(countdown);
        triviaState.isRoundActive = false;
        io.emit('trivia:round_end', {
            answer: currentQuestion.answer,
            scores: Array.from(triviaState.scores.entries())
        });
        setTimeout(startNextRound, 5000); // 5-second delay
    }, 10000); // 10-second round
}
// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player join
  socket.on('join', (data) => {
    const { name, color } = data;
    const position = getInitialPosition();
    
    players.set(socket.id, {
      id: socket.id,
      name: name || `Player ${socket.id.slice(0, 6)}`,
      x: position.x,
      y: position.y,
      color: color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    });

    // Send current game state to the new player
    socket.emit('gameState', {
      players: Array.from(players.values()),
      timestamp: Date.now(),
    });

    // Broadcast updated player list
    broadcastPlayerList();
  });

  // Handle player movement
  socket.on('move', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.x = Math.max(0, Math.min(800, data.x));
      player.y = Math.max(0, Math.min(500, data.y));
      broadcastGameState();
    }
  });

  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    players.delete(socket.id);
    broadcastPlayerList();
  });
});

// Game loop - broadcast state every 60fps
setInterval(() => {
  if (players.size > 0) {
    broadcastGameState();
  }
}, 1000 / 60);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${PORT}`);
});

