/**
 * 指定したオブジェクトのプロトタイプを遡っていく
 *
 * ビルトインクラス(e.g., Object, Date, RegExp)のプロトタイプに到達すると終了する。
 * @param target 開始するオブジェクト
 * @yields オブジェクトのプロトタイプ
 */
export declare function prototypes(target: object): Generator<object, void, undefined>;
//# sourceMappingURL=prototypes.d.ts.map