import { type Immutable } from 'immer';
/**
 * useReducerに指定するrecipeで使用するActionの型です。
 *
 * Actionを処理するハンドラーの名前と引数になります。
 */
interface ActionPayload {
    /** Actionを処理するハンドラーの名前。 */
    type: PropertyKey;
    /** Actionを処理するハンドラーに渡される引数。 */
    payload: unknown[];
}
/**
 * StoreからActionを処理するハンドラーの名前をUnion型として抽出します。
 *
 * Actionを処理するハンドラーとして見なされる条件は以下のとおりです。
 *
 * - publicにアクセス可能であること。
 * - インスタンスメソッドであること。
 * - 返値がvoid型であること。
 */
type ReducibleTypes<Store extends object> = keyof {
    [Type in keyof Store as Type extends ActionPayload['type'] ? Store[Type] extends (...payload: infer Payload) => infer ReturnType ? Payload extends ActionPayload['payload'] ? ReturnType extends void ? Type : never : never : never : never]: 0;
};
/**
 * Storeで処理可能なActionを発行するメソッド群です。
 *
 * 各メソッドはthisと関連付けられていないのでspread展開して利用できます。
 */
type Actions<Store extends object> = Readonly<Pick<Store, ReducibleTypes<Store>>>;
/**
 * StoreからActionを処理するハンドラーを取り除いた型です。
 *
 * 参照専用で変更不可になっています。
 */
type ImmutableStore<Store extends object> = Immutable<Omit<Store, ReducibleTypes<Store>>>;
/**
 * useStoreAndActionsの返値となる型です。
 */
export type StoreAndActions<Store extends object> = readonly [
    ImmutableStore<Store>,
    Actions<Store>
];
/**
 * Storeがハンドラーを持たない場合に、neverにします。
 */
export type Validation<Store extends object, T> = [
    ReducibleTypes<Store>
] extends [never] ? never : T;
/**
 * FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。
 *
 * [^1]: publicで返値がvoid型のインスタンスメソッドをActionを処理するハンドラーと見なします。
 * @param StoreClass 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つクラスです。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、Storeからはハンドラーが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 *
 * StoreClassが1つもハンドラーを持たない場合、返値の型がnever型となり、
 * StoreやActionが利用できなくなります。
 * @example
 * const [store, {change}] = useStoreAndActions(class {
 *     text = '';
 *     change(newText: string) {
 *         this.text = newText;
 *     }
 * });
 * @throws 以下の場合に例外を投げます。
 *
 * - StoreClassとして1つもハンドラーを持たないクラスが指定された場合。
 */
export declare function useStoreAndActions<Store extends object>(StoreClass: new () => Store): Validation<Store, StoreAndActions<Store>>;
/**
 * FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。
 *
 * [^2]: このカスタムフックを呼び出したあと、initialStoreに指定したオブジェクトは変更不可になります。
 * @param initialStore 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つオブジェクトです。[^2]
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 *
 * ただし、Storeからはハンドラーが除外されています。
 *
 * Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。
 *
 * initialStoreが1つもハンドラーを持たない場合、返値の型がnever型となり、
 * StoreやActionが利用できなくなります。
 * @example
 * const [store, {change}] = useStoreAndActions({
 *     text: '',
 *     change(newText: string) {
 *         this.text = newText;
 *     },
 * });
 * @throws 以下の場合に例外を投げます。
 *
 * - initialStoreとして1つもハンドラーを持たないオブジェクトが指定された場合。
 */
export declare function useStoreAndActions<Store extends object>(initialStore: Store): Validation<Store, StoreAndActions<Store>>;
/**
 * FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 * @hidden
 * @remark 別のカスタムフックなどから呼び出す際に使用するシグネチャーです。
 * @example
 * function useSomthing<Store extends object>(
 *     storeSpec: Store | (new () => Store),
 * ) {
 *    const [store, actions] = useStoreAndActions<Store>(storeSpec);
 *     // ...
 * }
 */
export declare function useStoreAndActions<Store extends object>(storeSpec: Store | (new () => Store)): Validation<Store, StoreAndActions<Store>>;
export {};
//# sourceMappingURL=useStoreAndActions.d.ts.map