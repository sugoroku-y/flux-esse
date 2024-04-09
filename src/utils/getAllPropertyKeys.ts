import { hasConstructor } from './hasConstructor';
import { prototypes } from './prototypes';

/**
 * 指定したオブジェクトが持つプロパティのキーを列挙します。
 * @param target プロパティのキーを列挙する対象のオブジェクト
 * @yields targetが持つプロパティのキー
 *
 * ただし、Objectの持つメソッドやプロパティのキー(e.g., toString, __proto__)は除きます。
 */
export function* getAllPropertyKeys<Target extends object>(
    target: Target,
): Generator<keyof Target, void, undefined> {
    const yielded = new Set();
    if (hasConstructor(target)) {
        // コンストラクタは除外します。
        yielded.add('constructor');
    }
    for (const obj of prototypes(target)) {
        for (const key of Reflect.ownKeys(obj)) {
            // 派生クラス側で列挙済のメンバーは除外します。
            if (!yielded.has(key)) {
                yield key as keyof Target;
                yielded.add(key);
            }
        }
    }
}
