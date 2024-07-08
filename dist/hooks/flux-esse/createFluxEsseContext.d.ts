import { type ComponentProps, type Context, type ReactNode } from 'react';
import { type StoreAndActions, type Validation } from './useStoreAndActions';
/** ReactのコンテキストをStoreから生成します。 */
type OriginalContext<Store extends object> = Context<StoreAndActions<Store> | undefined>;
/**
 * コンテキストを提供するためのコンポーネントのプロパティです。
 *
 * ReactのProviderとは違いvalueプロパティを持ちません。
 */
type ProviderProps<Store extends object> = Omit<ComponentProps<OriginalContext<Store>['Provider']>, 'value'>;
/** コンテキストを提供するためのコンポーネントです。 */
type Provider<Store extends object> = (props: ProviderProps<Store>) => ReactNode;
/**
 * {@link createFluxEsseContext}の返す型です。
 *
 * コンテキストを利用できるようにするためのProviderと、デバッグ情報などで表示されるコンテキストの名前を持ちます。
 * @template Store
 */
interface FluxEsseContext<Store extends object> {
    /**
     * コンテキストを利用できるようにするためのProviderコンポーネントです。
     *
     * ReactのProviderコンポーネントとは違いvalueプロパティを持ちません。
     * @example
     * const SampleContext = createFluxEsseContext({ ... });
     * function SamplePage() {
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
     * Reactのコンテキストが持つ `displayName` とは違い、初期状態で設定されているため、オプショナルではありません。
     */
    displayName: string;
}
/** コンテキストを提供するProviderがレンダリングされたタイミングで呼び出されるフックです。 */
type Hooks<Store extends object> = (...value: StoreAndActions<Store>) => void;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param StoreClass 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキストを返します。
 *
 * StoreClassが1つもハンドラーを持たない場合、返値の型がnever型となり、
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
 *         }
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
export declare function createFluxEsseContext<Store extends object>(StoreClass: new () => Store, hooks?: Hooks<Store>): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 *
 * [^3]: 返値のコンテキストにあるProviderがレンダリングされたあと、initialStoreに指定したオブジェクトは変更不可になります。
 * @param initialStore 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つオブジェクトです。[^3]
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキストを返します。
 *
 * initialStoreが1つもハンドラーを持たない場合、返値の型がnever型となり、
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
export declare function createFluxEsseContext<Store extends object>(initialStore: Store, hooks?: Hooks<Store>): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキストを返します。
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
export declare function createFluxEsseContext<Store extends object>(storeSpec: Store | (new () => Store), hooks?: Hooks<Store>): Validation<Store, FluxEsseContext<Store>>;
/**
 * {@link createFluxEsseContext}で生成したコンテキストからStoreとActionを取得します。
 * @param context {@link createFluxEsseContext}で生成したコンテキスト
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、Storeからはハンドラーが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 *
 * contextが{@link createFluxEsseContext}で生成されていない場合や、
 * contextを作成したときの{@link createFluxEsseContext}に指定されたStoreが1つもハンドラーを持たない場合、
 * 返値の型がnever型となり、StoreやActionが利用できなくなります。
 * @example
 * const [store, {change}] = useFluxEsseContext(SampleContext);
 * @throws 以下の場合に例外を投げます。
 *
 * - {@link createFluxEsseContext}で生成されていないコンテキストを指定した場合。
 * - FluxEsseContext.Providerの中ではない場所で使用された場合。
 */
export declare function useFluxEsseContext<Store extends object>(context: FluxEsseContext<Store>): Validation<Store, StoreAndActions<Store>>;
export {};
//# sourceMappingURL=createFluxEsseContext.d.ts.map