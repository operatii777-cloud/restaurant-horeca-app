/**
 * Impact Analysis Helper
 * 
 * Script helper pentru a genera Impact Analysis automat.
 * Rulează: node src/contracts/impact-analysis-helper.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Caută toate referințele unui endpoint/funcție/tabel în repo
 */
function searchUsages(term) {
  try {
    const result = execSync(`rg "${term}" --type js --type ts --type sql --json`, {
      encoding: 'utf-8',
      cwd: path.join(__dirname, '../../'),
    });
    
    const lines = result.trim().split('\n').filter(Boolean);
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    return [];
  }
}

/**
 * Generează Impact Analysis template cu date pre-populate
 */
function generateImpactAnalysis(options = {}) {
  const {
    endpoint,
    functionName,
    tableColumn,
    description,
  } = options;
  
  const template = fs.readFileSync(
    path.join(__dirname, 'IMPACT_ANALYSIS_TEMPLATE.md'),
    'utf-8'
  );
  
  // Caută usages
  const usages = [];
  if (endpoint) {
    usages.push(...searchUsages(endpoint));
  }
  if (functionName) {
    usages.push(...searchUsages(functionName));
  }
  if (tableColumn) {
    usages.push(...searchUsages(tableColumn));
  }
  
  // Generează raport
  const report = {
    timestamp: new Date().toISOString(),
    endpoint,
    functionName,
    tableColumn,
    description,
    usages: usages.map(u => ({
      file: u.data?.path?.text || u.data?.path,
      line: u.data?.line_number,
      text: u.data?.lines?.text || u.data?.submatches?.[0]?.match?.text,
    })),
  };
  
  // Salvează raport
  const reportPath = path.join(
    __dirname,
    '../../Dev-Files/01-Rapoarte',
    `impact-analysis-${Date.now()}.json`
  );
  
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Impact Analysis generat: ${reportPath}`);
  console.log(`📊 Găsite ${usages.length} referințe`);
  
  return report;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage: node impact-analysis-helper.js [options]

Options:
  --endpoint <path>        Endpoint path (e.g., /api/pos/order/:id)
  --function <name>        Function name (e.g., getOrderForPos)
  --table <table.column>   Table column (e.g., orders.status)
  --description <text>     Description of change

Example:
  node impact-analysis-helper.js --endpoint "/api/pos/order/:id" --description "Add new field to response"
    `);
    process.exit(0);
  }
  
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    if (key === 'endpoint') options.endpoint = value;
    if (key === 'function') options.functionName = value;
    if (key === 'table') options.tableColumn = value;
    if (key === 'description') options.description = value;
  }
  
  generateImpactAnalysis(options);
}

module.exports = {
  searchUsages,
  generateImpactAnalysis,
};

