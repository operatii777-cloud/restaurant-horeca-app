#!/usr/bin/env node

/**
 * Diagnostic complet pentru vite build lent / blocat.
 * Boss-level edition.
 */
const { execSync } = require("child_process");
const fs = require("fs");

console.log("🔥 Starting Vite Build Diagnostic…\n");

/* ----------------------------------------
   1. Detectăm circular dependencies
---------------------------------------- */
console.log("🔍 Checking for circular dependencies…");
try {
  execSync("npx madge --circular --extensions ts,tsx,js,jsx src", { stdio: "inherit" });
} catch {
  console.log("⚠️ Madge detected circular dependencies!");
}

/* ----------------------------------------
   2. Vite debug build
---------------------------------------- */
console.log("\n🔧 Running vite build --debug …\n");
try {
  execSync("npm run build -- --debug", { stdio: "inherit" });
} catch (e) {
  console.log("❌ Build failed, analyzing error…");
}

/* ----------------------------------------
   3. Top 20 fișiere lente
---------------------------------------- */
console.log("\n⏱️ Measuring slow TypeScript files…");
try {
  execSync("npx tsc --extendedDiagnostics", { stdio: "inherit" });
} catch {}

/* ----------------------------------------
   4. Find HUGE FILES (probabil vinovatul #1)
---------------------------------------- */
console.log("\n📦 Searching for huge files ( > 1000 lines ) …");
function scanFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = dir + "/" + entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      scanFiles(fullPath);
      continue;
    }
    if (!fullPath.match(/\.(js|jsx|ts|tsx)$/)) continue;
    const content = fs.readFileSync(fullPath, "utf8");
    const lines = content.split("\n").length;
    if (lines > 1000) {
      console.log(`⚠️ HUGE FILE: ${fullPath} → ${lines} lines`);
    }
  }
}
scanFiles("./src");

/* ----------------------------------------
   5. Detect double React installs
---------------------------------------- */
console.log("\n🔄 Checking for duplicate React versions…");
try {
  execSync("npm ls react", { stdio: "inherit" });
} catch {}

console.log("\n🏁 Diagnostic complete.");
console.log("📄 Please inspect results above.\n");

