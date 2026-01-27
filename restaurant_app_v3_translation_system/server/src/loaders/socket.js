/**
 * ENTERPRISE MODULE
 * Phase: E3 - Socket.IO Loader
 * DO NOT DELETE – Replaces Socket.IO initialization in server.js
 * 
 * Purpose: Creates and configures the Socket.IO instance
 * Created in PHASE E3
 * 
 * TODO PHASE E6: Implement socket logic from server.js
 */

const { Server } = require('socket.io');
const config = require('../config');

function initSocket(server) {
  // TODO PHASE E6: Implement socket initialization from server.js
  // TODO: Move Socket.IO Server creation with CORS config
  // TODO: Move socket event handlers (connection, disconnect, etc.)
  
  const io = new Server(server, {
    cors: {
      origin: config.env.ALLOWED_ORIGINS,
      methods: ["GET", "POST", "PUT"],
      credentials: true
    }
  });
  
  // TODO PHASE E6: Add socket event handlers
  
  return { io };
}

module.exports = { initSocket };

