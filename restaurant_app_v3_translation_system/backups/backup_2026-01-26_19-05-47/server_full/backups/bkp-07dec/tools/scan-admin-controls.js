#!/usr/bin/env node

/**
 * Scanează fișierele Admin v3 (HTML legacy) pentru a inventaria controalele UI
 * și le compară cu implementarea Admin V4 (React). Rezultatul este scris în:
 *  - Dev-Files/06-Documentatie-Dev/ADMIN-V3-CONTROL-MAP.md
 *  - docs/admin-v4/diffs/admin-controls.json
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const V3_FILES = [
  { id: 'admin', label: 'admin.html', file: path.join(ROOT, 'public/admin.html') },
  { id: 'admin-advanced', label: 'admin-advanced.html', file: path.join(ROOT, 'public/admin-advanced.html') },
  { id: 'admin-v4-modular', label: 'admin-v4-modular.html', file: path.join(ROOT, 'public/admin-v4-modular.html') },
];
const V4_SRC_ROOT = path.join(ROOT, 'admin-vite/src');
const CONTROL_MAP_MD = path.join(
  ROOT,
  'Dev-Files/06-Documentatie-Dev/ADMIN-V3-CONTROL-MAP.md',
);
const CONTROL_DIFF_JSON = path.join(ROOT, 'docs/admin-v4/diffs/admin-controls.json');

const INTERACTIVE_SELECTORS = [
  'button',
  'a.btn',
  'a.button',
  'a[data-action]',
  'a[data-modal]',
  '[role="button"]',
  'input[type="button"]',
  'input[type="submit"]',
  'label.switch',
  '.btn',
  '.button',
  '.action-button',
];

const ENDPOINT_REGEX = /(['"])(\/api[^'"\s]+)\1/g;

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.warn(`[scan-controls] Nu pot citi ${filePath}: ${error.message}`);
    return '';
  }
}

function uniqueElements(elements) {
  const seen = new Set();
  return elements.filter((el) => {
    if (seen.has(el)) {
      return false;
    }
    seen.add(el);
    return true;
  });
}

function extractControlsFromHtml(html) {
  if (!html) return [];
  const dom = new JSDOM(html);
  const { document } = dom.window;
  const results = [];
  const collected = new Set();

  INTERACTIVE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (!collected.has(el)) {
        collected.add(el);
      }
    });
  });

  uniqueElements(Array.from(collected)).forEach((el, index) => {
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ');
    const id = el.id || '';
    const classes = (el.className || '').trim();
    const dataAttributes = Array.from(el.attributes)
      .filter((attr) => attr.name.startsWith('data-'))
      .map((attr) => `${attr.name}=${attr.value}`);
    const href = el.getAttribute && el.getAttribute('href');
    const name = el.getAttribute && (el.getAttribute('name') || el.getAttribute('aria-label') || '');

    results.push({
      key: `${el.tagName.toLowerCase()}-${id || classes || name || text || index}`,
      tag: el.tagName.toLowerCase(),
      text,
      id,
      classes,
      dataAttributes,
      href: href || null,
      name: name || null,
    });
  });

  return results;
}

function extractEndpoints(html) {
  if (!html) return [];
  const results = new Set();
  let match;
  const regex = new RegExp(ENDPOINT_REGEX.source, ENDPOINT_REGEX.flags);
  while ((match = regex.exec(html)) !== null) {
    results.add(match[2]);
  }
  return Array.from(results);
}

function listV4Files() {
  const files = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
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

function buildV4ContentIndex() {
  const index = {};
  listV4Files().forEach((filePath) => {
    index[filePath] = readFileSafe(filePath);
  });
  return index;
}

function normalizeText(value) {
  if (!value) return '';
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function matchControlInV4(control, v4Index) {
  const signatures = new Set();
  if (control.text) signatures.add(normalizeText(control.text));
  if (control.name) signatures.add(normalizeText(control.name));
  if (control.id) signatures.add(control.id);
  if (control.classes) signatures.add(control.classes.split(/\s+/).join(' '));
  control.dataAttributes.forEach((attr) => signatures.add(attr.split('=')[1] || attr));

  const matches = new Set();

  Object.entries(v4Index).forEach(([filePath, content]) => {
    if (!content) return;
    const normalizedContent = normalizeText(content);
    for (const signature of signatures) {
      if (!signature) continue;
      if (normalizedContent.includes(normalizeText(signature))) {
        matches.add(path.relative(ROOT, filePath));
        break;
      }
    }
  });

  return Array.from(matches);
}

function detectTargetModule(filePath) {
  const match = filePath.match(/src[\\/](modules|pages)[\\/]([^\\/]+)/);
  if (match) {
    return `${match[1]}/${match[2]}`;
  }
  return 'N/A';
}

function generateReports() {
  const v4Index = buildV4ContentIndex();
  const diff = {
    generatedAt: new Date().toISOString(),
    controls: [],
  };

  V3_FILES.forEach(({ id, label, file }) => {
    const html = readFileSafe(file);
    const controls = extractControlsFromHtml(html);
    const endpoints = extractEndpoints(html);

    controls.forEach((control) => {
      const matches = matchControlInV4(control, v4Index);
      diff.controls.push({
        fileId: id,
        fileLabel: label,
        sourcePath: path.relative(ROOT, file),
        control,
        endpoints,
        matches,
        targetModules: matches.map(detectTargetModule).filter((value, index, arr) => value !== 'N/A' && arr.indexOf(value) === index),
        existsInV4: matches.length > 0,
      });
    });
  });

  diff.controls.sort((a, b) => {
    if (a.existsInV4 === b.existsInV4) {
      return a.control.text.localeCompare(b.control.text);
    }
    return a.existsInV4 ? 1 : -1;
  });

  fs.writeFileSync(CONTROL_DIFF_JSON, JSON.stringify(diff, null, 2), 'utf8');
  console.log(`[scan-controls] JSON salvat: ${path.relative(ROOT, CONTROL_DIFF_JSON)}`);

  const lines = [];
  lines.push('# Admin v3 Control Map → Admin V4');
  lines.push('');
  lines.push(`Generat la: **${diff.generatedAt}**`);
  lines.push('');
  lines.push('| Control | Fișier sursă (v3) | Endpoint-uri detectate | Match V4 | Modul țintă |');
  lines.push('| --- | --- | --- | --- | --- |');

  diff.controls.forEach((item) => {
    const { control, sourcePath, endpoints, existsInV4, matches, targetModules } = item;
    const label = control.text || control.id || control.name || `(${control.tag})`;
    const endpointCell = endpoints.length ? endpoints.join('<br>') : '—';
    const matchCell = existsInV4 ? matches.join('<br>') : '⚠️ lipsă';
    const moduleCell = targetModules.length ? targetModules.join('<br>') : '—';
    lines.push(`| ${label} | ${sourcePath} | ${endpointCell} | ${matchCell} | ${moduleCell} |`);
  });

  fs.writeFileSync(CONTROL_MAP_MD, lines.join('\n'), 'utf8');
  console.log(`[scan-controls] Markdown salvat: ${path.relative(ROOT, CONTROL_MAP_MD)}`);
}

generateReports();
