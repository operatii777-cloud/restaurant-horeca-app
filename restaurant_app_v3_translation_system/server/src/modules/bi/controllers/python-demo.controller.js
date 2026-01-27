/**
 * Python Demo Controller
 * 
 * Demonstrează integrarea Python în aplicația Node.js
 * Endpoint-uri de exemplu pentru testare
 */

const { executePythonScript, checkPythonAvailable, scriptExists } = require('../../../utils/python-executor');
const { logger } = require('../../../utils/logger');
const { asyncHandler } = require('../../../utils/asyncHandler');

/**
 * GET /api/bi/python/health
 * Verifică dacă Python este disponibil
 */
async function checkPythonHealth(req, res) {
  try {
    const isAvailable = await checkPythonAvailable();
    const scriptCheck = scriptExists('example-sentiment.py');

    res.json({
      success: true,
      python_available: isAvailable,
      example_script_exists: scriptCheck,
      platform: process.platform,
      python_cmd: process.platform === 'win32' ? 'python' : 'python3',
      message: isAvailable 
        ? 'Python este disponibil și gata de utilizare' 
        : 'Python nu este disponibil. Instalează Python 3.11+ pentru a folosi funcționalitățile ML/AI.'
    });
  } catch (error) {
    logger.error('Python health check error', { error: error.message });
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

/**
 * POST /api/bi/python/sentiment
 * Analizează sentiment din texte folosind Python
 * 
 * Body: {
 *   "texts": ["Excelent serviciu!", "Mâncarea a fost rece"]
 * }
 */
async function analyzeSentiment(req, res) {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Furnizează un array de texte pentru analiză'
      });
    }

    // Verifică dacă Python este disponibil
    const isAvailable = await checkPythonAvailable();
    if (!isAvailable) {
      return res.status(503).json({
        success: false,
        error: 'Python nu este disponibil. Instalează Python 3.11+ pentru a folosi această funcționalitate.',
        fallback: 'Poți implementa analiza sentiment direct în JavaScript'
      });
    }

    // Verifică dacă scriptul există
    if (!scriptExists('example-sentiment.py')) {
      return res.status(404).json({
        success: false,
        error: 'Script Python nu există. Verifică că example-sentiment.py este în python-scripts/'
      });
    }

    // Execută scriptul Python
    const result = await executePythonScript(
      'example-sentiment.py',
      [],
      { texts },
      { timeout: 10000 }
    );

    logger.info('Sentiment analysis completed', {
      texts_count: texts.length,
      average_sentiment: result.average_sentiment
    });

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    logger.error('Sentiment analysis error', { 
      error: error.message,
      stack: error.stack 
    });

    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * GET /api/bi/python/example
 * Exemplu de utilizare Python
 * Returnează documentație și exemple
 */
async function getPythonExample(req, res) {
  res.json({
    success: true,
    message: 'Exemplu de integrare Python în Restaurant App',
    endpoints: {
      health: 'GET /api/bi/python/health - Verifică disponibilitatea Python',
      sentiment: 'POST /api/bi/python/sentiment - Analizează sentiment din texte'
    },
    example_request: {
      method: 'POST',
      url: '/api/bi/python/sentiment',
      body: {
        texts: [
          'Excelent serviciu! Mâncarea a fost delicioasă.',
          'Mâncarea a fost rece și serviciul lent.',
          'Totul a fost ok, nimic special.'
        ]
      }
    },
    example_response: {
      success: true,
      results: [
        {
          text: 'Excelent serviciu! Mâncarea a fost delicioasă.',
          sentiment: 'positive',
          score: 0.7
        },
        {
          text: 'Mâncarea a fost rece și serviciul lent.',
          sentiment: 'negative',
          score: -0.6
        },
        {
          text: 'Totul a fost ok, nimic special.',
          sentiment: 'neutral',
          score: 0.0
        }
      ],
      average_sentiment: 0.03,
      total_texts: 3,
      positive_count: 1,
      negative_count: 1,
      neutral_count: 1
    },
    documentation: {
      file: 'Dev-Files/06-Documentatie-Dev/INTEGRARE-PYTHON.md',
      description: 'Documentație completă despre integrarea Python'
    }
  });
}

module.exports = {
  checkPythonHealth: asyncHandler(checkPythonHealth),
  analyzeSentiment: asyncHandler(analyzeSentiment),
  getPythonExample: asyncHandler(getPythonExample)
};

