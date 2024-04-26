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

/**
 * {@link createFluxEsseContext}の返す型です。
 *
 * コンテキストを利用できるようにするためのProviderと、デバッグ情報などで表示されるコンテキストの名前を持ちます。
 * @interface FluxEsseContext
 * @template Store
 */
export interface FluxEsseContext<Store extends object> {
    /**
     * コンテキストを利用できるようにするためのProviderです。
     * @example
     * const SampleContext = createFluxEsseContext({
     *     // ...
     * }, (_, {change}) => {
     *     useEffect(() => {
     *         change('test');
     *     }, [])
     * });
     * function PageComponent() {
     *     return (
     *         <SampleContext.Provider>
     *             <Sample1Component />
     *             <Sample2Component />
     *             {...}
     *         </SampleContext.Provider>
     *     );
     * }
     */
    readonly Provider: Provider<Store>;
    /**
     * デバッグ情報などで表示されるコンテキストの名前です。
     *
     * 変更することで名前が変わるところがあるかも知れません。
     * @default 'FluxEsseContext'
     *
     * Reactのコンテキストにある`displayName`と違い、初期状態で設定されているため、オプショナルではありません。
     */
    displayName: string;
}

/**
 * WeakMapをFluxEsseContextとReactのContextを関連付けるマップ専用にしたものです。
 *
 * 引数で指定したcontextが使用するStoreと対応するOriginalContext<Store>を取得・設定します。
 * @interface ContextMap
 */
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

/**
 * FluxEsseContextとReactのContextを関連付けるマップ。
 *
 * 不要になったあとにガーベージコレクトされるようにWeakMapを使用する。
 */
const contextMap = new WeakMap() as ContextMap;

/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param StoreClass 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキスト
 *
 * StoreClassとして1つもハンドラーを持たないクラスを指定すると返値の型がnever型となり、
 * コンテキストとして利用できなくなります。
 * @example
 * const SampleContext = createFluxEsseContext(
 *     class {
 *         text = '';
 *         count = 0;
 *         change(newText: string) {
 *             this.text = newText;
 *         }
 *         increment() {
 *             this.count += 1;
 *         },
 *     },
 *     ({text}, {increment}) => {
 *         // textが変更されたらcountを1つ増やす
 *         useEffect(
 *             () => {
 *                 increment();
 *             },
 *             [text, increment]
 *         );
 *     },
 * });
 */
export function createFluxEsseContext<Store extends object>(
    StoreClass: new () => Store,
    hooks?: (...value: StoreAndActions<Store>) => void,
): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 *
 * [^3]: 返値のコンテキストにあるProviderがレンダリングされたあと、initialStoreに指定したオブジェクトは変更不可になります。
 * @param initialStore 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つオブジェクトです。[^3]
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキスト
 *
 * initialStoreとして1つもハンドラーを持たないオブジェクトを指定すると返値の型がnever型となり、
 * コンテキストとして利用できなくなります。
 * @example
 * const SampleContext = createFluxEsseContext(
 *     {
 *         text: '',
 *         count: 0,
 *         change(newText: string) {
 *             this.text = newText;
 *         },
 *         increment() {
 *             this.count += 1;
 *         },
 *     },
 *     ({text}, {increment}) => {
 *         // textが変更されたらcountを1つ増やす
 *         useEffect(
 *             () => {
 *                 increment();
 *             },
 *             [text, increment]
 *         );
 *     },
 * );
 */
export function createFluxEsseContext<Store extends object>(
    initialStore: Store,
    hooks?: (...value: StoreAndActions<Store>) => void,
): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキスト
 * @hidden
 * @remark 別のカスタムフックなどから呼び出す際に使用するシグネチャーです。
 * @example
 * function useSomthing<Store extends object>(
 *     storeSpec: Store | (new () => Store),
 * ) {
 *    // storeSpecが正しく型判定されるように型パラメーターを指定する
 *    const context = createFluxEsseContext<Store>(storeSpec);
 *    // ...
 * }
 */
export function createFluxEsseContext<Store extends object>(
    storeSpec: Store | (new () => Store),
    hooks?: (...value: StoreAndActions<Store>) => void,
): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキスト
 * @remark createFluxEsseContextの実装
 */
export function createFluxEsseContext<Store extends object>(
    storeSpec: Store | (new () => Store),
    hooks?: (...value: StoreAndActions<Store>) => void,
): FluxEsseContext<Store> {
    const original = createContext<StoreAndActions<Store> | undefined>(
        undefined,
    );
    original.displayName = 'FluxEsseContext';
    const Provider = createProvider(storeSpec, original, hooks);
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
    hooks?: (...value: StoreAndActions<Store>) => void,
): Provider<Store> {
    // デバッグ時などでコンポーネントとして表示する際に使われるため、
    // アロー関数ではなく関数式にして名前を明示的に付けておく
    return function Provider(props) {
        const value = useStoreAndActions<Store>(storeSpec);
        hooks?.(...(value as StoreAndActions<Store>));
        return createElement(original, { value, ...props });
    };
}

/**
 * {@link createFluxEsseContext}で生成したコンテキストからStoreとActionを取得します。
 * @param context {@link createFluxEsseContext}で生成したコンテキスト
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、Storeからはハンドラーが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 * @example
 * const [store, {change}] = useFluxEsseContext(SampleContext);
 * @throws 以下の場合に例外を投げます。
 *
 * - {@link createFluxEsseContext}で生成されていないコンテキストを指定した場合。
 * - FluxEsseContext.Providerの中ではない場所で使用された場合。
 */
export function useFluxEsseContext<Store extends object>(
    context: FluxEsseContext<Store>,
): StoreAndActions<Store> {
    const original =
        contextMap.get(context) ??
        error`context must be created with createFluxEsseContext.`;
    return (
        useContext(original) ??
        error`useFluxEsseContext must be used within the descendant component of ${context.displayName}.Provider.`
    );
}
