/**
 * PHASE E9.7 - Enterprise Server (Clean Version)
 * 
 * Transformed from 37,000+ lines to ~250 lines.
 * All logic moved to loaders and modules.
 */

// ========================================
// GLOBAL ERROR HANDLERS
// ========================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [UNHANDLED REJECTION]', reason);
  if (reason && reason.stack) {
    console.error('📚 Stack Trace:', reason.stack);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ [UNCAUGHT EXCEPTION]', error.message);
  console.error('📚 Stack Trace:', error.stack);
  
  // Critical errors - exit
  if (error.code === 'EADDRINUSE' || error.code === 'EACCES' || error.code === 'ECONNREFUSED') {
    console.error('🔴 Critical error - server must restart');
    process.exit(1);
  }
});

process.on('warning', (warning) => {
  if (warning.name !== 'DeprecationWarning') {
    console.warn('⚠️ [WARNING]', warning.name, '-', warning.message);
  }
});

// ========================================
// TIMEZONE CONFIGURATION
// ========================================
process.env.TZ = 'Europe/Bucharest';
console.log(`⏰ Timezone set: ${process.env.TZ}`);
console.log(`🕐 Server time (Romania): ${new Date().toLocaleString('ro-RO', { timeZone: 'Europe/Bucharest' })}`);

// ========================================
// CORE IMPORTS
// ========================================
const express = require('express');
const { createServer } = require('http');
const { dbPromise } = require('./database');

// ========================================
// LOADERS
// ========================================
const {
  loadAll,
  loadModules,
  loadErrorHandlers
} = require('./src/loaders');

// ========================================
// INITIALIZE EXPRESS APP
// ========================================
const app = express();
const httpServer = createServer(app);

// ========================================
// LOAD ALL MIDDLEWARE
// ========================================
loadAll(app);

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '3.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    version: '3.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ========================================
// PHASE S9.6 - SOCKET.IO INITIALIZATION
// ========================================
const { Server } = require('socket.io');
let io = null;

// Initialize Socket.IO after HTTP server is created
const initSocketIO = () => {
  if (!io && httpServer) {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
      }
    });
    
    // Make io globally available (for legacy compatibility)
    global.io = io;
    
    console.log('✅ Socket.IO initialized');
    
    // PHASE S9.6 - Order Engine V2 Socket Bridge
    const { ENABLE_SOCKET_BRIDGE } = require('./src/config/orderEngine.config');
    if (ENABLE_SOCKET_BRIDGE) {
      const { setupOrderSocketBridge } = require('./src/modules/orders/order.socket-bridge');
      setupOrderSocketBridge(io);
      console.log('✅ Order Engine V2 Socket Bridge enabled');
    } else {
      console.log('ℹ️ Order Engine V2 Socket Bridge disabled (ENABLE_SOCKET_BRIDGE=false)');
    }
    
    // Legacy socket handlers (if any) can be added here
    io.on('connection', (socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });
  }
  
  return io;
};

// ========================================
// LOAD ENTERPRISE MODULES (ASYNC)
// ========================================
dbPromise.then(async (db) => {
  await loadModules(app);
  console.log('✅ All enterprise modules loaded');
  
  // PHASE S7.1 - POS Fiscal Routes (after modules loaded)
  const posFiscalRoutes = require('./src/modules/fiscal/routes.pos');
  app.use('/api/admin/pos', posFiscalRoutes);
  console.log('✅ POS Fiscal routes mounted: /api/admin/pos/fiscalize');
  
  // S13 - COGS Routes
  const cogsRoutes = require('./src/modules/cogs/cogs.routes');
  app.use('/api/cogs', cogsRoutes);
  console.log('✅ COGS routes mounted: /api/cogs/*');
  
  // Initialize Socket.IO after modules are loaded
  initSocketIO();
}).catch((err) => {
  console.error('⚠️ Failed to load modules (db not ready):', err.message);
  // Try to load modules without db-dependent ones
  loadModules(app).catch(() => {
    console.error('❌ Failed to load any modules');
  });
  
  // Still initialize Socket.IO even if modules fail
  initSocketIO();
});

// ========================================
// REACT CATCH-ALL (SPA Routing)
// ========================================
// BEGIN: SAFE FIX — SPA bypass for API and static assets
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|map)$/i)) return next();
  
  // Serve admin-vite index.html for SPA routes
  const path = require('path');
  const fs = require('fs');
  const adminViteIndex = path.join(__dirname, 'admin-vite', 'dist', 'index.html');
  
  if (fs.existsSync(adminViteIndex)) {
    return res.sendFile(adminViteIndex);
  }
  
  next();
});
// END: SAFE FIX

// ========================================
// ERROR HANDLERS (MUST BE LAST)
// ========================================
loadErrorHandlers(app);

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Enterprise server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API health: http://localhost:${PORT}/api/health`);
  
  // Initialize Socket.IO after server starts
  initSocketIO();
});

module.exports = { app, httpServer };

