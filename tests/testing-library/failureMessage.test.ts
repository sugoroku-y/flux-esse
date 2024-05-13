describe('failureMessage', () => {
    test('thrown non error', () => {
        expect(() => {
            throw 'test';
        }).toThrow(expect.failureMessage`test`);
    });
});
