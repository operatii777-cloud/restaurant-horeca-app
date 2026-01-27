#!/usr/bin/env node

/**
 * Monitorizează actualizările din PLAN-MIGRARE-V4.md pentru fiecare agent.
 * Dacă un agent nu a făcut update în ultimele 5 minute, scriptul:
 *  - notează situația într-o secțiune "IDLE-REPORT" din PLAN,
 *  - auto-asignează 1-3 taskuri din TASKPOOL (secțiunea agentului sau ANY),
 *  - marchează taskurile drept preluate în TASKPOOL.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4.md');
const TASKPOOL_PATH = path.join(ROOT, 'Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4-TASKPOOL.md');

const AGENTS = [
  { key: 'AGENT1', name: 'Agent 1', section: '## 1. Inventariere & Gap Analysis v3' },
  { key: 'AGENT2', name: 'Agent 2', section: '## 2. Implementare Admin V4 (Vite + React + AG Grid)' },
  { key: 'AGENT3', name: 'Agent 3', section: '## 3. Testare & Stabilitate (QA / Playwright)' },
  { key: 'AGENT4', name: 'Agent 4', section: '## 4. Documentație & Backup Manager' },
  { key: 'AGENT5', name: 'Agent 5', section: '## 5. Traceability & Compliance (ANSVSA/ANPC)' },
];

const TASKPOOL_SECTIONS = {
  AGENT1: '## AGENT1',
  AGENT2: '## AGENT2',
  AGENT3: '## AGENT3',
  AGENT4: '## AGENT4',
  AGENT5: '## AGENT5',
  ANY: '## High Priority',
};

const TIMESTAMP_REGEX = /\[(\d{2})-(\w{3})-(\d{4}) \| (\d{2}):(\d{2})\]/;
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function parseTimestamp(match) {
  if (!match) return null;
  const [, day, monStr, year, hour, minute] = match;
  const month = MONTHS[monStr];
  if (month === undefined) return null;
  return new Date(Date.UTC(Number(year), month, Number(day), Number(hour), Number(minute)));
}

function findSectionIndex(lines, sectionTitle) {
  return lines.findIndex((line) => line.trim().startsWith(sectionTitle));
}

function findLatestTimestamp(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const match = lines[i].match(TIMESTAMP_REGEX);
    if (match) {
      return parseTimestamp(match);
    }
    if (lines[i].startsWith('## ')) break; // next section
  }
  return null;
}

function timestampNow() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${pad(now.getUTCDate())}-${months[now.getUTCMonth()]}-${now.getUTCFullYear()} | ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;
}

function minutesDiff(date) {
  const now = new Date();
  return (now.getTime() - date.getTime()) / (1000 * 60);
}

function loadTaskpoolLines() {
  if (!fs.existsSync(TASKPOOL_PATH)) {
    throw new Error('TASKPOOL nu există. Creează-l înainte de a rula monitorizarea.');
  }
  return fs.readFileSync(TASKPOOL_PATH, 'utf8').split(/\r?\n/);
}

function findTaskpoolSectionRange(lines, marker) {
  const start = lines.findIndex((line) => line.trim().startsWith(marker));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ') && i > start + 1) {
      end = i;
      break;
    }
  }
  return { start, end };
}

function takeTasks(taskpoolLines, agentKey, count, timestampLabel) {
  const taken = [];
  const primaryMarker = TASKPOOL_SECTIONS[agentKey];
  const fallbackMarker = TASKPOOL_SECTIONS.ANY;

  function extractTasks(marker) {
    const range = findTaskpoolSectionRange(taskpoolLines, marker);
    if (!range) return;
    for (let i = range.start + 1; i < range.end && taken.length < count; i += 1) {
      const line = taskpoolLines[i];
      if (line.trim().startsWith('- [ ]')) {
        taken.push(line.replace('- [ ]', '').trim());
        taskpoolLines[i] = line.replace('- [ ]', '- [x]') + ` (AUTO-ASSIGNED ${timestampLabel})`;
      }
    }
  }

  extractTasks(primaryMarker);
  if (taken.length < count) {
    extractTasks(fallbackMarker);
  }

  return taken;
}

function insertBlockIntoPlan(lines, sectionTitle, blockLines) {
  const index = findSectionIndex(lines, sectionTitle);
  if (index === -1) {
    throw new Error(`Secțiunea ${sectionTitle} nu a fost găsită în PLAN.`);
  }
  lines.splice(index + 1, 0, '', ...blockLines, '');
}

function appendIdleReport(lines, reportLines) {
  lines.push('', `## IDLE-REPORT [${timestampNow()}]`, '');
  reportLines.forEach((line) => lines.push(`- ${line}`));
  lines.push('');
}

function main() {
  const planContent = fs.readFileSync(PLAN_PATH, 'utf8');
  const planLines = planContent.split(/\r?\n/);
  const taskpoolLines = loadTaskpoolLines();

  const idleAgents = [];
  const timestampLabel = timestampNow();

  AGENTS.forEach((agent) => {
    const sectionIndex = findSectionIndex(planLines, agent.section);
    if (sectionIndex === -1) return;
    const latest = findLatestTimestamp(planLines, sectionIndex);
    if (!latest) {
      idleAgents.push({ agent, reason: 'fără update anterior' });
      return;
    }
    const diffMinutes = minutesDiff(latest);
    if (diffMinutes > 5) {
      idleAgents.push({ agent, diffMinutes });
    }
  });

  const idleReport = [];

  idleAgents.forEach(({ agent, diffMinutes, reason }) => {
    const assignments = takeTasks(taskpoolLines, agent.key, 3, timestampLabel);
    const header = `[${timestampLabel}] — **AUTO-ASSIGNED by Agent 4**`;
    const blockLines = [header];
    if (assignments.length) {
      assignments.forEach((task) => {
        blockLines.push(`- AUTO-ASSIGNED by Agent 4 (${timestampLabel}): ${task}`);
      });
    } else {
      blockLines.push('- AUTO-ASSIGNED by Agent 4: (nu există taskuri disponibile în TASKPOOL)');
    }
    insertBlockIntoPlan(planLines, agent.section, blockLines);

    const status = reason ? reason : `${diffMinutes.toFixed(1)} minute fără update`;
    idleReport.push(`${agent.name}: ${status}. Taskuri asignate: ${assignments.length}`);
  });

  if (idleReport.length) {
    appendIdleReport(planLines, idleReport);
  }

  fs.writeFileSync(PLAN_PATH, planLines.join('\n'), 'utf8');
  fs.writeFileSync(TASKPOOL_PATH, taskpoolLines.join('\n'), 'utf8');

  if (idleReport.length) {
    console.warn('⚠️ Agenți marcați IDLE și taskuri auto-asignate.');
  } else {
    console.log('✅ Toți agenții au actualizat PLAN-ul în intervalul de 5 minute.');
  }
}

main();
