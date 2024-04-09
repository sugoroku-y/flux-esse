import { type Dispatch, useReducer, useMemo } from 'react';
import { type Immutable, freeze, produce, isDraftable, immerable } from 'immer';

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

type StoreAndActions<Store extends object> = readonly [
    ImmutableStore<Store>,
    Actions<Store>,
];

type Validation<Store extends object, T> = [ReducibleTypes<Store>] extends [
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

function* getAllPropertyKeys<Target extends object>(
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

function hasConstructor(target: object) {
    return (
        typeof target.constructor === 'function' &&
        (target.constructor.prototype === target ||
            target instanceof target.constructor)
    );
}

function* prototypes(target: object): Generator<object, void, undefined> {
    for (
        let obj = target;
        obj != null && obj !== Object.prototype;
        obj = Object.getPrototypeOf(obj)
    ) {
        yield obj;
    }
}

/**
 * 値の確認を行い、falsyなら例外を投げます。
 * @param o 確認する値
 * @param message `o`がFalsyだったときに投げる例外に指定するメッセージ。
 *
 * 文字列、もしくは文字列を返す関数を指定する。省略可
 * @throws oがfalsyだった場合はmessageで指定される文字列で生成された例外を投げる
 */
export function assert(
    o: unknown,
    message?: string | (() => string),
): asserts o {
    if (!o) {
        const ex = new Error(
            typeof message === 'function' ? message() : message,
        );
        Error.captureStackTrace(ex, assert);
        throw ex;
    }
}
