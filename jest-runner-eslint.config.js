module.exports = {
    cliOptions: {
        // npm test --lint=fixで実行すると修正可能な場所は自動的に修正される
        fix: true, //process.env.npm_config_lint === 'fix',
    },
};
