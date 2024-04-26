import { unescape } from './unescape';

export function indented({ raw }: TemplateStringsArray, ...values: unknown[]): string {
    // 最後の改行から終端までが空白とタブだけであればその空白とタブの連続をインデントと見なす
    const indent = /\n[ \t]+$/.exec(raw[raw.length - 1])?.[0];
    const template =
        indent && raw[0].startsWith(indent)
            ? // 先頭が終端と同じ改行とインデントで始まっていればインデント除去とエスケープ解除
              unindentAndUnescape(raw, indent)
            : // でなければエスケープ解除のみ
              unescapeOnly(raw);
    // テンプレートリテラルを連結
    return values.reduce<string>(
        (r, v, i) => r.concat(String(v), template(i + 1)),
        template(0),
    );
}

function unindentAndUnescape(template: readonly string[], indent: string) {
    return (i: number) =>
        unescape(
            trimNewLine(
                template[i].replaceAll(indent, '\n'),
                i,
                template.length,
            ),
        );
}

function unescapeOnly(template: readonly string[]) {
    return (i: number) => unescape(template[i]);
}

function trimNewLine(t: string, i: number, length: number): string {
    return t.replace(
        length === 1
            ? // templateが一つしかない場合、先頭と終端両方を除去する
              /^\n|\n$/g
            : i === 0
              ? // 先頭の改行を除去
                /^\n/
              : i === length - 1
                ? // 終端の改行を除去
                  /\n$/
                : // 改行を消す必要がない場合は絶対にマッチしないパターンにする
                  /^(?=.)$/,
        '',
    );
}
