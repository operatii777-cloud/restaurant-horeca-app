#!/usr/bin/env node

/**
 * Raport sumar pentru secțiunile agenților din PLAN-MIGRARE-V4.md.
 * Extrage ultimele intrări din fiecare secțiune și le afișează în terminal.
 */

const fs = require('fs');
const path = require('path');

const PLAN_PATH = path.join(__dirname, '..', 'Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4.md');

const AGENT_SECTIONS = [
  { label: 'Agent 1 – Inventariere & Gap Analysis', titles: ['## 1. Inventariere & Gap Analysis v3'] },
  { label: 'Agent 2 – Implementare Admin V4', titles: ['## 2. Implementare Admin V4 (Vite + React + AG Grid)'] },
  { label: 'Agent 3 – Testare & Stabilitate', titles: ['## 3. Testare & Stabilitate (QA / Playwright)'] },
  { label: 'Agent 4 – Documentație & Compliance', titles: ['## 4. Documentație & Compliance', '## 4. Documentație & Backup Manager'] },
  { label: 'Agent 5 – Traceability & Compliance', titles: ['## 5. Traceability & Compliance (ANSVSA/ANPC)'] },
];

function readPlan() {
  if (!fs.existsSync(PLAN_PATH)) {
    throw new Error(`Nu am găsit ${PLAN_PATH}`);
  }
  return fs.readFileSync(PLAN_PATH, 'utf8');
}

function findSectionBounds(content) {
  const headingRegex = /^## .+$/gm;
  const matches = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    matches.push({ title: match[0], index: match.index });
  }
  return matches;
}

function extractSection(content, headings, titles) {
  for (const title of titles) {
    const heading = headings.find((entry) => entry.title.trim() === title.trim());
    if (!heading) {
      continue;
    }
    const currentIndex = headings.indexOf(heading);
    const start = heading.index + heading.title.length;
    const end =
      currentIndex + 1 < headings.length ? headings[currentIndex + 1].index : content.length;
    return content.slice(start, end);
  }
  return null;
}

function formatSummary(block) {
  if (!block) {
    return ['(nu există secțiunea în PLAN)'];
  }
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('##') && line !== '---' && line !== '- ---');

  if (!lines.length) {
    return ['(fără actualizări în această secțiune)'];
  }

  const recent = lines.slice(-5);
  return recent;
}

function printReport() {
  const content = readPlan();
  const headings = findSectionBounds(content);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  console.log(`\n[Raport agenți | ${timestamp}]`);
  AGENT_SECTIONS.forEach((section) => {
    const block = extractSection(content, headings, section.titles);
    const summary = formatSummary(block);
    console.log(`\n${section.label}:`);
    summary.forEach((line) => {
      console.log(`  - ${line}`);
    });
  });
  console.log('');
}

try {
  printReport();
} catch (error) {
  console.error('[report:agents] Eroare:', error.message);
  process.exitCode = 1;
}

