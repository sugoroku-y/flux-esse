import { unescape } from './unescape';

export function indented(
    ...args: [TemplateStringsArray, ...unknown[]]
): string {
    const [{ raw: template }] = args;
    // 最後の改行から終端までが空白とタブだけであればその空白とタブの連続をインデントと見なす
    const indent = /\n[ \t]+$/.exec(template[template.length - 1])?.[0];
    const modifier =
        indent && template[0].startsWith(indent)
            ? // 先頭が終端と同じ改行とインデントで始まっていればインデント除去とエスケープ解除
              unindentAndUnescape(template.length, indent)
            : // でなければエスケープ解除のみ
              unescape;
    return (
        template
            // インデント除去
            .map(modifier)
            // テンプレートリテラルを連結
            .reduce((r, e, i) => r.concat(String(args[i]), e))
            // 先頭と終端の改行は削除
            .replace(/^\n|\n$/g, '')
    );
}

function unindentAndUnescape(length: number, indent: string) {
    return (t: string, i: number) =>
        unescape(trimNewLine(t.replaceAll(indent, '\n'), i, length));
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
                : // 改行を消す必要がない場合は置換が発生しないパターンにする
                  /^$/,
        '',
    );
}
