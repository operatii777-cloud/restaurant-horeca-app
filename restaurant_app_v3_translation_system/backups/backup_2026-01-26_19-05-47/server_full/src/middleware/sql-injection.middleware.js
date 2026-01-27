/**
 * SQL Injection Protection Middleware
 * 
 * Provides input sanitization and validation to prevent SQL injection attacks.
 * 
 * Usage:
 * - Apply to all routes: app.use(sqlInjectionProtection())
 * - Apply to specific routes: router.get('/search', sqlInjectionProtection(), handler)
 */

// Dangerous SQL patterns that could indicate injection attempts
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/gi,                    // Single quotes, comments
  /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/gi, // Equals followed by quotes
  /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/gi, // OR patterns
  /((\%27)|(\'))union/gi,                                // UNION attacks
  /exec(\s|\+)+(s|x)p\w+/gi,                            // Exec stored procedures
  /UNION(\s+)ALL(\s+)SELECT/gi,                          // UNION ALL SELECT
  /SELECT(\s+).+(\s+)FROM/gi,                           // SELECT FROM (in user input)
  /INSERT(\s+)INTO/gi,                                   // INSERT INTO
  /DELETE(\s+)FROM/gi,                                   // DELETE FROM
  /DROP(\s+)TABLE/gi,                                    // DROP TABLE
  /UPDATE(\s+).+(\s+)SET/gi,                            // UPDATE SET
  /;\s*DROP/gi,                                          // Chained DROP
  /;\s*DELETE/gi,                                        // Chained DELETE
  /;\s*INSERT/gi,                                        // Chained INSERT
  /;\s*UPDATE/gi,                                        // Chained UPDATE
  /1\s*=\s*1/gi,                                         // 1=1 tautology
  /1\s*OR\s*1/gi,                                        // 1 OR 1
  /'\s*OR\s*'/gi,                                        // ' OR '
  /"\s*OR\s*"/gi,                                        // " OR "
];

// Characters that should be escaped in SQL strings
const DANGEROUS_CHARS = /['";\\]/g;

/**
 * Check if a string contains potential SQL injection patterns
 * @param {string} value - The value to check
 * @returns {boolean} - True if injection detected
 */
function containsSqlInjection(value) {
  if (typeof value !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Sanitize a string by escaping dangerous characters
 * @param {string} value - The value to sanitize
 * @returns {string} - Sanitized value
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  
  // Escape single quotes by doubling them (SQL standard)
  return value.replace(/'/g, "''");
}

/**
 * Deep sanitize an object (for req.body, req.query, req.params)
 * @param {object} obj - The object to sanitize
 * @returns {object} - Sanitized object
 */
function deepSanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = deepSanitize(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Validate that a value is a safe integer
 * @param {any} value - The value to check
 * @param {object} options - Validation options
 * @returns {number|null} - The parsed integer or null if invalid
 */
function validateInteger(value, options = {}) {
  const { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = options;
  
  const num = parseInt(value, 10);
  if (isNaN(num) || num < min || num > max) {
    return null;
  }
  return num;
}

/**
 * Validate that a value matches a whitelist
 * @param {any} value - The value to check
 * @param {array} allowedValues - List of allowed values
 * @returns {any|null} - The value if valid, null otherwise
 */
function validateWhitelist(value, allowedValues) {
  if (allowedValues.includes(value)) {
    return value;
  }
  return null;
}

/**
 * SQL Injection Protection Middleware
 * @param {object} options - Configuration options
 * @returns {function} Express middleware
 */
function sqlInjectionProtection(options = {}) {
  const {
    logAttempts = true,
    blockOnDetection = true,
    sanitizeInputs = true,
  } = options;

  return (req, res, next) => {
    // Check all input sources for SQL injection patterns
    const inputSources = [
      { name: 'query', data: req.query },
      { name: 'params', data: req.params },
      { name: 'body', data: req.body },
    ];

    for (const source of inputSources) {
      if (!source.data) continue;

      const checkValues = (obj, path = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string' && containsSqlInjection(value)) {
            if (logAttempts) {
              console.warn(`[SQL INJECTION] Attempt detected in ${source.name}.${currentPath}:`, {
                value: value.substring(0, 100),
                ip: req.ip,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString(),
              });
            }

            if (blockOnDetection) {
              return res.status(400).json({
                success: false,
                error: 'Invalid input detected',
                code: 'INVALID_INPUT',
              });
            }
          }

          if (typeof value === 'object' && value !== null) {
            const result = checkValues(value, currentPath);
            if (result) return result; // Response was sent
          }
        }
      };

      const blocked = checkValues(source.data);
      if (blocked) return; // Response already sent
    }

    // Optionally sanitize all inputs
    if (sanitizeInputs) {
      if (req.query) req.query = deepSanitize(req.query);
      if (req.params) req.params = deepSanitize(req.params);
      // Note: We don't sanitize body by default as it might break JSON data
    }

    next();
  };
}

/**
 * Create parameterized query helper
 * Ensures all values are properly parameterized
 */
function createParameterizedQuery(template, params) {
  // Count placeholders in template
  const placeholderCount = (template.match(/\?/g) || []).length;
  
  if (placeholderCount !== params.length) {
    throw new Error(`Query has ${placeholderCount} placeholders but ${params.length} parameters were provided`);
  }
  
  return { sql: template, params };
}

/**
 * Safe IN clause builder
 * Creates a parameterized IN clause from an array
 * @param {array} values - Array of values
 * @returns {object} - { placeholders: '?,?,?', params: [...values] }
 */
function buildInClause(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return { placeholders: '?', params: [null] };
  }
  
  const placeholders = values.map(() => '?').join(',');
  return { placeholders, params: values };
}

/**
 * Safe WHERE clause builder
 * Creates a parameterized WHERE clause from conditions
 * @param {object} conditions - { column: value, ... }
 * @returns {object} - { clause: 'WHERE col1 = ? AND col2 = ?', params: [...] }
 */
function buildWhereClause(conditions) {
  if (!conditions || Object.keys(conditions).length === 0) {
    return { clause: '', params: [] };
  }
  
  const parts = [];
  const params = [];
  
  for (const [column, value] of Object.entries(conditions)) {
    // Validate column name (only allow alphanumeric and underscore)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
      throw new Error(`Invalid column name: ${column}`);
    }
    
    if (value === null) {
      parts.push(`${column} IS NULL`);
    } else if (Array.isArray(value)) {
      const { placeholders, params: inParams } = buildInClause(value);
      parts.push(`${column} IN (${placeholders})`);
      params.push(...inParams);
    } else {
      parts.push(`${column} = ?`);
      params.push(value);
    }
  }
  
  return {
    clause: parts.length > 0 ? `WHERE ${parts.join(' AND ')}` : '',
    params,
  };
}

module.exports = {
  sqlInjectionProtection,
  containsSqlInjection,
  sanitizeString,
  deepSanitize,
  validateInteger,
  validateWhitelist,
  createParameterizedQuery,
  buildInClause,
  buildWhereClause,
  SQL_INJECTION_PATTERNS,
};

