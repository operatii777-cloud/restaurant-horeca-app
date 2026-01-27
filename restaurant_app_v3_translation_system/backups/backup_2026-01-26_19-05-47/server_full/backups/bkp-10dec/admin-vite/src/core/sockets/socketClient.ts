/**
 * PHASE S10 - Socket.IO Client
 * 
 * Singleton Socket.IO client for all React modules.
 * Connects to server Socket.IO instance.
 */

import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Get or create Socket.IO instance
 */
export function getSocket(): Socket {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_SERVER_URL || window.location.origin;
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    
    socket.on('connect', () => {
      console.log('[SocketClient] Connected to server');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('[SocketClient] Disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('[SocketClient] Connection error:', error);
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

