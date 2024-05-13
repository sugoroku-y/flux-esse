import { indented } from './indented';

function failureMessage(
    this: jest.MatcherContext,
    actual: unknown,
    ...args: [TemplateStringsArray, ...unknown[]]
): jest.CustomMatcherResult {
    const expected = indented(...args);
    return {
        pass: this.equals(
            expected,
            hasProperty(actual, 'message')
                ? String(actual.message)
                      // メッセージからエスケープシーケンスを取り除く
                      .replace(/(?:\x1b\[(?:\d+(?:;\d+)*)? ?[A-Za-z])*/g, '')
                : // 投げられた例外がError以外だった場合はそのまま
                  String(actual),
        ),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- asymmetric matcherのときはpassしか見てないので省略
        message: undefined!,
    };
}

function hasProperty<KEY extends PropertyKey>(
    o: unknown,
    key: KEY,
): o is Record<KEY, unknown> {
    return typeof o === 'object' && o !== null && key in o;
}

expect.extend({ failureMessage });

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- jestの拡張
    namespace jest {
        interface Expect {
            failureMessage(
                template: TemplateStringsArray,
                ...values: unknown[]
            ): string;
        }
    }
}

export {};
