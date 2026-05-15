"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before anything else
dotenv_1.default.config({ path: '../.env' });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socket_1 = require("./utils/socket");
const prisma_1 = require("./utils/prisma");
const smtp_1 = require("./utils/smtp");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Test DB connection
        await prisma_1.prisma.$connect();
        console.log('Connected to Database via Prisma');
        const server = http_1.default.createServer(app_1.default);
        // Initialize Socket.io
        (0, socket_1.initSocket)(server);
        console.log('Socket.io initialized');
        // Start SMTP Server
        (0, smtp_1.startSMTPServer)();
        server.listen(PORT, () => {
            console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma_1.prisma.$disconnect();
    console.log('Disconnected from Database');
    process.exit(0);
});
