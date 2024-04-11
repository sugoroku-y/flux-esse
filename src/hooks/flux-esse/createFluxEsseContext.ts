import {
    type ComponentProps,
    type Context,
    type ReactNode,
    createContext,
    createElement,
    useContext,
    useEffect,
} from 'react';
import { error } from '../../utils/error';
import {
    type Actions,
    type StoreAndActions,
    type Validation,
    useStoreAndActions,
} from './useStoreAndActions';

type OriginalContext<Store extends object> = Context<
    StoreAndActions<Store> | undefined
>;

type ProviderProps<Store extends object> = {
    initialize?: (actions: Actions<Store>) => void;
} & Omit<ComponentProps<OriginalContext<Store>['Provider']>, 'value'>;
type Provider<Store extends object> = (
    props: ProviderProps<Store>,
) => ReactNode;

interface FluxEsseContext<Store extends object> {
    readonly Provider: Provider<Store>;
    displayName: string;
}

interface ContextMap
    extends WeakMap<FluxEsseContext<object>, OriginalContext<object>> {
    get<Store extends object>(
        context: FluxEsseContext<Store>,
    ): OriginalContext<Store> | undefined;
    set<Store extends object>(
        context: FluxEsseContext<Store>,
        original: OriginalContext<Store>,
    ): this;
}

const contextMap = new WeakMap() as ContextMap;

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
    const Provider = createProvider(storeSpec, original);
    const context = {
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
    contextMap.set(context, original);
    return context;
}

function createProvider<Store extends object>(
    storeSpec: Store | (new () => Store),
    { Provider: original }: OriginalContext<Store>,
): Provider<Store> {
    return function Provider({ initialize, ...props }) {
        const value = useStoreAndActions<Store>(storeSpec);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回だけ実行する
        useEffect(() => initialize?.(value[1]), []);
        return createElement(original, { value, ...props });
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
    const original =
        contextMap.get(context) ??
        error`Specify the context created by createFluxEsseContext`;
    return (
        useContext(original) ??
        error`Use useFluxEsseContext inside ${context.displayName}.Provider`
    );
}
