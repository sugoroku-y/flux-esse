/**
 * 指定した文字列のメッセージを持つ例外を投げるタグ付きテンプレートリテラルです。
 * @param args テンプレートリテラルの引数
 * @throws 指定した文字列のメッセージを持つ例外を投げます。
 */
export function error(...args: [TemplateStringsArray, ...unknown[]]): never {
    const ex = new Error(
        args[0].reduce((r, e, i) => `${r}${String(args[i])}${e}`),
    );
    Error.captureStackTrace(ex, error);
    throw ex;
}
