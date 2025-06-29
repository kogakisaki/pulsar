import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import fs from 'fs';
import WebSocketManager from './websockets/WebSocketManager';
import infoRouter from './api/info';
import downloadsRouter from './api/downloads';
import historyRouter from './api/history';
import settingsRouter from './api/settings';
import versionRouter from './api/version';

import filesRouter from './api/files'; // Import filesRouter
import errorHandler from './middleware/errorHandler';
import logger from './utils/logger';
import { runStartupChecks } from './utils/startupCheck';
import { startCleanupJob } from './utils/cleanupService'; // Import startCleanupJob
import asyncHandler from './utils/asyncHandler';
import { prisma } from './utils/db';
import { initializeYtDlpService, ytDlpService } from './services/YtDlpService';

export let wsManager: WebSocketManager; // Declare wsManager here

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares

const allowedOrigins = process.env.NODE_ENV === 'production' ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []) : '*';

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json()); // Parse JSON bodies

// A simple test route
app.get('/api', (req, res) => { // Changed to /api to avoid conflict with frontend root
  res.send('Pulsar Backend is running!');
});

app.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

// API Routes
app.use('/api/info', infoRouter);
app.use('/api/downloads', downloadsRouter);
app.use('/api/history', historyRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/version', versionRouter);
app.use('/api/files', filesRouter); // Use the new files router

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for serving the frontend's index.html
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Global error handler - should be the last middleware
app.use(errorHandler);

const startServer = async () => {
  await runStartupChecks();

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wsManager = new WebSocketManager(wss); // Assign wsManager here
  initializeYtDlpService(wsManager); // Initialize ytDlpService with wsManager
  logger.info('WebSocketManager initialized and YtDlpService configured.');

  startCleanupJob(); // Start the cleanup job

  server.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
    logger.info(`WebSocket server is running on ws://localhost:${PORT}`);
  });
};

startServer();