// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Socket.IO Client
 * 
 * Singleton Socket.IO client for all React modules.
 * Connects to server Socket.IO instance.
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3; // Reduce console noise

/**
 * Get or create Socket.IO instance
 */
export function getSocket(): Socket {
  if (!socket) {
    // În development, conectăm direct la backend (port 3001)
    // În production, folosim același origin (Vite proxy sau server)
    const isDev = import.meta.env.DEV;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 
                      (isDev ? 'http://localhost:3001' : window.location.origin);
    
    socket = io(serverUrl, {
      transports: ['polling', 'websocket'], // Polling first for reliability
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: MAX_CONNECTION_ATTEMPTS,
      timeout: 10000,
    });
    
    socket.on('connect', () => {
      connectionAttempts = 0; // Reset on successful connection
      console.log('SocketClient ✅ Connected to server');
    });
    
    socket.on('disconnect', (reason) => {
      // Only log if not intentional disconnect
      if (reason !== 'io client disconnect') {
        console.warn('SocketClient ⚠️ Disconnected:', reason);
      }
    });
    
    socket.on('connect_error', (error) => {
      connectionAttempts++;
      
      // Only log first few attempts to reduce console noise
      if (connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
        console.warn(`'SocketClient' ⚠️ Connection error (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error.message);
      }
      
      // After max attempts, stop trying and log final message
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        console.info('SocketClient ℹ️ Real-time features disabled (backend unavailable). App will work in offline mode.');
        socket?.disconnect(); // Stop reconnection attempts
      }
    });
  }
  
  return socket;
}

/**
 * Disconnect Socket.IO
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
  return socket?.connected || false;
}



