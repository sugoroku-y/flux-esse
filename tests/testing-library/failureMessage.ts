function failureMessage(
    this: jest.MatcherContext,
    actual: unknown,
    expected: string,
): jest.CustomMatcherResult {
    return {
        pass: this.equals(
            expected,
            actual instanceof Error
                ? actual.message
                      // メッセージからエスケープシーケンスを取り除く
                      .replace(/(?:\x1b\[(?:\d+(?:;\d+)*)? ?[A-Za-z])*/g, '')
                : // 投げられた例外がError以外だった場合はそのまま
                  String(actual),
        ),
        message: () => '', // asymmetric matcherのときはpassしか見てないので省略
    };
}

expect.extend({ failureMessage });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- jestの拡張
    namespace jest {
        interface Expect {
            failureMessage(expected: string): undefined;
        }
    }
}

export {};
