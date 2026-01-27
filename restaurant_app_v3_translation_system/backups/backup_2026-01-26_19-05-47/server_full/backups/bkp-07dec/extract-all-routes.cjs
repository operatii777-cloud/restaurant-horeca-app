/**
 * Extrage toate rutele din App.tsx și le compară cu navigation.ts
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 EXTRAGERE RUTE DIN APP.TSX...\n');

const appPath = path.join(__dirname, 'admin-vite/src/app/App.tsx');
const navPath = path.join(__dirname, 'admin-vite/src/modules/layout/constants/navigation.ts');

const appContent = fs.readFileSync(appPath, 'utf8');
const navContent = fs.readFileSync(navPath, 'utf8');

// Extrage rute din App.tsx
const routeRegex = /<Route\s+path="([^"]+)"\s+element=\{<([^/>]+)/g;
const routes = [];
let match;

while ((match = routeRegex.exec(appContent)) !== null) {
  routes.push({
    path: match[1],
    component: match[2].replace(/\s+/g, '')
  });
}

console.log(`✅ Găsite ${routes.length} rute în App.tsx\n`);

// Extrage paths din navigation.ts
const pathRegex = /path:\s*'([^']+)'/g;
const navPaths = [];

while ((match = pathRegex.exec(navContent)) !== null) {
  if (match[1] !== '#') {
    navPaths.push(match[1]);
  }
}

console.log(`✅ Găsite ${navPaths.length} paths în navigation.ts\n`);

console.log('═'.repeat(80));
console.log('\n📊 COMPARAȚIE navigation.ts vs App.tsx:\n');

// Paths din navigation care NU au rută în App.tsx
const missingRoutes = navPaths.filter(navPath => {
  return !routes.some(route => route.path === navPath || route.path === navPath + '/*');
});

if (missingRoutes.length > 0) {
  console.log(`⚠️  RUTE LIPSĂ ÎN APP.TSX (${missingRoutes.length}):\n`);
  missingRoutes.forEach((path, idx) => {
    console.log(`${idx + 1}. ${path}`);
  });
} else {
  console.log('✅ Toate rutele din navigation.ts au implementare în App.tsx!');
}

// Rute din App.tsx care NU sunt în navigation.ts
const extraRoutes = routes.filter(route => {
  const routePath = route.path.replace('/*', '');
  return !navPaths.some(navPath => navPath === routePath || navPath.startsWith(routePath));
}).filter(r => !r.path.startsWith('kiosk') && r.path !== '*');

if (extraRoutes.length > 0) {
  console.log(`\n\n📍 RUTE ÎN APP.TSX CARE NU SUNT ÎN NAVIGATION (${extraRoutes.length}):\n`);
  extraRoutes.slice(0, 20).forEach((route, idx) => {
    console.log(`${idx + 1}. ${route.path} → ${route.component}`);
  });
  if (extraRoutes.length > 20) {
    console.log(`... și încă ${extraRoutes.length - 20} rute`);
  }
}

console.log('\n═'.repeat(80));
console.log('\n✅ EXTRAGERE COMPLETĂ!\n');

// Salvează rezultatele
const report = {
  totalRoutesInApp: routes.length,
  totalPathsInNav: navPaths.length,
  missingRoutes: missingRoutes,
  extraRoutes: extraRoutes.map(r => ({ path: r.path, component: r.component }))
};

fs.writeFileSync(
  path.join(__dirname, 'ROUTES-COMPARISON.json'),
  JSON.stringify(report, null, 2)
);

console.log('📄 Raport salvat în: ROUTES-COMPARISON.json\n');

