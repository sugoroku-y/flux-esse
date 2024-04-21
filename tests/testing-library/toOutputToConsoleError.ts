import { indented } from './indented';
import { isPromiseLike } from './isPromiseLike';

function toOutputToConsoleError(
    this: jest.MatcherContext,
    received: PromiseLike<unknown> | (() => unknown),
    ...errors: unknown[][]
): jest.CustomMatcherResult | Promise<jest.CustomMatcherResult> {
    const { utils, isNot, promise } = this;
    if (jest.isMockFunction(console.error)) {
        throw new Error(
            'already console.error mocked! Maybe the function `act` is not enclosed in {}?',
        );
    }
    const mock = jest.spyOn(console, 'error').mockImplementation(() => {});
    let awaiting;
    try {
        const result = typeof received === 'function' ? received() : received;
        if (!isPromiseLike(result)) {
            return testConsoleError(this, mock, errors);
        }
        awaiting = true;
        return (async () => {
            try {
                await result;
                return testConsoleError(this, mock, errors);
            } finally {
                mock.mockRestore();
            }
        })();
    } finally {
        if (!awaiting) {
            mock.mockRestore();
        }
    }
}

function testConsoleError(
    { utils, isNot, expand, equals }: jest.MatcherContext,
    {
        mock: { calls: received },
    }: jest.SpyInstance<void, Parameters<typeof console.error>>,
    expected: unknown[][],
) {
    const pass = equals(expected, received);
    return {
        pass,
        message() {
            return indented`
                ${utils.matcherHint(...['toOutputToConsoleError', , , { isNot }])}

                ${
                    pass
                        ? indented`
                            Expected: not ${utils.printExpected(expected)}
                            Received:     ${utils.printReceived(received)}
                            `
                        : utils.printDiffOrStringify(
                              expected,
                              received,
                              'Expected',
                              'Received',
                              expand !== false,
                          )
                }
                `;
        },
    };
}

expect.extend({ toOutputToConsoleError });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- jestの拡張
    namespace jest {
        interface Matchers<R, T> {
            toOutputToConsoleError(
                ...errors: T extends PromiseLike<unknown>
                    ? unknown[][]
                    : T extends () => void
                      ? unknown[][]
                      : [] & {
                            message: `expectにはPromiseか関数を指定してください`;
                        }
            ): T extends PromiseLike<unknown>
                ? Promise<R>
                : T extends (...a: never) => Promise<unknown>
                  ? Promise<R>
                  : R;
        }
    }
}
