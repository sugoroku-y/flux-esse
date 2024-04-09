import { useReducer, useMemo } from 'react';
import { type Immutable, freeze, produce, isDraftable, immerable } from 'immer';

interface ActionPayload {
    type: PropertyKey;
    payload: unknown[];
}

type HandlerMap = Record<PropertyKey, (...payload: unknown[]) => void>;

type ReducibleTypes<Store extends object> = keyof {
    [Type in keyof Store as Store[Type] extends (
        ...payload: infer Payload
    ) => infer ReturnType
        ? Payload extends unknown[]
            ? ReturnType extends void
                ? Type
                : never
            : never
        : never]: 0;
};
type Actions<Store extends object> = Readonly<
    Pick<Store, ReducibleTypes<Store>>
>;
type ImmutableStore<Store extends object> = Immutable<
    Omit<Store, ReducibleTypes<Store>>
>;

type StoreAndActions<Store extends object> = readonly [
    ImmutableStore<Store>,
    Actions<Store>,
];

/**
 * シンプルなFLUXアーキテクチャを実現するカスタムフックです。
 * @param StoreClass 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つクラスです。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、StoreからはActionに応じて処理を行うメソッドが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 * @example
 * const [store, {change}] = useStoreAndActions({
 */
export function useStoreAndActions<Store extends object>(
    StoreClass: new () => Store,
): StoreAndActions<Store>;
/**
 * シンプルなFLUXアーキテクチャを実現するカスタムフックです。
 * @param storeSpec 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つオブジェクトです。
 *
 * このカスタムフックを呼び出したあと変更不可になるので注意してください。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、StoreからはActionに応じて処理を行うメソッドが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 * @example
 * const [store, {change}] = useStoreAndActions({
 */
export function useStoreAndActions<Store extends object>(
    storeSpec: Store,
): StoreAndActions<Store>;
/**
 * シンプルなFLUXアーキテクチャを実現するカスタムフックです。
 * @param storeSpec 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つオブジェクト、もしくはクラスです。
 *
 * オブジェクトを指定した場合は、このカスタムフックを呼び出したあと変更不可になるので注意してください。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、StoreからはActionに応じて処理を行うメソッドが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 * @example
 * const [store, {change}] = useStoreAndActions({
 */
export function useStoreAndActions<Store extends object>(
    storeSpec: Store | (new () => Store),
): StoreAndActions<Store>;
/**
 * useStoreAndActionsの実装
 * @param storeSpec 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つオブジェクト、もしくはクラスです。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 */
export function useStoreAndActions<Store extends object>(
    storeSpec: Store | (new () => Store),
): StoreAndActions<Store> {
    const [store, dispatch] = useReducer(
        reducer<Immutable<Store>>,
        storeSpec,
        initializer,
    );
    // Actionを限定する
    const actions = useMemo(
        () =>
            Object.freeze(
                Object.fromEntries(
                    Array.from(getAllPropertyKeys(store))
                        .filter(
                            (type) =>
                                typeof (store as HandlerMap)[type] ===
                                'function',
                        )
                        .map((type) => [
                            type,
                            (...payload: unknown[]) =>
                                dispatch({ type, payload }),
                        ]),
                ),
            ),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回だけ実行する
        [],
    );
    return [store as ImmutableStore<Store>, actions as Actions<Store>];
}

const reducer: <Store>(previous: Store, action: ActionPayload) => Store =
    produce((draft, { type, payload }) => {
        (draft as HandlerMap)[type](...payload);
    });

function initializer<Store extends object>(
    storeSpec: Store | (new () => Store),
): Immutable<Store> {
    // クラスのときはnewしてインスタンス化
    const initialStore =
        typeof storeSpec === 'function' ? new storeSpec() : storeSpec;
    if (!isDraftable(initialStore)) {
        // produceで扱えるようにimmerableをtrueに設定します。
        Object.defineProperty(initialStore, immerable, { value: true });
    }
    // 初期状態から変更不可になるように再帰的にfreezeしておきます。
    freeze(initialStore, true);
    // freezeしたのでImmutableにキャストして返します。
    return initialStore as Immutable<Store>;
}

function* getAllPropertyKeys<Target extends object>(
    target: Target,
): Generator<keyof Target, void, undefined> {
    const yielded = new Set();
    if (
        typeof target.constructor === 'function' &&
        (target.constructor.prototype === target ||
            target instanceof target.constructor)
    ) {
        // コンストラクタは除外します。
        yielded.add('constructor');
    }
    for (
        let obj = target;
        obj != null && obj !== Object.prototype;
        obj = Object.getPrototypeOf(obj)
    ) {
        for (const key of Reflect.ownKeys(obj) as Array<keyof Target>) {
            if (yielded.has(key)) {
                // 派生クラス側で列挙済のメンバーは除外します。
                continue;
            }
            yield key;
            yielded.add(key);
        }
    }
}
