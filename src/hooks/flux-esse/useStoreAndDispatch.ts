import { type Reducer, useReducer } from 'react';
import { type Immutable, freeze, produce } from 'immer';

interface ActionPayload {
    type: PropertyKey;
    payload: unknown[];
}

type HandlerMap = Record<PropertyKey, (...payload: unknown[]) => void>;

/**
 * シンプルなFLUXアーキテクチャを実現するカスタムフックです。
 * @param initialStore 初期状態のStoreのプロパティと受け取ったActionに応じて処理を行うメソッドを持つオブジェクトです。
 *
 * このカスタムフックを呼び出したあと変更不可になるので注意してください。
 * @returns Storeとdispatchメソッドを返します。
 */
export function useStoreAndDispatch<Store extends object>(initialStore: Store) {
    const [store, dispatch] = useReducer(
        produce<Reducer<Immutable<Store>, ActionPayload>>(
            (draft, { type, payload }) => {
                (draft as HandlerMap)[type](...payload);
            },
        ),
        initialStore,
        (s) => freeze(s) as Immutable<Store>,
    );
    return [store, dispatch] as const;
}
