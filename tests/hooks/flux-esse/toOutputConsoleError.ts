export function toOutputConsoleError(test: () => void, ...errors: unknown[][]) {
    const mock = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        test();
        expect(console.error).toHaveBeenCalledTimes(errors.length);
        for (let index = 1; index <= errors.length; index += 1) {
            expect(console.error).toHaveBeenNthCalledWith(
                index,
                ...errors[index - 1],
            );
        }
    } finally {
        mock.mockRestore();
    }
}
