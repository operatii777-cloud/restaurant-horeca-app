/**
 * PHASE E9.7 - Compression Loader
 * 
 * Configures response compression.
 */

const compression = require('compression');

function loadCompression(app) {
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6 // Balanced compression level
  }));
  
  console.log('⚡ Response compression activated');
}

module.exports = { loadCompression };

