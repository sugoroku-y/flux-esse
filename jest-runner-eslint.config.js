module.exports = {
    cliOptions: {
        // npm test --eslint-fixで実行すると修正可能な場所は自動的に修正される
        fix: process.env.npm_config_eslint_fix !== undefined,
    },
};
