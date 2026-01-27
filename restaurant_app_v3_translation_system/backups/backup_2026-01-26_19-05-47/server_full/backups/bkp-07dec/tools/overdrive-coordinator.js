const { spawn } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const RUNNERS = new Map();

function runScript(label, npmScript) {
  if (RUNNERS.get(label)?.running) {
    console.log(`[overdrive] ${label} deja rulează, sar peste execuția curentă.`);
    return;
  }
  console.log(`[overdrive] Pornesc ${label} → npm run ${npmScript}`);
  const child = spawn('npm', ['run', npmScript], {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit'
  });
  RUNNERS.set(label, { running: true, child });
  child.on('exit', (code) => {
    RUNNERS.set(label, { running: false });
    console.log(`[overdrive] ${label} finalizat cu exit code ${code}`);
  });
  child.on('error', (err) => {
    RUNNERS.set(label, { running: false });
    console.error(`[overdrive] Eroare la ${label}:`, err);
  });
}

function schedule(label, npmScript, intervalMs, runImmediately = false) {
  if (runImmediately) {
    runScript(label, npmScript);
  }
  setInterval(() => runScript(label, npmScript), intervalMs);
}

// Monitorizare agenți la 60 secunde
schedule('monitor:agents', 'monitor:agents', 60_000, true);

// Diff Sentinel complet la 5 minute
function diffSentinel() {
  runScript('diff:admins', 'diff:admins');
  // lansează restul cu ușor delay pentru a evita coliziuni
  setTimeout(() => runScript('scan:controls', 'scan:controls'), 30_000);
  setTimeout(() => runScript('coverage', 'coverage'), 60_000);
  setTimeout(() => runScript('tasks:suggest', 'tasks:suggest'), 90_000);
}

diffSentinel();
setInterval(diffSentinel, 5 * 60_000);

console.log('[overdrive] Modul OVERDRIVE activ. Execuție continuă.');
