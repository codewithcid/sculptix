/** Jest config. We test pure logic (engine, utils) — fast and deterministic. */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  collectCoverageFrom: ['src/engine/**/*.ts', 'src/utils/**/*.ts'],
};
