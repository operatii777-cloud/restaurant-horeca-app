#!/usr/bin/env node

/**
 * Calculează gradul de acoperire al controalelor Admin v3 în Admin V4.
 * Citește `docs/admin-v4/diffs/admin-controls.json` și scrie rezultatul în
 * `Dev-Files/06-Documentatie-Dev/ADMIN-V4-COVERAGE-MATRIX.md`.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'docs/admin-v4/diffs/admin-controls.json');
const OUTPUT_PATH = path.join(ROOT, 'Dev-Files/06-Documentatie-Dev/ADMIN-V4-COVERAGE-MATRIX.md');

function readDiff() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error('Nu există admins-diff.json. Rulează mai întâi `npm run scan:controls`.');
  }
  return JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
}

function determineStatus(item) {
  if (!item.existsInV4) {
    return 'missing';
  }
  if (!item.targetModules || item.targetModules.length === 0) {
    return 'partial';
  }
  return 'migrated';
}

function groupByFile(controls) {
  const grouped = {};
  controls.forEach((item) => {
    const { fileLabel } = item;
    if (!grouped[fileLabel]) {
      grouped[fileLabel] = { total: 0, migrated: 0, missing: 0, partial: 0, entries: [] };
    }
    const status = determineStatus(item);
    grouped[fileLabel].total += 1;
    grouped[fileLabel][status] += 1;
    grouped[fileLabel].entries.push(item);
  });
  return grouped;
}

function collectTotals(diff) {
  return diff.controls.reduce(
    (acc, item) => {
      const status = determineStatus(item);
      acc.total += 1;
      acc[status] += 1;
      return acc;
    },
    { total: 0, migrated: 0, partial: 0, missing: 0 }
  );
}

function buildMatrix(diff) {
  const grouped = groupByFile(diff.controls);
  const totals = collectTotals(diff);
  const coverage = totals.total ? ((totals.migrated / totals.total) * 100).toFixed(2) : '0.00';

  const lines = [];
  lines.push('# Admin V4 Coverage Matrix');
  lines.push('');
  lines.push(`Generat la: **${diff.generatedAt}**`);
  lines.push('');
  lines.push(`- Total controale v3: **${totals.total}**`);
  lines.push(`- Migrat în V4: **${totals.migrated}**`);
  lines.push(`- Parțial: **${totals.partial}**`);
  lines.push(`- Lipsă: **${totals.missing}**`);
  lines.push(`- Procent acoperire: **${coverage}%**`);
  lines.push('');

  lines.push('| Fișier v3 | Total | Migrat | Parțial | Lipsă | Acoperire |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  Object.entries(grouped).forEach(([fileLabel, stats]) => {
    const { total: fileTotal, migrated: fileMigrated, missing: fileMissing, partial: filePartial } = stats;
    const percent = fileTotal ? ((fileMigrated / fileTotal) * 100).toFixed(2) : '0.00';
    lines.push(`| ${fileLabel} | ${fileTotal} | ${fileMigrated} | ${filePartial} | ${fileMissing} | ${percent}% |`);
  });
  lines.push('');

  lines.push('## Gap-uri critice');
  lines.push('');
  lines.push('| Control | Fișier v3 | Endpoint-uri | Status | Note |');
  lines.push('| --- | --- | --- | --- | --- |');
  diff.controls
    .filter((item) => determineStatus(item) !== 'migrated')
    .slice(0, 100)
    .forEach((item) => {
      const label = item.control.text || item.control.id || item.control.name || `(${item.control.tag})`;
      const endpointCell = item.endpoints.length ? item.endpoints.join('<br>') : '—';
      const status = determineStatus(item);
      const note =
        status === 'partial' && (!item.targetModules || item.targetModules.length === 0)
          ? 'Control identificat, fără module țintă mapate'
          : '';
      const statusLabel = status === 'partial' ? '⚠️ parțial' : '❌ lipsă';
      lines.push(`| ${label} | ${item.fileLabel} | ${endpointCell} | ${statusLabel} | ${note} |`);
    });
  lines.push('');

  lines.push('## Mapping v3 → v4 (Top 200)');
  lines.push('');
  lines.push('| Control v3 | Fișier v3 | Matches V4 | Module |');
  lines.push('| --- | --- | --- | --- |');
  diff.controls.slice(0, 200).forEach((item) => {
    const label = item.control.text || item.control.id || item.control.name || `(${item.control.tag})`;
    const matches = item.matches.length ? item.matches.join('<br>') : '—';
    const modules = item.targetModules.length ? item.targetModules.join('<br>') : '—';
    lines.push(`| ${label} | ${item.fileLabel} | ${matches} | ${modules} |`);
  });
  lines.push('');

  fs.writeFileSync(OUTPUT_PATH, lines.join('\n'), 'utf8');
  console.log(`[coverage] Scris: ${path.relative(ROOT, OUTPUT_PATH)}`);
}

function main() {
  const diff = readDiff();
  buildMatrix(diff);
}

main();
