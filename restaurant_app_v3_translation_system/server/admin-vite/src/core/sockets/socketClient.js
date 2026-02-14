"use strict";
// import { useTranslation } from '@/i18n/I18nContext';
/**
 * PHASE S10 - Socket.IO Client
 *
 * Singleton Socket.IO client for all React modules.
 * Connects to server Socket.IO instance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocket = getSocket;
exports.disconnectSocket = disconnectSocket;
exports.isSocketConnected = isSocketConnected;
var socket_io_client_1 = require("socket.io-client");
var socket = null;
var connectionAttempts = 0;
var MAX_CONNECTION_ATTEMPTS = 3; // Reduce console noise
/**
 * Get or create Socket.IO instance
 */
function getSocket() {
    if (!socket) {
        // În development, conectăm direct la backend (port 3001)
        // În production, folosim același origin (Vite proxy sau server)
        var isDev = import.meta.env.DEV;
        var serverUrl = import.meta.env.VITE_SERVER_URL ||
            (isDev ? 'http://localhost:3001' : window.location.origin);
        socket = (0, socket_io_client_1.io)(serverUrl, {
            transports: ['polling', 'websocket'], // Polling first for reliability
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 3000,
            reconnectionAttempts: MAX_CONNECTION_ATTEMPTS,
            timeout: 10000,
        });
        socket.on('connect', function () {
            connectionAttempts = 0; // Reset on successful connection
            console.log('SocketClient ✅ Connected to server');
        });
        socket.on('disconnect', function (reason) {
            // Only log if not intentional disconnect
            if (reason !== 'io client disconnect') {
                console.warn('SocketClient ⚠️ Disconnected:', reason);
            }
        });
        socket.on('connect_error', function (error) {
            connectionAttempts++;
            // Only log first few attempts to reduce console noise
            if (connectionAttempts <= MAX_CONNECTION_ATTEMPTS) {
                console.warn("'SocketClient' \u26A0\uFE0F Connection error (attempt ".concat(connectionAttempts, "/").concat(MAX_CONNECTION_ATTEMPTS, "):"), error.message);
            }
            // After max attempts, stop trying and log final message
            if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
                console.info('SocketClient ℹ️ Real-time features disabled (backend unavailable). App will work in offline mode.');
                socket === null || socket === void 0 ? void 0 : socket.disconnect(); // Stop reconnection attempts
            }
        });
    }
    return socket;
}
/**
 * Disconnect Socket.IO
 */
function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
/**
 * Check if socket is connected
 */
function isSocketConnected() {
    return (socket === null || socket === void 0 ? void 0 : socket.connected) || false;
}
