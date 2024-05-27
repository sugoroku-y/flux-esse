import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    runner: 'jest-runner-eslint',
    displayName: 'lint',
    testMatch: [
        '<rootDir>/src/**/*.ts',
        '<rootDir>/src/**/*.tsx',
        '<rootDir>/tests/**/*.ts',
        '<rootDir>/tests/**/*.tsx',
    ],
    slowTestThreshold: 30,
};

export default config;
