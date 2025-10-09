const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO with CORS for production (allow all for testing, restrict later)
  const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for testing; replace with your Render domain later (e.g., "https://your-app.onrender.com")
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user joining their notification room
    socket.on('join-user-room', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${socket.id} joined notification room for user ${userId}`);
    });

    // Handle user joining project room
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`User ${socket.id} joined project room ${projectId}`);
    });

    // Handle user leaving project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`User ${socket.id} left project room ${projectId}`);
    });

    // Legacy: Handle join room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle chat message
    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('receive-message', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  // Make io globally available for notification service
  global.socketIo = io;

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});