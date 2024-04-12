function toOutputToConsoleError(
    this: jest.MatcherContext,
    received: () => unknown,
    ...errors: unknown[][]
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
    const mock = jest.spyOn(console, 'error').mockImplementation(() => {});
    let awaiting;
    try {
        const result = received();
        if (result instanceof Promise) {
            awaiting = true;
            return (async () => {
                try {
                    await result;
                    return test();
                } finally {
                    mock.mockRestore();
                }
            })();
        }
        return test();
    } finally {
        if (!awaiting) {
            mock.mockRestore();
        }
    }
    function test() {
        try {
            expect(console.error).toHaveBeenCalledTimes(errors.length);
            for (let index = 1; index <= errors.length; index += 1) {
                expect(console.error).toHaveBeenNthCalledWith(
                    index,
                    ...errors[index - 1],
                );
            }
        } catch (ex) {
            return {
                pass: false,
                message() {
                    return String(
                        (typeof ex === 'object' &&
                            ex &&
                            'message' in ex &&
                            ex.message) ||
                            ex,
                    );
                },
            };
        }
        return {
            pass: true,
            message() {
                return '';
            },
        };
    }
}

expect.extend({ toOutputToConsoleError });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- jestの拡張
    namespace jest {
        interface Matchers<R, T> {
            toOutputToConsoleError(
                ...errors: T extends () => void
                    ? unknown[][]
                    : [] & { message: `expectには関数を指定してください` }
            ): R;
        }
    }
}
export {};
