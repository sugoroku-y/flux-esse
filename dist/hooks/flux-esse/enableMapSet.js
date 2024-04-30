"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableMapSet = void 0;
const immer_1 = __importDefault(require("immer"));
/**
 * StoreのプロパティとしてES2015のMapやSetを持つとき、Actionのハンドラー内で変更できるようにします。
 * @remark Map/Setを扱えるようにするにはimmerを使用するモジュール内からのenableMapSetの呼び出しが必要になります。
 */
function enableMapSet() {
    immer_1.default.enableMapSet();
}
exports.enableMapSet = enableMapSet;
//# sourceMappingURL=enableMapSet.js.map