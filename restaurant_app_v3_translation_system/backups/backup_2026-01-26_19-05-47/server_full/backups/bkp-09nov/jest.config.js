/** @type {import('jest').Config} */
module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/Dev-Files/07-Backups/',
    '/Dev-Files/05-Scripturi-Temporare/',
    '/Dev-Files/03-Teste/tests/',
    '/docs/',
    '/public/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/Dev-Files/07-Backups/',
    '<rootDir>/Dev-Files/05-Scripturi-Temporare/',
    '<rootDir>/Dev-Files/01-Rapoarte/',
    '<rootDir>/Dev-Files/02-Fixuri/',
    '<rootDir>/Dev-Files/03-Teste/tests/',
    '<rootDir>/Dev-Files/05-Scripturi-Temporare',
    '<rootDir>/Dev-Files/07-Backups'
  ],
  collectCoverageFrom: [
    'server.js',
    'database.js',
    'helpers/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!coverage/**'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  clearMocks: true,
  forceExit: true,
  detectOpenHandles: true,
  verbose: true
};

