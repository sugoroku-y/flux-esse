import { isPrototypeOfBuiltIn } from './isPrototypeOfBuiltIn';

/**
 * 指定したオブジェクトのプロトタイプを遡っていく
 *
 * ビルトインクラス(e.g., Object, Date, RegExp)のプロトタイプに到達すると終了する。
 * @param target 開始するオブジェクト
 * @yields オブジェクトのプロトタイプ
 */
export function* prototypes(
    target: object,
): Generator<object, void, undefined> {
    for (
        let obj = target;
        obj != null && !isPrototypeOfBuiltIn(obj);
        obj = Object.getPrototypeOf(obj) as typeof target
    ) {
        yield obj;
    }
}
