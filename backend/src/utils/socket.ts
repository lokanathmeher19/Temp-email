import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Clients will join a room named after their mailbox or phone number ID
    socket.on('join_inbox', (inboxId: string) => {
      socket.join(inboxId);
      console.log(`Socket ${socket.id} joined inbox ${inboxId}`);
    });

    socket.on('join_phone', (phoneId: string) => {
      socket.join(phoneId);
      console.log(`Socket ${socket.id} joined phone ${phoneId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
