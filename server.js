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

// Static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
// Serve Three.js locally to avoid CDN caching issues
app.use('/vendor', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));

// Members route now served by Vite build output at /public/members
app.get(['/members', '/members/'], (_req, res) => {
  res.sendFile(path.join(publicDir, 'members', 'index.html'));
});

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

