#!/usr/bin/env node

/**
 * Compară interfețele admin v3 (HTML legacy) cu Admin V4 (Vite + React) și generează
 * rapoarte JSON + Markdown cu diferențele de module, modale și endpoint-uri.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const V3_FILES = [
  { id: 'admin', label: 'admin.html', file: path.join(ROOT, 'public/admin.html') },
  { id: 'admin-advanced', label: 'admin-advanced.html', file: path.join(ROOT, 'public/admin-advanced.html') },
  { id: 'admin-v4-modular', label: 'admin-v4-modular.html', file: path.join(ROOT, 'public/admin-v4-modular.html') },
];
const V4_SRC_ROOT = path.join(ROOT, 'admin-vite/src');
const OUTPUT_DIR = path.join(ROOT, 'docs/admin-v4/diffs');

const ROUTE_REGEX = /path="([^"]+)"/g;
const ENDPOINT_REGEX = /(['"])(\/api[^'"\s]+)\1/g;
const SECTION_REGEX = /id="([^"]+Section)"/g;
const MODAL_REGEX = /id="([^"]+Modal)"/g;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`[diff-admins] Nu pot citi ${filePath}: ${error.message}`);
    return '';
  }
}

function extractMatches(regex, text) {
  const results = new Set();
  if (!text) return [];
  let match;
  const cloned = new RegExp(regex.source, regex.flags);
  while ((match = cloned.exec(text)) !== null) {
    results.add(match[1]);
  }
  return Array.from(results);
}

function listV4Files() {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(t|j)sx?$/.test(entry.name)) {
        files.push(fullPath);
      }
    });
  }
  walk(V4_SRC_ROOT);
  return files;
}

function mapEndpointsToV4(endpoints, v4Files) {
  const mapping = {};
  endpoints.forEach((endpoint) => {
    mapping[endpoint] = [];
    v4Files.forEach((filePath) => {
      const content = readFileSafe(filePath);
      if (!content) return;
      if (content.includes(endpoint)) {
        mapping[endpoint].push(path.relative(ROOT, filePath));
      }
    });
  });
  return mapping;
}

function analyzeV3File(filePath) {
  const content = readFileSafe(filePath);
  return {
    sections: extractMatches(SECTION_REGEX, content),
    modals: extractMatches(MODAL_REGEX, content),
    endpoints: extractMatches(ENDPOINT_REGEX, content),
  };
}

function extractV4Routes() {
  const appFile = path.join(V4_SRC_ROOT, 'app/App.tsx');
  const content = readFileSafe(appFile);
  return extractMatches(ROUTE_REGEX, content);
}

function buildDiff() {
  const v4Files = listV4Files();
  const v4Routes = extractV4Routes();

  const v3Analysis = {};
  const allEndpoints = new Set();

  V3_FILES.forEach(({ id, file }) => {
    const analysis = analyzeV3File(file);
    v3Analysis[id] = analysis;
    analysis.endpoints.forEach((endpoint) => allEndpoints.add(endpoint));
  });

  const endpointMapping = mapEndpointsToV4(Array.from(allEndpoints), v4Files);

  return {
    generatedAt: new Date().toISOString(),
    v3Files: V3_FILES.map(({ id, label, file }) => ({ id, label, path: path.relative(ROOT, file) })),
    v3Analysis,
    v4: {
      root: path.relative(ROOT, V4_SRC_ROOT),
      routes: v4Routes,
    },
    mappings: endpointMapping,
  };
}

function writeJsonReport(diff) {
  ensureDir(OUTPUT_DIR);
  const jsonPath = path.join(OUTPUT_DIR, 'admins-diff.json');
  fs.writeFileSync(jsonPath, JSON.stringify(diff, null, 2), 'utf8');
  console.log(`[diff-admins] JSON salvat: ${path.relative(ROOT, jsonPath)}`);
  return jsonPath;
}

function writeMarkdownReport(diff) {
  const mdPath = path.join(OUTPUT_DIR, 'admins-diff.md');
  const lines = [];
  lines.push(`# Admin v3 → Admin V4 Diff Report`);
  lines.push('');
  lines.push(`Generat la: **${diff.generatedAt}**`);
  lines.push('');

  lines.push('## Fișiere analizate (v3)');
  lines.push('');
  diff.v3Files.forEach((file) => {
    lines.push(`- ${file.label} (_${file.path}_)`);
  });
  lines.push('');

  lines.push('## Analiză pe fișiere v3');
  lines.push('');
  Object.entries(diff.v3Analysis).forEach(([id, analysis]) => {
    const fileMeta = diff.v3Files.find((f) => f.id === id);
    lines.push(`### ${fileMeta ? fileMeta.label : id}`);
    lines.push('');
    lines.push(`- Secțiuni: ${analysis.sections.length ? analysis.sections.join(', ') : 'N/A'}`);
    lines.push(`- Modale: ${analysis.modals.length ? analysis.modals.join(', ') : 'N/A'}`);
    lines.push(`- Endpoint-uri: ${analysis.endpoints.length ? analysis.endpoints.join(', ') : 'N/A'}`);
    lines.push('');
  });

  lines.push('## Rute Admin V4');
  lines.push('');
  diff.v4.routes.forEach((route) => lines.push(`- ${route}`));
  lines.push('');

  lines.push('## Mapare endpoint-uri v3 → V4');
  lines.push('');
  lines.push('| Endpoint | Fișiere v4 detectate | Status |');
  lines.push('| --- | --- | --- |');
  Object.entries(diff.mappings).forEach(([endpoint, files]) => {
    const status = files.length ? '✅ găsit' : '⚠️ lipsă în V4';
    const filesList = files.length ? files.join('<br>') : '—';
    lines.push(`| ${endpoint} | ${filesList} | ${status} |`);
  });
  lines.push('');

  const mdContent = lines.join('\n');
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  console.log(`[diff-admins] Markdown salvat: ${path.relative(ROOT, mdPath)}`);
  return mdPath;
}

function main() {
  const diff = buildDiff();
  writeJsonReport(diff);
  writeMarkdownReport(diff);
}

main();
