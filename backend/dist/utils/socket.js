"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        // Clients will join a room named after their mailbox or phone number ID
        socket.on('join_inbox', (inboxId) => {
            socket.join(inboxId);
            console.log(`Socket ${socket.id} joined inbox ${inboxId}`);
        });
        socket.on('join_phone', (phoneId) => {
            socket.join(phoneId);
            console.log(`Socket ${socket.id} joined phone ${phoneId}`);
        });
        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
