"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPrototypeOfBuiltIn = void 0;
/**
 * ビルトインクラスのプロトタイプであるかどうかを判別します。
 * @param obj 対象のオブジェクト
 * @returns ビルトインクラスのプロトタイプであれば真。
 */
function isPrototypeOfBuiltIn(obj) {
    return (Object.hasOwn(obj, 'constructor') &&
        typeof obj.constructor === 'function' &&
        obj.constructor.prototype === obj &&
        /\{\s*\[native code\]\s*\}\s*$/.test(Function.prototype.toString.call(obj.constructor)));
}
exports.isPrototypeOfBuiltIn = isPrototypeOfBuiltIn;
//# sourceMappingURL=isPrototypeOfBuiltIn.js.map