#!/usr/bin/env node

/**
 * Găsește try fără catch în server.js
 */

const fs = require('fs');

const content = fs.readFileSync('./server.js', 'utf8');
const lines = content.split('\n');

let tryStack = [];
let errors = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const lineNum = i + 1;
  
  // Detectează try {
  if (line.match(/^\s*try\s*\{/) || line.match(/\}\s*try\s*\{/)) {
    tryStack.push(lineNum);
  }
  
  // Detectează } catch
  if (line.match(/\}\s*catch\s*\(/)) {
    if (tryStack.length > 0) {
      tryStack.pop();
    } else {
      errors.push(`Line ${lineNum}: catch without try`);
    }
  }
}

console.log('\n🔍 TRY-CATCH ANALYSIS:\n');

if (tryStack.length > 0) {
  console.log('❌ UNCLOSED TRY BLOCKS:');
  tryStack.forEach(lineNum => {
    console.log(`   Line ${lineNum}: try { without matching } catch`);
    console.log(`   ${lines[lineNum - 1]}`);
  });
} else {
  console.log('✅ All try blocks have matching catch');
}

if (errors.length > 0) {
  console.log('\n❌ ORPHAN CATCH BLOCKS:');
  errors.forEach(err => console.log(`   ${err}`));
}

console.log('\n');

