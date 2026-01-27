/**
 * Python Executor Utility
 * 
 * Execută scripturi Python din Node.js și returnează rezultate JSON
 * 
 * Usage:
 *   const { executePythonScript } = require('./utils/python-executor');
 *   const result = await executePythonScript('sales-forecast.py', ['--days', '7'], { data: [...] });
 */

const { spawn } = require('child_process');
const path = require('path');
const { logger } = require('./logger');

/**
 * Execută un script Python și returnează rezultatul
 * 
 * @param {string} scriptName - Numele scriptului (ex: 'sales-forecast.py')
 * @param {Array<string>} args - Argumente CLI pentru script
 * @param {Object} inputData - Date JSON pentru stdin (opțional)
 * @param {Object} options - Opțiuni suplimentare
 * @param {number} options.timeout - Timeout în milisecunde (default: 30000)
 * @param {string} options.pythonCmd - Comanda Python (default: 'python3' sau 'python')
 * @returns {Promise<Object>} Rezultatul scriptului (JSON)
 */
async function executePythonScript(scriptName, args = [], inputData = null, options = {}) {
  const {
    timeout = 30000,
    pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
  } = options;

  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../python-scripts', scriptName);
    
    // Verifică dacă scriptul există
    const fs = require('fs');
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Script Python nu există: ${scriptPath}`));
    }

    const pythonProcess = spawn(pythonCmd, [scriptPath, ...args], {
      cwd: path.join(__dirname, '../../'),
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1' // Disable buffering pentru output imediat
      }
    });

    let stdout = '';
    let stderr = '';
    let timeoutId = null;

    // Timeout handler
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        pythonProcess.kill('SIGTERM');
        reject(new Error(`Timeout: Script Python a depășit ${timeout}ms`));
      }, timeout);
    }

    // Capture stdout
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Capture stderr
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (code !== 0) {
        const error = new Error(`Python script failed with code ${code}: ${stderr || 'Unknown error'}`);
        error.code = code;
        error.stderr = stderr;
        logger.error('Python script execution failed', {
          script: scriptName,
          code,
          stderr,
          args
        });
        return reject(error);
      }

      // Parse JSON output
      try {
        // Încearcă să parseze JSON din stdout
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          logger.debug('Python script executed successfully', {
            script: scriptName,
            resultSize: JSON.stringify(result).length
          });
          resolve(result);
        } else {
          // Dacă nu e JSON, returnează output-ul raw
          resolve({ output: stdout.trim() });
        }
      } catch (parseError) {
        // Dacă nu e JSON valid, returnează output-ul raw
        logger.warn('Python script output is not JSON', {
          script: scriptName,
          output: stdout.substring(0, 200)
        });
        resolve({ output: stdout.trim(), raw: true });
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      logger.error('Python process spawn failed', {
        script: scriptName,
        error: error.message,
        pythonCmd
      });
      reject(new Error(`Nu s-a putut executa Python: ${error.message}. Verifică dacă Python este instalat.`));
    });

    // Trimite date JSON dacă sunt furnizate
    if (inputData) {
      try {
        const jsonInput = JSON.stringify(inputData);
        pythonProcess.stdin.write(jsonInput);
        pythonProcess.stdin.end();
      } catch (error) {
        pythonProcess.kill('SIGTERM');
        reject(new Error(`Eroare la serializarea datelor: ${error.message}`));
      }
    } else {
      pythonProcess.stdin.end();
    }
  });
}

/**
 * Verifică dacă Python este disponibil în sistem
 * 
 * @param {string} pythonCmd - Comanda Python (default: 'python3' sau 'python')
 * @returns {Promise<boolean>} True dacă Python este disponibil
 */
async function checkPythonAvailable(pythonCmd = null) {
  const cmd = pythonCmd || (process.platform === 'win32' ? 'python' : 'python3');
  
  return new Promise((resolve) => {
    const pythonProcess = spawn(cmd, ['--version'], {
      stdio: 'pipe'
    });

    pythonProcess.on('close', (code) => {
      resolve(code === 0);
    });

    pythonProcess.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Verifică dacă un script Python există
 * 
 * @param {string} scriptName - Numele scriptului
 * @returns {boolean} True dacă scriptul există
 */
function scriptExists(scriptName) {
  const fs = require('fs');
  const scriptPath = path.join(__dirname, '../../python-scripts', scriptName);
  return fs.existsSync(scriptPath);
}

module.exports = {
  executePythonScript,
  checkPythonAvailable,
  scriptExists
};

