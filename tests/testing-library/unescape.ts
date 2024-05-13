/**
 * エスケープ文字のうち、定数から定数への変換を行うもののマップ
 */
const UNESCAPE_MAP = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    // 改行前に`\`があれば`\`ごと削除
    '\r': '',
    '\r\n': '',
    '\n': '',
    '\u2028': '', // Line Separator
    '\u2029': '', // Paragraph Separator
    // 8進数のエスケープ文字の中でも`\0`だけ(後ろに数字が続かないもの)は例外的に許可
    0: '\0',
    // `\`を除去するだけの変換
    "'": "'",
    '"': '"',
    '\\': '\\',
} as const;

export function unescape(s: string): string {
    return s.replace(
        /\\(?<ch>x(?<hex2>[0-9A-F]{2})|u(?<hex4>[0-9A-F]{4})|u\{0*?(?<hexCodePoint>[0-9A-F]{1,4}|(?:[1-9A-F]|10)[0-9A-F]{4})\}|0\d|\r\n|[^])/gi,
        //       ^^^^^^^^^^^^^^^^^^^^^                                                                                                      16進エスケープシーケンス
        //                             ^^^^^^^^^^^^^^^^^^^^^                                                                                Unicodeエスケープシーケンス
        //                                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^              Unicodeコードポイントエスケープ
        //                                                                                                                     ^^^          後ろに数字が続くため8進エスケープシーケンス(不正)と見なされる`\0`: 正規な方はその他の文字で吸収する
        //                                                                                                                         ^^^^     2文字の組合せの改行: 1文字だけのものはその他の文字で吸収する
        //                                                                                                                              ^^^ その他の文字: 不正なエスケープシーケンスを含む
        (...args) => {
            const [index, input, groups] = args.slice(-3) as [
                number,
                string,
                Partial<Record<string, string>>,
            ];
            const { ch, hex2, hex4, hexCodePoint } = groups;
            return (
                // 16進文字コードのエスケープシーケンス
                convertHexCodePoint(hex2 ?? hex4 ?? hexCodePoint) ??
                // 特定の文字のエスケープシーケンス
                UNESCAPE_MAP[ch as keyof typeof UNESCAPE_MAP] ??
                // ここにくるのは不正なエスケープシーケンスのときなのでログを出す
                (console.error(
                    `Unsupported escape sequence: ${input.slice(index).match(/^\S{1,80}/)?.[0]}`,
                ),
                // `\`だけ除去しておく
                ch)
            );
        },
    );
}

/**
 * 16進コードポイントを文字に変換します。
 * @param hex 16進コードポイント
 * @returns `hex`を16進コードポイントとして変換した文字を返します。
 *
 * ただし、`hex`が空文字列もしくは`undefined`のときは`undefined`を返します。
 * @throws 以下の場合に例外(`RangeError`)を投げます
 * - `hex`が`'10ffff'`を超えている
 * - `hex`が16進文字以外を含んでいる
 */
function convertHexCodePoint(hex?: string): string | undefined {
    return hex ? String.fromCodePoint(parseInt(hex, 16)) : undefined;
}