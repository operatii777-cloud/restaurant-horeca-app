#!/usr/bin/env node

/**
 * Generează fișierul TypeScript `src/adminv4/pages/AdminV4ControlsMap.ts`
 * pe baza datelor din `docs/admin-v4/diffs/admin-controls.json`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'docs/admin-v4/diffs/admin-controls.json');
const OUTPUT = path.join(ROOT, 'admin-vite/src/adminv4/pages/AdminV4ControlsMap.ts');

function readControls() {
  if (!fs.existsSync(INPUT)) {
    throw new Error('admin-controls.json nu există. Rulează `npm run scan:controls` mai întâi.');
  }
  return JSON.parse(fs.readFileSync(INPUT, 'utf8'));
}

function sanitize(text) {
  if (!text) return '';
  return text.replace(/`/g, "'" ).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildTsFile(diff) {
  const header = `// AUTOGENERAT de tools/generate-adminv4-controls-map.js - NU MODIFICA MANUAL

export type ControlStatus = 'migrated' | 'missing';

export interface ControlMapping {
  id: string;
  label: string;
  sourceFile: string;
  endpoints: string[];
  status: ControlStatus;
  matches: string[];
  targetModules: string[];
}

export const ADMIN_V4_CONTROLS_MAP: ControlMapping[] = [
`;

  const footer = `];

export function getControlStatusSummary() {
  const totals = { total: ADMIN_V4_CONTROLS_MAP.length, migrated: 0, missing: 0 };
  ADMIN_V4_CONTROLS_MAP.forEach((item) => {
    if (item.status === 'migrated') totals.migrated += 1;
    else totals.missing += 1;
  });
  return totals;
}
`;

  const body = diff.controls
    .map((control) => {
      const label = sanitize(control.control.text || control.control.id || control.control.name || `(${control.control.tag})`);
      const endpoints = control.endpoints.map((ep) => `'${ep}'`).join(', ');
      const matches = control.matches.map((m) => `'${m.replace(/\\/g, '/')}'`).join(', ');
      const modules = control.targetModules.map((m) => `'${m}'`).join(', ');
      const status = control.existsInV4 ? 'migrated' : 'missing';
      return `  {
    id: '${control.control.key || `${control.fileId}-${label}`}',
    label: '${label}',
    sourceFile: '${control.fileLabel}',
    endpoints: [${endpoints}],
    status: '${status}',
    matches: [${matches}],
    targetModules: [${modules}],
  },`;
    })
    .join('\n');

  return `${header}${body}\n${footer}`;
}

function main() {
  const diff = readControls();
  const tsContent = buildTsFile(diff);
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, tsContent, 'utf8');
  console.log(`[adminv4-controls-map] Scris: ${path.relative(ROOT, OUTPUT)}`);
}

main();
