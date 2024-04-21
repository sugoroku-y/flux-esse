import { unescape } from './unescape';

export function indented(
    ...args: [TemplateStringsArray, ...unknown[]]
): string {
    const [{ raw: template }] = args;
    // 最後の改行から終端までが空白とタブだけであればその空白とタブの連続をインデントと見なす
    const indent = /\n[ \t]+$/.exec(template[template.length - 1])?.[0];
    const unindent: (t: string) => string =
        indent && template[0].startsWith(indent)
            ? // 先頭が終端と同じ改行とインデントで始まっていればインデント除去とエスケープ解除
              (t) => unescape(t.replaceAll(indent, '\n'))
            : // でなければエスケープ解除のみ
              (t) => unescape(t);
    return (
        template
            // インデント除去
            .map(unindent)
            // テンプレートリテラルを連結
            .reduce((r, e, i) => r.concat(String(args[i]), e))
            // 先頭と終端の改行は削除
            .replace(/^\n|\n$/g, '')
    );
}
