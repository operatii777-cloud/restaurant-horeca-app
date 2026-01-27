/**
 * Logger Module
 * Alternative profesională la console.log pentru producție
 */

class Logger {
    constructor(config = {}) {
        this.enabled = config.enabled !== undefined ? config.enabled : true;
        this.level = config.level || 'info'; // debug, info, warn, error
        this.prefix = config.prefix || '';
        this.timestamp = config.timestamp !== undefined ? config.timestamp : true;
        this.storage = config.storage || false; // salvează în localStorage
        this.maxLogs = config.maxLogs || 1000;
        
        this.levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        this.logs = [];
    }
    
    _shouldLog(level) {
        if (!this.enabled) return false;
        return this.levels[level] >= this.levels[this.level];
    }
    
    _formatMessage(level, message, ...args) {
        const parts = [];
        
        if (this.timestamp) {
            parts.push(new Date().toISOString());
        }
        
        if (this.prefix) {
            parts.push(`[${this.prefix}]`);
        }
        
        parts.push(`[${level.toUpperCase()}]`);
        parts.push(message);
        
        return { formatted: parts.join(' '), args };
    }
    
    _saveLog(level, message, args) {
        if (this.storage) {
            const log = {
                timestamp: Date.now(),
                level,
                message,
                args: args.map(arg => {
                    try {
                        return JSON.stringify(arg);
                    } catch {
                        return String(arg);
                    }
                })
            };
            
            this.logs.push(log);
            
            // Limitează numărul de log-uri
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs);
            }
            
            // Salvează în localStorage
            try {
                localStorage.setItem('app_logs', JSON.stringify(this.logs));
            } catch (e) {
                console.error('Failed to save logs:', e);
            }
        }
    }
    
    debug(message, ...args) {
        if (this._shouldLog('debug')) {
            const { formatted, args: formatArgs } = this._formatMessage('debug', message, ...args);
            console.debug(formatted, ...formatArgs);
            this._saveLog('debug', message, args);
        }
    }
    
    info(message, ...args) {
        if (this._shouldLog('info')) {
            const { formatted, args: formatArgs } = this._formatMessage('info', message, ...args);
            console.info(formatted, ...formatArgs);
            this._saveLog('info', message, args);
        }
    }
    
    warn(message, ...args) {
        if (this._shouldLog('warn')) {
            const { formatted, args: formatArgs } = this._formatMessage('warn', message, ...args);
            console.warn(formatted, ...formatArgs);
            this._saveLog('warn', message, args);
        }
    }
    
    error(message, ...args) {
        if (this._shouldLog('error')) {
            const { formatted, args: formatArgs } = this._formatMessage('error', message, ...args);
            console.error(formatted, ...formatArgs);
            this._saveLog('error', message, args);
        }
    }
    
    // Metodă pentru exportul log-urilor
    export() {
        return this.logs;
    }
    
    // Metodă pentru ștergerea log-urilor
    clear() {
        this.logs = [];
        if (this.storage) {
            localStorage.removeItem('app_logs');
        }
    }
    
    // Metodă pentru descărcarea log-urilor
    download() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logs_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Instanță globală
let logger;

// Inițializează logger-ul când config-ul este disponibil
if (typeof DEBUG_CONFIG !== 'undefined') {
    logger = new Logger({
        enabled: true,
        level: DEBUG_CONFIG.debug ? 'debug' : 'info',
        prefix: BRAND_CONFIG ? BRAND_CONFIG.shortName : 'APP',
        timestamp: DEBUG_CONFIG.verboseLogging,
        storage: DEBUG_CONFIG.environment === 'development'
    });
} else {
    // Fallback la config implicit
    logger = new Logger({
        enabled: true,
        level: 'info',
        prefix: 'APP',
        timestamp: true,
        storage: false
    });
}

// Export pentru utilizare
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}
