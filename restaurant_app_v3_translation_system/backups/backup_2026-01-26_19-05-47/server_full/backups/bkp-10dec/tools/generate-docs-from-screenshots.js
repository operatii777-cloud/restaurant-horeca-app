#!/usr/bin/env node

/**
 * Generator automat pentru manualele Admin V4.
 * Scanează directorul `docs/admin-v4/screenshots` și creează fișiere Markdown
 * corespunzătoare în `docs/admin-v4/manual`, fără a suprascrie fișiere existente.
 * În plus, generează fișiere „User Guide” agregate pentru fiecare modul.
 */

const fs = require('fs');
const path = require('path');

const DOCS_ROOT = path.resolve(__dirname, '../docs/admin-v4');
const SCREENSHOTS_DIR = path.join(DOCS_ROOT, 'screenshots');
const MANUAL_DIR = path.join(DOCS_ROOT, 'manual');
const USER_GUIDE_DIR = path.join(DOCS_ROOT, 'user-guide');

const TEMPLATE = ({ pageTitle, screenshotRelativePath }) => `# ${pageTitle}

![Screenshot](${screenshotRelativePath.replace(/\\/g, '/')})

## Descriere
{completează descrierea paginii}

## Butoane și funcții
- {listează acțiunile principale}

## Flux operațional
1. {descrie pașii principali}
`;

const USER_GUIDE_TEMPLATE = ({ title, rows }) => {
  const tableRows = rows
    .map(
      ({ label, imagePath }) =>
        `| ${label} | ![](${imagePath.replace(/\\/g, '/')}) |`
    )
    .join('\n');

  return `# ${title} – User Guide

## Capturi disponibile
| View | Imagine |
| --- | --- |
${tableRows || '| — | — |'}

## Rezumat funcionalitate
{descriere sumară a modulului, acțiuni principale, rapoarte}

## Fluxuri recomandate
1. {descrie fluxul standard}
2. {descrie fluxuri alternative}

## Elemente critice / conformitate
- {menționează câmpuri HACCP / ANPC relevante}
`;
};

function toTitleCase(input) {
  return input
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toPascalCase(input) {
  return toTitleCase(input).replace(/\s+/g, '');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateDocs() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    console.warn('[docs] Directorul de capturi nu există încă. Rulează scriptul de capturi înainte.');
    return;
  }

  ensureDir(MANUAL_DIR);
  ensureDir(USER_GUIDE_DIR);

  const sections = fs.readdirSync(SCREENSHOTS_DIR, { withFileTypes: true }).filter((entry) => entry.isDirectory());
  const guideEntries = [];

  sections.forEach((sectionDir) => {
    const sectionName = sectionDir.name;
    const sectionTitle = toTitleCase(sectionName);
    const screenshotsPath = path.join(SCREENSHOTS_DIR, sectionName);
    const manualPath = path.join(MANUAL_DIR, sectionName);

    ensureDir(manualPath);

    const files = fs
      .readdirSync(screenshotsPath)
      .filter((file) => file.toLowerCase().endsWith('.png'))
      .sort();

    const sectionGuideRows = [];

    files.forEach((file) => {
      const baseName = path.basename(file, path.extname(file));
      const markdownFilePath = path.join(manualPath, `${baseName}.md`);

      if (!fs.existsSync(markdownFilePath)) {
        const relativePathFromMarkdown = path.relative(
          path.dirname(markdownFilePath),
          path.join(screenshotsPath, file)
        );
        const content = TEMPLATE({
          pageTitle: `${sectionTitle} – ${toTitleCase(baseName)}`,
          screenshotRelativePath: relativePathFromMarkdown,
        });

        fs.writeFileSync(markdownFilePath, content, 'utf8');
        console.log(`[docs] Creat: ${path.relative(DOCS_ROOT, markdownFilePath)}`);
      }

      const relativePathFromGuide = path.relative(USER_GUIDE_DIR, path.join(screenshotsPath, file));
      sectionGuideRows.push({ label: toTitleCase(baseName), imagePath: relativePathFromGuide });
    });

    guideEntries.push({
      sectionName,
      title: `${sectionTitle} Page`,
      rows: sectionGuideRows,
    });
  });

  guideEntries.forEach(({ sectionName, title, rows }) => {
    const guideFileName = `${toPascalCase(sectionName)}Page.md`;
    const guideFilePath = path.join(USER_GUIDE_DIR, guideFileName);
    const content = USER_GUIDE_TEMPLATE({ title, rows });
    fs.writeFileSync(guideFilePath, content, 'utf8');
    console.log(`[docs] Actualizat: ${path.relative(DOCS_ROOT, guideFilePath)}`);
  });
}

generateDocs();


