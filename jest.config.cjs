//home (termux)/arclune_lane_7x3/jest.config.cjs

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

const aliasMapper = pathsToModuleNameMapper(compilerOptions.paths || {}, {
  prefix: '<rootDir>/',
});

module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/src/config/package.json'],
  testPathIgnorePatterns: [
    '<rootDir>/test/build.test.js',
    '<rootDir>/test/hud-listeners.test.js',
    '<rootDir>/test/pve-session-canvas.test.js',
    '<rootDir>/test/pve-session-config.test.js',
    '<rootDir>/test/session-background.test.js',
    '<rootDir>/test/shell-error-handling.test.js',
    '<rootDir>/test/startGame.test.js',
    '<rootDir>/test/ui/render-screens.test.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^\\.\\./src/(.*)$': '<rootDir>/src/$1',
    ...aliasMapper,
    '^zod$': '<rootDir>/tools/zod-stub/index.js',
    '^.+\\.css$': '<rootDir>/test/styleMock.js',
  },
};