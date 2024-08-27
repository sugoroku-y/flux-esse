"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasConstructor = hasConstructor;
/**
 * 指定のオブジェクトが`constructor`という名前でコンストラクターを保持しているかどうかを確認します。
 * @param target 対象のオブジェクト
 * @returns コンストラクターを保持していれば真。
 */
function hasConstructor(target) {
    return (typeof target.constructor === 'function' &&
        (target.constructor.prototype === target ||
            target instanceof target.constructor));
}
//# sourceMappingURL=hasConstructor.js.map