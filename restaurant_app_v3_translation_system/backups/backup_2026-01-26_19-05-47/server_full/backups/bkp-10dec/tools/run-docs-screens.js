const { spawnSync } = require('child_process');
const path = require('path');

const specs = [
  'Dev-Files/03-Teste/tests/docs/docs-generate-screenshots.spec.ts',
  'Dev-Files/03-Teste/tests/modules-visual-regression.spec.ts',
];

const npmBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(
  npmBin,
  ['playwright', 'test', ...specs, '--update-snapshots'],
  {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      ENABLE_VISUAL_ASSERT: '1',
    },
  }
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
