import { type Reducer, useReducer, useMemo } from 'react';
import { type Immutable, freeze, produce } from 'immer';

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

/**
 * シンプルなFLUXアーキテクチャを実現するカスタムフックです。
 * @param initialStore 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つオブジェクトです。
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
export function useStoreAndActions<Store extends object>(initialStore: Store) {
    const [store, dispatch] = useReducer(
        produce<Reducer<Immutable<Store>, ActionPayload>>(
            (draft, { type, payload }) => {
                (draft as HandlerMap)[type](...payload);
            },
        ),
        initialStore,
        (s) => freeze(s) as Immutable<Store>,
    );
    // Actionを限定する
    const actions = useMemo(
        () =>
            Object.freeze(
                Object.fromEntries(
                    Object.keys(store)
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
    return [store as ImmutableStore<Store>, actions as Actions<Store>] as const;
}
