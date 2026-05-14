import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config({ path: '../.env' }); 

import http from 'http';
import app from './app';
import { initSocket } from './utils/socket';
import { prisma } from './utils/prisma';
import { startSMTPServer } from './utils/smtp';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    console.log('Connected to Database via Prisma');

    const server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server);
    console.log('Socket.io initialized');

    // Start SMTP Server
    startSMTPServer();

    server.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from Database');
  process.exit(0);
});
