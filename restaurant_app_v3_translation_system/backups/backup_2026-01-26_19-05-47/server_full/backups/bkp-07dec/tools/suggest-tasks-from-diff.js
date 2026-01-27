#!/usr/bin/env node

/**
 * Citește rezultatul diff-ului admin (admins-diff.json) și adaugă taskuri sugerate
 * în PLAN-MIGRARE-V4.md precum și în PLAN-MIGRARE-V4-TASKPOOL.md.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIFF_PATH = path.join(ROOT, 'docs/admin-v4/diffs/admins-diff.json');
const PLAN_PATH = path.join(ROOT, 'Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4.md');
const TASKPOOL_PATH = path.join(ROOT, 'Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4-TASKPOOL.md');

const AGENT_SECTIONS = {
  AGENT1: ['## 1. Inventariere & Gap Analysis v3'],
  AGENT2: ['## 2. Implementare Admin V4 (Vite + React + AG Grid)'],
  AGENT3: ['## 3. Testare & Stabilitate (QA / Playwright)'],
  AGENT4: ['## 4. Documentație & Compliance', '## 4. Documentație & Backup Manager'],
  AGENT5: ['## 5. Traceability & Compliance (ANSVSA/ANPC)'],
};

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Nu găsesc fișierul ${filePath}. Rulează mai întâi diff-ul.`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function insertIntoSection(content, sectionTitles, block) {
  const lines = content.split(/\r?\n/);
  const titles = Array.isArray(sectionTitles) ? sectionTitles : [sectionTitles];
  let index = -1;
  let matchedTitle = null;
  for (const title of titles) {
    index = lines.findIndex((line) => line.trim().startsWith(title));
    if (index !== -1) {
      matchedTitle = title;
      break;
    }
  }
  if (index === -1) {
    throw new Error(`Secțiunea ${titles.join(' / ')} nu a fost găsită în PLAN.`);
  }
  lines.splice(index + 1, 0, '', block, '');
  return lines.join('\n');
}

function appendToTaskpool(block) {
  let content = '';
  if (fs.existsSync(TASKPOOL_PATH)) {
    content = fs.readFileSync(TASKPOOL_PATH, 'utf8');
  }
  content += `\n\n${block}\n`;
  fs.writeFileSync(TASKPOOL_PATH, content, 'utf8');
}

function createTaskpoolBlock(timestamp, tasksByAgent) {
  const lines = [`## Diff Sentinel Suggestions ${timestamp}`];
  Object.entries(tasksByAgent).forEach(([agent, tasks]) => {
    if (!tasks.length) return;
    lines.push(`### ${agent}`);
    tasks.forEach((task) => {
      lines.push(`- [ ] ${task}`);
    });
  });
  return lines.join('\n');
}

function buildTasks(diff) {
  const tasks = {
    AGENT1: [],
    AGENT2: [],
    AGENT3: [],
    AGENT4: [],
    AGENT5: [],
  };

  Object.entries(diff.mappings).forEach(([endpoint, files]) => {
    if (!files.length) {
      tasks.AGENT2.push(
        `AUTO-ASSIGNED by Agent 4: Portare endpoint ${endpoint} în Admin V4 (creează API hook + UI).`
      );
      tasks.AGENT3.push(
        `AUTO-ASSIGNED by Agent 4: Test Playwright pentru endpoint ${endpoint} (verifică flux complet).`
      );
    }
  });

  Object.entries(diff.v3Analysis).forEach(([key, analysis]) => {
    const missingSections = analysis.sections.filter((section) => {
      const sectionKey = section.replace(/Section$/i, '').toLowerCase();
      const candidateRoute = diff.v4.routes.find((route) => route.replace(/^\//, '') === sectionKey);
      return !candidateRoute;
    });
    if (missingSections.length) {
      tasks.AGENT1.push(
        `AUTO-ASSIGNED by Agent 4: Documentează secțiunile fără echivalent V4 în ${key}: ${missingSections.join(', ')}.`
      );
      tasks.AGENT2.push(
        `AUTO-ASSIGNED by Agent 4: Creează rute/ module V4 pentru secțiunile lipsă din ${key}: ${missingSections.join(', ')}.`
      );
    }

    const missingModals = analysis.modals.filter((modal) => {
      const name = modal.replace(/Modal$/i, '').toLowerCase();
      return !diff.v4.routes.some((route) => route.includes(name));
    });
    if (missingModals.length) {
      tasks.AGENT4.push(
        `AUTO-ASSIGNED by Agent 4: Actualizează documentația pentru modalele ${missingModals.join(', ')} (v3).`
      );
      tasks.AGENT2.push(
        `AUTO-ASSIGNED by Agent 4: Portare modale lipsă din ${key}: ${missingModals.join(', ')}.`
      );
    }

    const complianceEndpoints = analysis.endpoints.filter((endpoint) =>
      /haccp|trace|allergen|supplier/i.test(endpoint)
    );
    complianceEndpoints.forEach((endpoint) => {
      if (!(diff.mappings[endpoint] && diff.mappings[endpoint].length)) {
        tasks.AGENT5.push(
          `AUTO-ASSIGNED by Agent 4 #legal-critical: Verifică conformitatea pentru endpoint ${endpoint} (nu există în V4).`
        );
      }
    });
  });

  // Documentație: dacă există noi rute V4 fără corespondență în PLAN
  const documentedRoutes = new Set();
  Object.values(diff.v3Analysis).forEach((analysis) => {
    analysis.sections.forEach((section) => documentedRoutes.add(section.replace(/Section$/i, '').toLowerCase()));
  });
  diff.v4.routes.forEach((route) => {
    const normalized = route.replace(/^\//, '').toLowerCase();
    if (!documentedRoutes.has(normalized)) {
      tasks.AGENT4.push(
        `AUTO-ASSIGNED by Agent 4: Adaugă documentație pentru ruta nouă V4 \'${route}\' (manual + ghid utilizator).`
      );
    }
  });

  return tasks;
}

function appendTasksToPlan(tasks, timestamp) {
  let content = fs.readFileSync(PLAN_PATH, 'utf8');
  Object.entries(tasks).forEach(([agentKey, agentTasks]) => {
    if (!agentTasks.length) return;
    const sectionTitle = AGENT_SECTIONS[agentKey];
    const blockLines = [
      `[${timestamp}] — **Taskuri generate automat (Agent 4)**`,
      ...agentTasks.map((task) => `- ${task}`),
    ];
    content = insertIntoSection(content, sectionTitle, blockLines.join('\n'));
  });
  fs.writeFileSync(PLAN_PATH, content, 'utf8');
}

function main() {
  const diff = readJson(DIFF_PATH);
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const tasks = buildTasks(diff);
  appendTasksToPlan(tasks, timestamp);
  const taskpoolBlock = createTaskpoolBlock(timestamp, tasks);
  appendToTaskpool(taskpoolBlock);
  console.log('[suggest-tasks-from-diff] Taskurile au fost adăugate în PLAN și TASKPOOL.');
}

main();
