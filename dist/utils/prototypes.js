"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prototypes = void 0;
const isPrototypeOfBuiltIn_1 = require("./isPrototypeOfBuiltIn");
/**
 * 指定したオブジェクトのプロトタイプを遡っていく
 *
 * ビルトインクラス(e.g., Object, Date, RegExp)のプロトタイプに到達すると終了する。
 * @param target 開始するオブジェクト
 * @yields オブジェクトのプロトタイプ
 */
function* prototypes(target) {
    for (let obj = target; obj != null && !(0, isPrototypeOfBuiltIn_1.isPrototypeOfBuiltIn)(obj); obj = Object.getPrototypeOf(obj)) {
        yield obj;
    }
}
exports.prototypes = prototypes;
//# sourceMappingURL=prototypes.js.map