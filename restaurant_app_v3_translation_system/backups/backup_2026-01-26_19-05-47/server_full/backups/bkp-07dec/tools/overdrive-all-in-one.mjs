#!/usr/bin/env node

// OVERDRIVE: orchestrator unic agenți + super-coordonator (UI color, buclă continuă)
// Node 18+ (ESM). Fără dependențe. Rulează cross-platform (Win/Unix).

import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

// ===== Config rapid (editează după nevoie) =====
const AGENTS = [
  {
    id: 1,
    name: "Inventariere",
    color: 33, // yellow
    cycle: ["diff:admins", "scan:controls", "tasks:suggest"],
    fallback: ["report:agents", "coverage:scan"],
  },
  {
    id: 2,
    name: "Implementare V4",
    color: 36, // cyan
    cycle: ["build", "docs:screens", "docs:generate"],
    fallback: ["controls:map", "report:agents"],
  },
  {
    id: 3,
    name: "QA / Playwright",
    color: 35, // magenta
    cycle: ["test:e2e", "test:perf", "docs:screens"],
    fallback: ["docs:screens", "report:agents"],
  },
  {
    id: 4,
    name: "Documentație & Backup",
    color: 32, // green
    cycle: ["docs:full", "tasks:suggest", "monitor:agents"],
    fallback: ["report:agents", "coverage:scan"],
  },
  {
    id: 5,
    name: "Compliance",
    color: 31, // red
    cycle: ["compliance:check", "tasks:suggest"],
    fallback: ["tasks:suggest", "report:agents"],
  },
  {
    id: 6,
    name: "Prep & Automation",
    color: 34, // blue
    cycle: ["controls:map", "coverage:scan", "report:agents"],
    fallback: ["monitor:agents", "tasks:suggest"],
  },
];

const SUPER_COORDINATOR = {
  name: "Super-Coordinator",
  tickScripts: ["monitor:agents", "diff:admins", "tasks:suggest"],
};

const REPORT_EVERY_MIN = Number(
  (process.argv.find((a) => a.startsWith("--report-every=")) || "").split("=")[1] || 10,
);
const LOOP_SECONDS = Number(
  (process.argv.find((a) => a.startsWith("--loop=")) || "").split("=")[1] || 300,
); // 5 min default
const IDLE_LOOP_SECONDS = Number(
  (process.argv.find((a) => a.startsWith("--idle-loop=")) || "").split("=")[1] || 10,
); // interval rapid când toți agenții au terminat un ciclu
const NO_ALT_SCREEN = process.argv.includes("--no-alt-screen"); // dacă vrei strictly același buffer
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PLAN_PATH = path.resolve("Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4.md");
const TASKPOOL_PATH = path.resolve("Dev-Files/06-Documentatie-Dev/PLAN-MIGRARE-V4-TASKPOOL.md");
const ADMIN_MAP_PATH = path.resolve("Dev-Files/06-Documentatie-Dev/ADMIN-V3-CONTROL-MAP.md");
const COVERAGE_PATH = path.resolve("Dev-Files/06-Documentatie-Dev/ADMIN-V4-COVERAGE-MATRIX.md");
const IDLE_REPORT_PATH = path.resolve("Dev-Files/06-Documentatie-Dev/IDLE-REPORT.md");
const LOG_DIR = path.resolve("server/logs");
fs.mkdirSync(LOG_DIR, { recursive: true });
const RUN_LOG = path.join(LOG_DIR, `overdrive-${new Date().toISOString().slice(0, 10)}.log`);

// ===== Helpers =====
const c =
  (n) =>
  (s) =>
    `\x1b[${n}m${s}\x1b[0m`;
const grey = c(90);
const green = c(32);
const red = c(31);
const yellow = c(33);
const cyan = c(36);
const magenta = c(35);
const bold = c(1);

const pad = (s, l) => (s + " ".repeat(l)).slice(0, l);
const now = () => new Date().toLocaleTimeString();

function readScripts() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
    return pkg.scripts || {};
  } catch {
    return {};
  }
}

const PKG_SCRIPTS = readScripts();

function runScript(name, logTag, onClose) {
  if (!PKG_SCRIPTS[name]) {
    onClose(0, `SKIP (${name} absent)`);
    return;
  }
  const cmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const ps = spawn(cmd, ["run", name], { stdio: "pipe" });
  let out = "";
  ps.stdout.on("data", (d) => {
    out += d.toString();
  });
  let err = "";
  ps.stderr.on("data", (d) => {
    out += d.toString();
    err += d.toString();
  });
  ps.on("close", (code) => {
    fs.appendFileSync(
      RUN_LOG,
      `[${new Date().toISOString()}] [${logTag}] ${name} -> code=${code}\n${out}\n---\n`,
    );
    onClose(code, out || err);
  });
}

function runScriptAsync(name, logTag) {
  return new Promise((resolve) => {
    runScript(name, logTag, (code, note) => resolve({ code, note }));
  });
}

function appendPlan(msg) {
  const line = `\n[${new Date().toLocaleString()}] ${msg}\n`;
  try {
    fs.appendFileSync(PLAN_PATH, line);
  } catch {}
}

function reportIdle(state) {
  const lines = [
    `# IDLE-REPORT (${new Date().toLocaleString()})`,
    `Host: ${os.hostname()}  User: ${os.userInfo().username}`,
    `Agents heartbeat: every ${Math.round(LOOP_SECONDS / 60)} min  |  Auto-report: ${REPORT_EVERY_MIN} min`,
    ``,
    `| Agent | Status | Last Task | Last Result |`,
    `| --- | --- | --- | --- |`,
  ];
  for (const a of state) {
    lines.push(`| ${a.name} | ${a.status} | ${a.lastTask || "-"} | ${a.lastNote || "-"} |`);
  }
  fs.writeFileSync(IDLE_REPORT_PATH, `${lines.join("\n")}\n`);
}

function header() {
  return `${bold("OVERDRIVE — MIGRARE Admin v3 → Admin v4")}  ${grey(`@ ${now()}`)}  |  loop ${LOOP_SECONDS}s  |  report ${REPORT_EVERY_MIN}m\n`;
}

function renderUI(state, superState) {
  if (!NO_ALT_SCREEN) {
    process.stdout.write("\x1b[?1049h");
  }
  process.stdout.write("\x1b[H\x1b[2J");
  process.stdout.write(header());
  process.stdout.write(
    `${grey("PLAN:")} ${PLAN_PATH}\n${grey("TASKPOOL:")} ${TASKPOOL_PATH}\n${grey("LOG:")} ${RUN_LOG}\n\n`,
  );

  const line = (name, color, stat, last, lastNote) => {
    const colorFn = color === 31 ? red : color === 32 ? green : color === 33 ? yellow : color === 35 ? magenta : color === 36 ? cyan : grey;
    return `${colorFn("■")} ${bold(name)}  ${grey("│")}  ${pad(stat, 10)}  ${grey("│")}  ${pad(last || "-", 28)}  ${grey("│")}  ${pad((lastNote || "").replace(/\s+/g, " "), 40)}\n`;
  };

  for (const a of state) {
    process.stdout.write(line(a.name, a.color, a.status, a.lastTask, a.lastNote));
  }
  process.stdout.write(`\n${grey("Super-Coordinator")} → ${bold(superState.status)}  ${grey("| last:")} ${superState.last || "-"}\n`);
  process.stdout.write(`${grey("Keys:")} q=quit  p=pause/resume  r=force report  l=lint:fix  t=tests:e2e\n`);
}

async function runFallbackCycle(agent, state, baseTask) {
  if (!agent.fallback || agent.fallback.length === 0) return;
  for (const fallbackTask of agent.fallback) {
    state.lastTask = `${baseTask} → ${fallbackTask}`;
    await runScriptAsync(fallbackTask, `Agent${agent.id}-fallback`);
  }
}

async function runAgentCycle(agent, state) {
  state.status = "running";
  for (const task of agent.cycle) {
    state.lastTask = task;
    let attempts = 0;
    let continueLoop = true;
    while (continueLoop) {
      const { code, note } = await runScriptAsync(task, `Agent${agent.id}`);
      state.lastNote = code === 0 ? `OK ${task}` : `ERR ${task}`;
      const waiting = code !== 0 || (note || "").includes("SKIP");
      if (!waiting) {
        continueLoop = false;
      } else if (agent.fallback && agent.fallback.length > 0 && attempts < 3) {
        await runFallbackCycle(agent, state, task);
        attempts += 1;
      } else {
        continueLoop = false;
      }
    }
  }
  state.status = "idle";
}

async function runSuperTick(superState) {
  superState.status = "tick";
  for (const s of SUPER_COORDINATOR.tickScripts) {
    superState.last = s;
    /* eslint-disable no-await-in-loop */
    await new Promise((res) => runScript(s, "Super", () => res()));
    /* eslint-enable no-await-in-loop */
  }
  appendPlan(`Super-Coordinator heartbeat: ran [${SUPER_COORDINATOR.tickScripts.join(", ")}]`);
  superState.status = "idle";
}

(async function main() {
  const agentStates = AGENTS.map((a) => ({ ...a, status: "init", lastTask: null, lastNote: null }));
  const superState = { status: "init", last: null };
  let paused = false;
  let lastReport = Date.now();

  if (process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.on("data", (b) => {
    const k = String(b);
    if (k === "q") {
      if (!NO_ALT_SCREEN) process.stdout.write("\x1b[?1049l");
      process.exit(0);
    }
    if (k === "p") {
      paused = !paused;
    }
    if (k === "r") {
      reportIdle(agentStates);
      appendPlan("Overdrive: forced report by user");
    }
    if (k === "l" && PKG_SCRIPTS["lint:fix"]) runScript("lint:fix", "QuickFix", () => {});
    if (k === "t" && PKG_SCRIPTS["test:e2e"]) runScript("test:e2e", "QuickTest", () => {});
  });

  while (true) {
    const start = Date.now();
    const cycles = agentStates.map((s) => (paused ? Promise.resolve() : runAgentCycle(s, s)));
    const superTick = paused ? Promise.resolve() : runSuperTick(superState);

    renderUI(agentStates, superState);
    await Promise.allSettled([...cycles, superTick]);

    if (Date.now() - lastReport >= REPORT_EVERY_MIN * 60 * 1000) {
      reportIdle(agentStates);
      lastReport = Date.now();
    }

    const elapsed = (Date.now() - start) / 1000;
    const baseRemain = Math.max(0, LOOP_SECONDS - elapsed);
    const remain = paused || baseRemain === 0 ? baseRemain : Math.min(baseRemain, IDLE_LOOP_SECONDS);
    for (let i = 0; i < remain; i += 1) {
      if (!NO_ALT_SCREEN) renderUI(agentStates, superState);
      /* eslint-disable no-await-in-loop */
      await new Promise((r) => setTimeout(r, 1000));
      /* eslint-enable no-await-in-loop */
    }
  }
})();

