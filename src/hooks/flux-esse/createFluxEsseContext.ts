import {
    type ComponentProps,
    type Context,
    type ReactNode,
    createContext,
    createElement,
    useContext,
} from 'react';
import { error } from '../../utils/error';
import {
    type StoreAndActions,
    type Validation,
    useStoreAndActions,
} from './useStoreAndActions';

type OriginalContext<Store extends object> = Context<
    StoreAndActions<Store> | undefined
>;

type ProviderProps<Store extends object> = Omit<
    ComponentProps<OriginalContext<Store>['Provider']>,
    'value'
>;
type Provider<Store extends object> = (
    props: ProviderProps<Store>,
) => ReactNode;

interface FluxEsseContext<Store extends object> {
    readonly original: OriginalContext<Store>;
    readonly Provider: Provider<Store>;
    displayName: string;
}

/**
 * StoreとActionを扱うコンテキストを生成します。
 * @param StoreClass Storeの初期状態のクラス
 * @returns StoreとActionを扱うコンテキスト
 */
export function createFluxEsseContext<Store extends object>(
    StoreClass: new () => Store,
): Validation<Store, FluxEsseContext<Store>>;
/**
 * StoreとActionを扱うコンテキストを生成します。
 * @param initialStore Storeの初期状態のオブジェクトリテラル
 * @returns StoreとActionを扱うコンテキスト
 */
export function createFluxEsseContext<Store extends object>(
    initialStore: Store,
): Validation<Store, FluxEsseContext<Store>>;
/**
 * 別のカスタムフックなどからcreateFluxEsseContextを利用するためのシグネチャ。
 * @param storeSpec Storeの初期状態のオブジェクトリテラル、もしくはクラス
 * @returns StoreとActionを扱うコンテキスト
 */
export function createFluxEsseContext<Store extends object>(
    storeSpec: Store | (new () => Store),
): Validation<Store, FluxEsseContext<Store>>;
/**
 * createFluxEsseContextの実装
 * @param storeSpec Storeの初期状態のオブジェクトリテラル、もしくはクラス
 * @returns StoreとActionを扱うコンテキスト
 */
export function createFluxEsseContext<Store extends object>(
    storeSpec: Store | (new () => Store),
): FluxEsseContext<Store> {
    const original = createContext<StoreAndActions<Store> | undefined>(
        undefined,
    );
    original.displayName = 'FluxEsseContext';
    const Provider: Provider<Store> = (props) => {
        const value = useStoreAndActions<Store>(storeSpec);
        return createElement(original.Provider, { value, ...props });
    };
    return {
        get original() {
            return original;
        },
        get Provider() {
            return Provider;
        },
        get displayName() {
            return original.displayName ?? '';
        },
        set displayName(value) {
            original.displayName = value;
        },
    };
}

/**
 * createFluxEsseContextで生成したコンテキストからStoreとActionを取得する。
 * @param context createFluxEsseContextで生成したコンテキスト
 * @returns StoreとAction
 */
export function useFluxEsseContext<Store extends object>(
    context: FluxEsseContext<Store>,
): StoreAndActions<Store> {
    return (
        useContext(context.original) ??
        error`Use useContext inside ${context.original.displayName}.Provider`
    );
}
