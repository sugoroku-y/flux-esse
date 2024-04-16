function toOutputToConsoleError(
    this: jest.MatcherContext,
    received: () => unknown,
    ...errors: unknown[][]
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
    const { utils, isNot, promise } = this;
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
            // テストに失敗したときのメッセージをそのままmessageで返す
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
        if (!isNot) {
            // notでなければテストに成功しているのでメッセージは不要
            return {
                pass: true,
                message() {
                    return '';
                },
            };
        }
        // スコープを抜けると破棄されているかもしれないのでここで文字列化しておく
        const expected = utils.stringify(errors);
        const received = utils.stringify(mock.mock.calls);
        return {
            pass: true,
            message() {
                return `
                    ${utils.matcherHint(
                        'toOutputToConsoleError',
                        '() => {...}',
                        '[[...], ...]',
                        { isNot, promise },
                    )}

                    Expected: not ${utils.EXPECTED_COLOR(expected)}
                    Received:     ${utils.RECEIVED_COLOR(received)}
                    `.replaceAll(/(?:^\n|(\n)) +/g, '$1');
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
            ): T extends (...a: never) => Promise<unknown> ? Promise<R> : R;
        }
    }
}
export {};
