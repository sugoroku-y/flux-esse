/**
 * 指定したオブジェクトが持つプロパティのキーを列挙します。
 * @param target プロパティのキーを列挙する対象のオブジェクト
 * @yields targetが持つプロパティのキー
 *
 * ただし、ビルトインクラス(e.g., Object, Date, RegExp)の持つメソッドやプロパティのキー(e.g., toString, __proto__)は除きます。
 */
export declare function getAllPropertyKeys<Target extends object>(target: Target): Generator<keyof Target, void, undefined>;
//# sourceMappingURL=getAllPropertyKeys.d.ts.map