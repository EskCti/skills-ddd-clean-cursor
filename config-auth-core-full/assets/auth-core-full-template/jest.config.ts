import type { Config } from 'jest';

const COVERAGE_MIN = 95;

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/test/'],
  coverageThreshold: {
    global: {
      lines: COVERAGE_MIN,
      branches: COVERAGE_MIN,
      functions: COVERAGE_MIN,
      statements: COVERAGE_MIN,
    },
  },
};

export default config;
