/**
 * ビルトインクラスのプロトタイプであるかどうかを判別します。
 * @param obj 対象のオブジェクト
 * @returns ビルトインクラスのプロトタイプであれば真。
 */
export function isPrototypeOfBuiltIn(obj: object) {
    return (
        Object.hasOwn(obj, 'constructor') &&
        typeof obj.constructor === 'function' &&
        obj.constructor.prototype === obj &&
        /\{\s*\[native code\]\s*\}\s*$/.test(String(obj.constructor))
    );
}
