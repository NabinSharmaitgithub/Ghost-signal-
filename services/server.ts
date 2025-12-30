// This is a reference implementation of the backend server.
// For the frontend-only demo, we use src/services/mockServer.ts.
// In a real production environment, you would run this with `ts-node server.ts`.

import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Restrict in production
    methods: ["GET", "POST"]
  }
});

// Security Middleware
// Disable frameguard and CSP for preview environments to prevent "refused to connect" errors
app.use(helmet({
  contentSecurityPolicy: false,
  xFrameOptions: false,
}) as any);
app.use(cors());

// Serve static files (React build)
app.use(express.static(path.join((process as any).cwd(), 'public')) as any);

// In-memory store (No DB as per requirements)
const connectedUsers = new Map<string, { id: string, room: string }>();

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    connectedUsers.set(socket.id, { id: socket.id, room: roomId });
    // Notify room of new user (anonymous count only)
    io.to(roomId).emit('user_joined', { count: io.sockets.adapter.rooms.get(roomId)?.size });
  });

  socket.on('send_message', (data: any) => {
    // Relay encrypted message without storing
    const { room, message } = data;
    // Broadcast to room except sender
    socket.to(room).emit('receive_message', message);
  });

  socket.on('signal', (data: any) => {
    // WebRTC Signaling relay
    const { to, signal } = data;
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);
      io.to(user.room).emit('user_left', { count: io.sockets.adapter.rooms.get(user.room)?.size });
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`GhostSignal Server running on port ${PORT}`);
});