/**
 * 🔄 PM2 ECOSYSTEM CONFIG
 * 
 * Configurație pentru PM2 Process Manager
 * Auto-restart, monitoring, logs, cluster mode
 * 
 * Utilizare:
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js
 *   pm2 logs
 *   pm2 monit
 *   pm2 restart restaurant-server
 *   pm2 stop restaurant-server
 */

module.exports = {
  apps: [
    {
      // ========================================
      // CONFIGURARE APLICAȚIE
      // ========================================
      name: 'restaurant-server',
      script: './server.js',
      cwd: __dirname,
      
      // ========================================
      // AUTO-RESTART SETTINGS
      // ========================================
      autorestart: true,              // Auto-restart la crash
      max_restarts: 10,                // Maxim 10 restart-uri consecutive
      min_uptime: '10s',               // Consideră "pornit" după 10s
      max_memory_restart: '1G',        // Restart dacă depășește 1GB RAM
      
      // ========================================
      // RESTART DELAY (Exponential Backoff)
      // ========================================
      restart_delay: 4000,             // Așteaptă 4s înainte de restart
      exp_backoff_restart_delay: 100,  // Crește delay-ul exponențial
      
      // ========================================
      // WATCH MODE (Opțional - Dezvoltare)
      // ========================================
      watch: false,                    // NU reporni la modificări în producție
      ignore_watch: [
        'node_modules',
        'logs',
        'data',
        '*.db',
        '*.log',
        'backups'
      ],
      
      // ========================================
      // LOGGING
      // ========================================
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,                      // Timestamp în logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // ========================================
      // ENVIRONMENT VARIABLES
      // ========================================
      env: {
        NODE_ENV: 'production',
        TZ: 'Europe/Bucharest',
        PORT_HTTP: 3001,
        PORT_HTTPS: 3002,
      },
      
      env_development: {
        NODE_ENV: 'development',
        TZ: 'Europe/Bucharest',
        PORT_HTTP: 3001,
        PORT_HTTPS: 3002,
      },
      
      // ========================================
      // ADVANCED SETTINGS
      // ========================================
      instances: 1,                    // Single instance (sau 'max' pentru cluster)
      exec_mode: 'fork',               // 'fork' sau 'cluster'
      
      // Kill timeout
      kill_timeout: 5000,              // Așteaptă 5s înainte de SIGKILL
      
      // Listen timeout
      listen_timeout: 10000,           // Așteaptă 10s pentru server start
      
      // ========================================
      // HEALTH CHECK
      // ========================================
      // PM2 va verifica dacă serverul răspunde
      // health_check: {
      //   url: 'http://localhost:3001/health',
      //   interval: 30000,
      //   timeout: 5000
      // },
      
      // ========================================
      // ERROR HANDLING
      // ========================================
      // Acțiuni la erori specifice
      error_action: 'restart',
      
      // ========================================
      // CRON RESTART (Opțional)
      // ========================================
      // Restart preventiv zilnic la 3:00 AM
      // cron_restart: '0 3 * * *',
    }
  ],
  
  // ========================================
  // DEPLOY CONFIGURATION (Opțional)
  // ========================================
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo.git',
      path: '/var/www/restaurant-app',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};

