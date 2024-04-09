/**
 * 値の確認を行い、falsyなら例外を投げます。
 * @param o 確認する値
 * @param message `o`がFalsyだったときに投げる例外に指定するメッセージ。
 *
 * 文字列、もしくは文字列を返す関数を指定する。省略可
 * @throws oがfalsyだった場合はmessageで指定される文字列で生成された例外を投げる
 */
export function assert(
    o: unknown,
    message?: string | (() => string),
): asserts o {
    if (!o) {
        const ex = new Error(
            typeof message === 'function' ? message() : message,
        );
        Error.captureStackTrace(ex, assert);
        throw ex;
    }
}
