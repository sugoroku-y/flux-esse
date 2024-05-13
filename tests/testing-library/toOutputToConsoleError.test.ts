describe('toOutputToConsoleError', () => {
    const expected = [
        ['first', new Error('test#1')],
        ['second', new Error('test#2')],
    ];

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
        'no output': expect.failureMessage`
            expect(received).not.toOutputToConsoleError(expected)

            Expected: not []
            Received:     []
            `,
        'only one output': expect.failureMessage`
            expect(received).not.toOutputToConsoleError(expected)

            Expected: not [["first", [Error: test#1]]]
            Received:     [["first", [Error: test#1]]]
            `,
        'only two outputs': expect.failureMessage`
            expect(received).not.toOutputToConsoleError(expected)

            Expected: not [["first", [Error: test#1]], ["second", [Error: test#2]]]
            Received:     [["first", [Error: test#1]], ["second", [Error: test#2]]]
            `,
        'no output, but expected two outputs': expect.failureMessage`
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
        'only one output, but expected no output': expect.failureMessage`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 1
            + Received  + 6

            - Array []
            + Array [
            +   Array [
            +     "first",
            +     [Error: test#1],
            +   ],
            + ]
            `,
        'no output, but expected one output': expect.failureMessage`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 6
            + Received  + 1

            - Array [
            -   Array [
            -     "first",
            -     [Error: test#1],
            -   ],
            - ]
            + Array []
            `,
        'only one output, but expected two outputs': expect.failureMessage`
            expect(received).toOutputToConsoleError(expected)

            - Expected  - 4
            + Received  + 0

              Array [
                Array [
                  "first",
                  [Error: test#1],
                ],
            -   Array [
            -     "second",
            -     [Error: test#2],
            -   ],
              ]
            `,
        'only one output, but expected one different output': expect.failureMessage`
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
        'only two outputs, but expected one output': expect.failureMessage`
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
        'only two outputs, but expected no output': expect.failureMessage`
            expect(received).toOutputToConsoleError(expected)

            - Expected  -  1
            + Received  + 10

            - Array []
            + Array [
            +   Array [
            +     "first",
            +     [Error: test#1],
            +   ],
            +   Array [
            +     "second",
            +     [Error: test#2],
            +   ],
            + ]
            `,
    };

    describe.each(['success', 'failure'] as const)('%s', (result) => {
        describe.each([
            'no output',
            'only one output',
            'only two outputs',
            'no output, but expected one output',
            'no output, but expected two outputs',
            'only one output, but expected no output',
            'only one output, but expected one different output',
            'only one output, but expected two outputs',
            'only two outputs, but expected no output',
            'only two outputs, but expected one output',
        ] as const)('%s', (title) => {
            // 実際に出力する数
            const times = ['no output', 'only one', 'only two'].findIndex((e) =>
                title.startsWith(e),
            );
            // differentのときは期待値をずらす
            const startIndex = title.includes('different') ? 1 : 0;
            // 期待値の終端 = 期待値の開始位置 + 期待値の出力数
            const endIndex =
                startIndex +
                ({ no: 0, one: 1, two: 2 }[
                    /, but expected (\w+)/.exec(title)?.[1] ?? ''
                ] ?? times);
            const proc = () => {
                for (let i = 0; i < times; i += 1) {
                    console.error(...expected[i]);
                }
            };
            const expectedLog = expected.slice(startIndex, endIndex);
            // 成功のテストで期待値が異なるときは反転する
            const isNot =
                (result === 'success') === title.includes('but expected');
            // テスト失敗時のメッセージ
            const message = messages[title];
            test('sync', () => {
                const exp = () =>
                    not(proc, isNot).toOutputToConsoleError(...expectedLog);
                if (result === 'success') {
                    exp();
                } else {
                    expect(exp).toThrow(message);
                }
            });
            test.each(['async', 'promise'] as const)('%s', async (type) => {
                const exp = not(asynchronize(proc, type), isNot)
                    //
                    .toOutputToConsoleError(...expectedLog);
                if (result === 'success') {
                    await exp;
                } else {
                    await expect(exp).rejects.toThrow(message);
                }
            });
        });
    });
    describe.each`
        before   | after
        ${true}  | ${true}
        ${true}  | ${false}
        ${false} | ${true}
        ${false} | ${false}
    `(
        'exception {before:$before,after:$after}',
        ({ before, after }: { before: boolean; after: boolean }) => {
            const proc = exception({ before, after });
            test('sync', () => {
                expect(() =>
                    expect(proc).toOutputToConsoleError(expected),
                ).toThrow(expectedException);
                expect(() =>
                    expect(proc).not.toOutputToConsoleError(expected),
                ).toThrow(expectedException);
            });
            test.each(['async', 'promise'] as const)('%s', async (type) => {
                const asyncProc = asynchronize(proc, type);
                await expect(
                    expect(asyncProc).toOutputToConsoleError(expected),
                ).rejects.toThrow(expectedException);
                await expect(
                    expect(asyncProc).not.toOutputToConsoleError(expected),
                ).rejects.toThrow(expectedException);
            });
        },
    );
});

function asynchronize(proc: () => void, type: 'async' | 'promise') {
    const f = async () => {
        await Promise.resolve();
        proc();
    };
    return type === 'async' ? f : f();
}

function not<T>(actual: T, isNot: boolean) {
    const exp = expect(actual);
    return isNot ? exp.not : exp;
}
