/**
 * PROFESSIONAL LOGGING SYSTEM
 * Înlocuiește console.log cu sistem de logging profesional
 * Suportă nivele, formate, și filtrare
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
};

// Configurare din environment
const LOG_LEVEL = process.env.LOG_LEVEL 
  ? LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO
  : (process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.INFO);

const COLORS = {
  ERROR: '\x1b[31m',   // Red
  WARN: '\x1b[33m',    // Yellow
  INFO: '\x1b[36m',     // Cyan
  DEBUG: '\x1b[90m',   // Gray
  RESET: '\x1b[0m',
};

/**
 * Format timestamp
 */
function formatTimestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 23);
}

/**
 * Format log message
 */
function formatMessage(level, category, message, data = null) {
  const timestamp = formatTimestamp();
  const levelName = LOG_LEVEL_NAMES[level];
  const color = COLORS[levelName] || '';
  const reset = COLORS.RESET;
  
  let output = `${color}[${timestamp}] [${levelName}]${reset}`;
  
  if (category) {
    output += ` [${category}]`;
  }
  
  output += ` ${message}`;
  
  if (data && Object.keys(data).length > 0) {
    output += `\n${JSON.stringify(data, null, 2)}`;
  }
  
  return output;
}

/**
 * Logger class
 */
class Logger {
  constructor(category = 'APP') {
    this.category = category;
  }

  error(message, data = null) {
    if (LOG_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(formatMessage(LOG_LEVELS.ERROR, this.category, message, data));
    }
  }

  warn(message, data = null) {
    if (LOG_LEVEL >= LOG_LEVELS.WARN) {
      console.warn(formatMessage(LOG_LEVELS.WARN, this.category, message, data));
    }
  }

  info(message, data = null) {
    if (LOG_LEVEL >= LOG_LEVELS.INFO) {
      console.log(formatMessage(LOG_LEVELS.INFO, this.category, message, data));
    }
  }

  debug(message, data = null) {
    if (LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.log(formatMessage(LOG_LEVELS.DEBUG, this.category, message, data));
    }
  }

  /**
   * Create child logger with sub-category
   */
  child(subCategory) {
    return new Logger(`${this.category}:${subCategory}`);
  }
}

// Export default logger
const logger = new Logger('APP');

// Export Logger class for custom loggers
module.exports = {
  logger,
  Logger,
  LOG_LEVELS,
};
