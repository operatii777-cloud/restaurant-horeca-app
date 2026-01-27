/**
 * Pagination Middleware
 * 
 * Provides standardized pagination for large result sets.
 * Supports:
 * - Page-based pagination (?page=1&limit=50)
 * - Cursor-based pagination (?cursor=xxx&limit=50)
 * - Offset-based pagination (?offset=0&limit=50)
 */

/**
 * Default pagination settings
 */
const PAGINATION_DEFAULTS = {
  defaultLimit: 50,
  maxLimit: 500,
  defaultPage: 1
};

/**
 * Parse pagination parameters from request query
 * @param {Object} query - Request query object
 * @returns {Object} Parsed pagination params
 */
function parsePagination(query) {
  const limit = Math.min(
    Math.max(1, parseInt(query.limit) || PAGINATION_DEFAULTS.defaultLimit),
    PAGINATION_DEFAULTS.maxLimit
  );
  
  const page = Math.max(1, parseInt(query.page) || PAGINATION_DEFAULTS.defaultPage);
  const offset = parseInt(query.offset) || (page - 1) * limit;
  
  return {
    limit,
    page,
    offset,
    cursor: query.cursor || null
  };
}

/**
 * Build pagination response metadata
 * @param {Object} params - Pagination parameters
 * @param {Number} totalCount - Total number of records
 * @returns {Object} Pagination metadata
 */
function buildPaginationMeta(params, totalCount) {
  const { limit, page, offset } = params;
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    page,
    limit,
    offset,
    total: totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
}

/**
 * Pagination middleware
 * Adds req.pagination object with parsed parameters
 */
function paginationMiddleware(req, res, next) {
  req.pagination = parsePagination(req.query);
  
  // Add helper to build response
  req.paginatedResponse = (data, totalCount) => {
    return {
      success: true,
      data,
      pagination: buildPaginationMeta(req.pagination, totalCount)
    };
  };
  
  next();
}

/**
 * SQL helper for pagination
 * @param {Object} pagination - Pagination params from request
 * @returns {String} SQL LIMIT OFFSET clause
 */
function paginationSQL(pagination) {
  return `LIMIT ${pagination.limit} OFFSET ${pagination.offset}`;
}

/**
 * Apply pagination to existing endpoint
 * Wrapper that adds pagination to any data-returning endpoint
 */
function withPagination(handler) {
  return async (req, res, next) => {
    // Parse pagination
    req.pagination = parsePagination(req.query);
    
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json to add pagination if data is array
    res.json = function(data) {
      if (data && data.success && Array.isArray(data.data)) {
        // Already paginated in handler, just return
        return originalJson(data);
      }
      return originalJson(data);
    };
    
    // Call original handler
    return handler(req, res, next);
  };
}

/**
 * Paginate an array (for in-memory pagination)
 * @param {Array} array - Full array to paginate
 * @param {Object} pagination - Pagination params
 * @returns {Object} Paginated result with metadata
 */
function paginateArray(array, pagination) {
  const { limit, offset } = pagination;
  const totalCount = array.length;
  const paginatedData = array.slice(offset, offset + limit);
  
  return {
    data: paginatedData,
    pagination: buildPaginationMeta(pagination, totalCount)
  };
}

/**
 * Create paginated query wrapper for database queries
 * @param {Function} queryFn - Async function that takes (limit, offset) and returns rows
 * @param {Function} countFn - Async function that returns total count
 * @returns {Function} Paginated query handler
 */
function createPaginatedQuery(queryFn, countFn) {
  return async (req, res, next) => {
    try {
      const pagination = parsePagination(req.query);
      
      // Execute count and data queries in parallel
      const [totalCount, data] = await Promise.all([
        countFn(req),
        queryFn(req, pagination.limit, pagination.offset)
      ]);
      
      res.json({
        success: true,
        data,
        pagination: buildPaginationMeta(pagination, totalCount)
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  paginationMiddleware,
  parsePagination,
  buildPaginationMeta,
  paginationSQL,
  withPagination,
  paginateArray,
  createPaginatedQuery,
  PAGINATION_DEFAULTS
};

