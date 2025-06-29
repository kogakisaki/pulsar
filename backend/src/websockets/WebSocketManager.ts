import { WebSocket, WebSocketServer } from 'ws';
import logger from '../utils/logger';

interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(wss: WebSocketServer) {
    this.wss = wss;
    this.clients = new Set<WebSocket>();
    this.setupListeners();
  }

  private setupListeners() {
    this.wss.on('connection', ws => {
      this.clients.add(ws);
      logger.info('WebSocket client connected. Total clients: %d', this.clients.size);

      ws.on('message', message => {
        logger.info('Received message from client: %s', message.toString());
        // Handle incoming messages if needed (e.g., client requests)
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        logger.info('WebSocket client disconnected. Total clients: %d', this.clients.size);
      });

      ws.on('error', error => {
        logger.error(error, 'WebSocket error for client');
      });
    });
  }

  public broadcast(message: WebSocketMessage) {
    const messageString = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
    logger.debug('Broadcasted message: %j', message);
  }

  public sendToClient(ws: WebSocket, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      logger.debug('Sent message to client: %j', message);
    }
  }
}

export default WebSocketManager;