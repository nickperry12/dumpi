import express, { json } from 'express';
import { mountRoutes } from './routes/mount.js';
import { query } from './db/database.js';
import { Server } from 'socket.io';
import cors from 'cors';
import http from 'http';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.static('dist'));
app.use(cors());
app.use(json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://www.drumsofliberation.ca',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    transport: ['websocket'],
  }
});

const PORT = 3000;

app.set('io', io);
mountRoutes(app);

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));  // Serve the SPA from the dist folder
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  })
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on port ${PORT}!`);
});

process.on('exit', () => {
  query.pool.end(() => {
    console.log('Connection pool has closed');
  })
});
