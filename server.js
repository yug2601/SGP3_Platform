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

  // Socket.IO event handlers (customize as needed)
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Example: Handle join room
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Example: Handle chat message
    socket.on('send-message', (data) => {
      io.to(data.roomId).emit('receive-message', data);
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});