import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    projects: [
        '<rootDir>/jest-test.config.ts',
        ...(process.env.npm_config_lint ? ['<rootDir>/jest-eslint.config.ts'] : []),
    ],
    collectCoverage: !!process.env.npm_config_coverage,
};

export default config;
