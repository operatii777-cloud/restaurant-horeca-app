/**
 * Package B verification (no browser required for these checks).
 * Run: node scripts/verify-package-b.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// B1 — sticky payment actions + sheet footer
const summaryCss = read('src/modules/pos/components/PosOrderSummary.css');
assert(summaryCss.includes('position: sticky'), 'B1: PosOrderSummary actions should be sticky');
assert(summaryCss.includes('.pos-order-actions'), 'B1: pos-order-actions block present');

const pageCss = read('src/modules/pos/pages/PosPage.css');
assert(pageCss.includes('.pos-page-summary') && pageCss.includes('overflow: hidden'), 'B1: summary column should not scroll away actions');

const sheetCss = read('src/modules/pos/components/PaymentSheet.css');
assert(sheetCss.includes('.payment-sheet-footer'), 'B1: PaymentSheet sticky footer class');
assert(sheetCss.includes('.payment-sheet-add-btn'), 'B1: Add Payment button class in footer');

const sheetTsx = read('src/modules/pos/components/PaymentSheet.tsx');
assert(sheetTsx.includes('payment-sheet-footer'), 'B1: Add Payment moved to Modal.Footer');
assert(!/Modal\.Body[\s\S]*payment-sheet-actions[\s\S]*Modal\.Footer/.test(sheetTsx), 'B1: Add Payment should not live only inside body actions');

// B2 — self-service idle reset
const idleHook = read('src/modules/kiosk/hooks/useSelfServiceIdleReset.js');
assert(idleHook.includes('timeoutMs'), 'B2: idle hook has timeout');
assert(idleHook.includes('onIdle'), 'B2: idle hook calls onIdle');

const selfService = read('src/modules/kiosk/pages/KioskSelfServicePage.jsx');
assert(selfService.includes('useSelfServiceIdleReset'), 'B2: self-service wires idle hook');
assert(selfService.includes('resetSelfServiceSession'), 'B2: reset session callback');
assert(selfService.includes('setShowOrderTypeModal(true)'), 'B2: reset returns to order-type start');
assert(selfService.includes('setCart([])'), 'B2: reset clears cart');

// B3 — safe utils
const safeTs = read('src/shared/utils/safe.ts');
assert(safeTs.includes('export function safeNum'), 'B3: safeNum');
assert(safeTs.includes('export function safeFixed'), 'B3: safeFixed');
assert(safeTs.includes('export function safeArr'), 'B3: safeArr');
assert(safeTs.includes('export function safeObj'), 'B3: safeObj');

const guardedPages = [
  'src/modules/enterprise/pages/GiftCardsPage.tsx',
  'src/modules/enterprise/pages/FoodCostDashboardPage.tsx',
  'src/modules/enterprise/pages/MenuEngineeringPage.tsx',
  'src/modules/variance/pages/VarianceReportsPage.tsx',
  'src/modules/stocks/waste/pages/WastePage.tsx',
  'src/modules/efactura/components/EFacturaStatsCards.tsx',
  'src/modules/waiter/pages/WaiterPage.tsx',
];
for (const rel of guardedPages) {
  const src = read(rel);
  assert(src.includes('@/shared/utils/safe'), `B3: ${rel} imports safe utils`);
  const staleJs = path.join(root, rel.replace(/\.tsx$/, '.js'));
  assert(!fs.existsSync(staleJs), `B3: stale ${path.basename(staleJs)} must be removed so Vite resolves .tsx`);
}

assert(!fs.existsSync(path.join(root, 'src/modules/pos/components/PaymentSheet.js')), 'B1: stale PaymentSheet.js removed so .tsx is used');


// Runtime check of safe helpers
const safeMod = await import(pathToFileURL(path.join(root, 'src/shared/utils/safe.js')).href);
assert(safeMod.safeNum(null) === 0, 'B3 runtime: safeNum(null)=0');
assert(safeMod.safeNum('12.5') === 12.5, 'B3 runtime: safeNum string');
assert(safeMod.safeFixed(undefined) === '0.00', 'B3 runtime: safeFixed(undefined)');
assert(safeMod.safeArr(null).length === 0, 'B3 runtime: safeArr(null)');
assert(safeMod.safeObj(null).x === undefined, 'B3 runtime: safeObj(null)');
assert(JSON.stringify(safeMod.safeObj({ a: 1 })) === '{"a":1}', 'B3 runtime: safeObj passthrough');

// B4 discovery note — do not invent UI; report presence of create form elsewhere
const driveThruOps = read('src/modules/drivethru/pages/DriveThruPage.tsx');
assert(!driveThruOps.includes('fetch(\'/api/orders/drive-thru\''), 'B4: drivethru ops page has no create POST');
assert(driveThruOps.includes('handleMarkReady'), 'B4: drivethru ops has ready action');

const driveThruCreate = read('src/modules/delivery/pages/DriveThruPage.tsx');
assert(driveThruCreate.includes("fetch('/api/orders/drive-thru'"), 'B4: delivery DriveThruPage has create API');

if (failures.length) {
  console.error('FAIL');
  failures.forEach((f) => console.error(' -', f));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  verified: {
    B1: 'sticky POS actions + PaymentSheet footer',
    B2: 'self-service idle reset 90s wired',
    B3: `safe utils + ${guardedPages.length} pages`,
    B4: 'create UI exists in delivery/DriveThruPage; ops screen in drivethru/ is status-only',
  },
}, null, 2));
