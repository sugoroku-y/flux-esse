"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPropertyKeys = void 0;
const hasConstructor_1 = require("./hasConstructor");
const prototypes_1 = require("./prototypes");
/**
 * 指定したオブジェクトが持つプロパティのキーを列挙します。
 * @param target プロパティのキーを列挙する対象のオブジェクト
 * @yields targetが持つプロパティのキー
 *
 * ただし、ビルトインクラス(e.g., Object, Date, RegExp)の持つメソッドやプロパティのキー(e.g., toString, __proto__)は除きます。
 */
function* getAllPropertyKeys(target) {
    const yielded = new Set();
    if ((0, hasConstructor_1.hasConstructor)(target)) {
        // コンストラクタは除外します。
        yielded.add('constructor');
    }
    for (const obj of (0, prototypes_1.prototypes)(target)) {
        for (const key of Reflect.ownKeys(obj)) {
            // 派生クラス側で列挙済のメンバーは除外します。
            if (!yielded.has(key)) {
                yield key;
                yielded.add(key);
            }
        }
    }
}
exports.getAllPropertyKeys = getAllPropertyKeys;
//# sourceMappingURL=getAllPropertyKeys.js.map