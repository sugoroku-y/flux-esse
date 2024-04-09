/**
 * 指定のオブジェクトが`constructor`という名前でコンストラクターを保持しているかどうかを確認します。
 * @param target 対象のオブジェクト
 * @returns コンストラクターを保持していれば真。
 */
export function hasConstructor(target: object) {
    return (
        typeof target.constructor === 'function' &&
        (target.constructor.prototype === target ||
            target instanceof target.constructor)
    );
}
