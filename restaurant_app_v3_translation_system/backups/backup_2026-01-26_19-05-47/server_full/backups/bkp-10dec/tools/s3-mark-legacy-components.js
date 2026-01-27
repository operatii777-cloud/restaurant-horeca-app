// tools/s3-mark-legacy-components.js
// PHASE S3.3 - Mark LEGACY_COMPONENT modules

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const modulesRoot = path.join(projectRoot, "admin-vite", "src", "modules");

const legacyModules = [
  "invoices",
  "pos",
  "tipizate",
  path.join("stocks", "nir"),
  path.join("stocks", "consume"),
  path.join("stocks", "transfer"),
];

const LEGACY_BANNER = `// =======================================================
// LEGACY_COMPONENT - PHASE S3
// Acest modul este păstrat DOAR ca fallback.
// Va fi înlocuit în S4/S5 cu versiunea enterprise.
// NU adăugați funcționalități noi aici.
// =======================================================

`;

function markFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  if (code.includes("LEGACY_COMPONENT - PHASE S3")) {
    console.log(`[SKIP] Already marked: ${filePath}`);
    return;
  }
  const newCode = LEGACY_BANNER + code;
  fs.writeFileSync(filePath, newCode, "utf8");
  console.log(`[OK] Marked LEGACY_COMPONENT: ${filePath}`);
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (
      entry.isFile() &&
      (fullPath.endsWith(".tsx") || fullPath.endsWith(".jsx"))
    ) {
      markFile(fullPath);
    }
  }
}

function run() {
  console.log("PHASE S3.3 - Mark LEGACY_COMPONENT modules\n");
  for (const rel of legacyModules) {
    const modPath = path.join(modulesRoot, rel);
    if (!fs.existsSync(modPath)) {
      console.warn(`[WARN] Legacy module not found: ${modPath}`);
      continue;
    }
    console.log(`📁 Processing legacy module: ${modPath}`);
    walk(modPath);
  }
  console.log("\n[OK] PHASE S3.3 COMPLETE");
}

run();

