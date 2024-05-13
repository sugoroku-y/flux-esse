import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    displayName: 'test',
    testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    moduleNameMapper: {
        '^@$': '<rootDir>/src',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@tests/(.*)$': '<rootDir>/tests/$1',
    },
    transform: {
        '\\.js$': 'babel-jest',
        '\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: `<rootDir>/tests/tsconfig.json`,
            },
        ],
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
    testEnvironment: 'jsdom',
    coveragePathIgnorePatterns: ['/node_modules/', '/tests/hooks/'],
};

export default config;
