import { indented } from './indented';

describe('toOutputToConsoleError', () => {
    const expected = [
        ['first', new Error('test#1')],
        ['second', new Error('test#2')],
    ];

    const noop = () => {};
    const once = () => {
        console.error(...expected[0]);
    };
    const twice = () => {
        console.error(...expected[0]);
        console.error(...expected[1]);
    };
    const expectedException = new Error('test');
    const exception =
        ({ before, after }: { before?: boolean; after?: boolean } = {}) =>
        () => {
            if (before) {
                console.error(...expected[0]);
            }
            if (typeof jest === 'object') {
                Error.captureStackTrace(expectedException);
                throw expectedException;
            }
            if (after) {
                console.error(...expected[1]);
            }
        };

    const messages = {
        'only one time': indented`
            expect(received).not.toOutputToConsoleError(expected)

            Expected: not [["first", [Error: test#1]]]
            Received:     [["first", [Error: test#1]]]
            `,
        'only two times': indented`
            expect(received).not.toOutputToConsoleError(expected)

            Expected: not [["first", [Error: test#1]], ["second", [Error: test#2]]]
            Received:     [["first", [Error: test#1]], ["second", [Error: test#2]]]
            `,
        'no output, but expected two times': indented`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 10
            + Received  +  1

            - Array [
            -   Array [
            -     "first",
            -     [Error: test#1],
            -   ],
            -   Array [
            -     "second",
            -     [Error: test#2],
            -   ],
            - ]
            + Array []
            `,
        'only one time, but expected difference one': indented`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 2
            + Received  + 2

              Array [
                Array [
            -     "second",
            -     [Error: test#2],
            +     "first",
            +     [Error: test#1],
                ],
              ]
            `,
        'only two times, but expected one time': indented`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 0
            + Received  + 4

              Array [
                Array [
                  "first",
                  [Error: test#1],
                ],
            +   Array [
            +     "second",
            +     [Error: test#2],
            +   ],
              ]
            `,
    };

    describe.each([['sync'], ['async'], ['promise']])('%s', (type) => {
        describe.each([['success'], ['failure']])('%s', (result) => {
            test.each`
                title                                           | proc     | expected
                ${'only one time'}                              | ${once}  | ${expected.slice(0, 1)}
                ${'only two times'}                             | ${twice} | ${expected}
                ${'no output, but expected two times'}          | ${noop}  | ${expected}
                ${'only one time, but expected difference one'} | ${once}  | ${expected.slice(1)}
                ${'only two times, but expected one time'}      | ${twice} | ${expected.slice(0, 1)}
            `(
                '$title',
                async ({
                    title,
                    proc,
                    expected,
                }: {
                    title: keyof typeof messages;
                    proc: () => void;
                    expected: unknown[][];
                }) => {
                    const isNot = title.includes('but expected');
                    const message = messages[title];
                    if (type === 'sync') {
                        let exp:
                            | jest.Matchers<void, () => void>
                            | jest.JestMatchers<() => void> = expect(proc);
                        if ((result === 'success') === isNot && 'not' in exp) {
                            exp = exp.not;
                        }
                        const f = () => exp.toOutputToConsoleError(...expected);
                        if (result === 'success') {
                            f();
                        } else {
                            expect(f).toThrow(expect.failureMessage(message));
                        }
                    } else {
                        let exp:
                            | jest.JestMatchers<
                                  Promise<void> | (() => Promise<void>)
                              >
                            | jest.Matchers<
                                  void,
                                  Promise<void> | (() => Promise<void>)
                              > = expect(
                            type === 'async'
                                ? async () => {
                                      await Promise.resolve();
                                      proc();
                                  }
                                : Promise.resolve().then(proc),
                        );
                        if ((result === 'success') === isNot && 'not' in exp) {
                            exp = exp.not;
                        }
                        const f = exp.toOutputToConsoleError(...expected);
                        if (result === 'success') {
                            await f;
                        } else {
                            await expect(f).rejects.toThrow(
                                expect.failureMessage(message),
                            );
                        }
                    }
                },
            );
        });
        test.each`
            before   | after
            ${true}  | ${true}
            ${true}  | ${false}
            ${false} | ${true}
            ${false} | ${false}
        `(
            'exception {before:$before,after:$after}',
            async ({ before, after }: { before: boolean; after: boolean }) => {
                const proc = exception({ before, after });
                if (type === 'sync') {
                    expect(() =>
                        expect(proc).toOutputToConsoleError(expected),
                    ).toThrow(expectedException);
                } else {
                    const asyncProc =
                        type === 'async'
                            ? async () => {
                                  await Promise.resolve();
                                  proc();
                              }
                            : Promise.resolve().then(proc);
                    await expect(
                        expect(asyncProc).toOutputToConsoleError(expected),
                    ).rejects.toThrow(expectedException);
                }
            },
        );
    });
});
