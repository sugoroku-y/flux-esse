import { type Dispatch, useReducer, useMemo } from 'react';
import { type Immutable, freeze, produce, isDraftable, immerable } from 'immer';
import { assert } from '../../utils/assert';
import { getAllPropertyKeys } from '../../utils/getAllPropertyKeys';

interface ActionPayload {
    type: PropertyKey;
    payload: unknown[];
}

type HandlerMap = Record<PropertyKey, (...payload: unknown[]) => void>;

type Action = (...payload: unknown[]) => void;

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

/**
 * useStoreAndActionsの返値となる型。
 */
export type StoreAndActions<Store extends object> = readonly [
    ImmutableStore<Store>,
    Actions<Store>,
];

/**
 * StoreがActionに応じて処理を行うメソッドを持たない場合に、neverにします。
 */
export type Validation<Store extends object, T> = [ReducibleTypes<Store>] extends [
    never,
]
    ? never
    : T;

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
): Validation<Store, StoreAndActions<Store>>;
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
): Validation<Store, StoreAndActions<Store>>;
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
): Validation<Store, StoreAndActions<Store>>;
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
        () => Object.freeze(Object.fromEntries(actionEntries(store, dispatch))),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回だけ実行するために空配列を指定します。
        [],
    );
    return [store, actions as Actions<Store>];
}

const reducer: <Store>(previous: Store, action: ActionPayload) => Store =
    produce((draft, { type, payload }) => {
        (draft as HandlerMap)[type](...payload);
    });

function initializer<Store extends object>(
    storeSpec: Store | (new () => Store),
): Immutable<Store> {
    // クラスのときはnewしてインスタンス化します。
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

function* actionEntries<Store extends object>(
    store: Store,
    dispatch: Dispatch<ActionPayload>,
): Generator<[PropertyKey, Action], void, undefined> {
    let valid;
    for (const type of getAllPropertyKeys(store)) {
        if (typeof store[type] === 'function') {
            yield [
                // Actionの種類
                type,
                // Action発行用メソッド
                (...payload) => dispatch({ type, payload }),
            ];
            valid = true;
        }
    }
    assert(valid, 'The store must have one or more action handler.');
}
