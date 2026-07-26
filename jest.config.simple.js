module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      '/root/workspace/background/travelo-institutional-scaffold/node_modules/ts-jest',
      { 
        tsconfig: { 
          jsx: 'react-jsx',
          moduleResolution: 'bundler',
          paths: { '@/*': ['./src/*'] }
        }
      }
    ],
  },
};
