import { type Dispatch, useReducer, useMemo } from 'react';
import { type Immutable, freeze, produce, isDraftable, immerable } from 'immer';
import { error } from '../../utils/error';
import { getAllPropertyKeys } from '../../utils/getAllPropertyKeys';

interface ActionPayload {
    type: PropertyKey;
    payload: unknown[];
}

type Action = (...payload: ActionPayload['payload']) => void;

type HandlerMap = Record<ActionPayload['type'], Action>;

type ReducibleTypes<Store extends object> = keyof {
    [Type in keyof Store as Type extends ActionPayload['type']
        ? Store[Type] extends (...payload: infer Payload) => infer ReturnType
            ? Payload extends ActionPayload['payload']
                ? ReturnType extends void
                    ? Type
                    : never
                : never
            : never
        : never]: 0;
};

/**
 * Storeで処理されるActionを発行するメソッド群です。
 *
 * 各メソッドはthisと関連付けられていないのでspread展開して利用できます。
 */
type Actions<Store extends object> = Readonly<
    Pick<Store, ReducibleTypes<Store>>
>;
/**
 * Storeからハンドラーを取り除いた型です。
 *
 * 参照専用で変更不可になっています。
 */
type ImmutableStore<Store extends object> = Immutable<
    Omit<Store, ReducibleTypes<Store>>
>;

/**
 * useStoreAndActionsの返値となる型です。
 */
export type StoreAndActions<Store extends object> = readonly [
    ImmutableStore<Store>,
    Actions<Store>,
];

/**
 * Storeがハンドラーを持たない場合に、neverにします。
 */
export type Validation<Store extends object, T> = [
    ReducibleTypes<Store>,
] extends [never]
    ? never
    : T;

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
 * StoreClassとして1つもハンドラーを持たないクラスを指定すると返値の型がnever型となり、
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
export function useStoreAndActions<Store extends object>(
    StoreClass: new () => Store,
): Validation<Store, StoreAndActions<Store>>;
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
 * initialStoreとして1つもハンドラーを持たないオブジェクトを指定すると返値の型がnever型となり、
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
export function useStoreAndActions<Store extends object>(
    initialStore: Store,
): Validation<Store, StoreAndActions<Store>>;
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
export function useStoreAndActions<Store extends object>(
    storeSpec: Store | (new () => Store),
): Validation<Store, StoreAndActions<Store>>;
/**
 * FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 * @remark useStoreAndActionsの実装
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

function reducer<Store>(
    previous: Store,
    { type, payload }: ActionPayload,
): Store {
    // 第2引数に指定した関数内でdraftに行われた変更をpreviousにマージした新しいStoreを返値とする
    return produce(previous, (draft: HandlerMap) => {
        try {
            // typeはStoreが持つpublicで返値がvoid型のインスタンスメソッドのキーであり、payloadはその引数なので、問題なく呼び出せるはず
            draft[type](...payload);
        } catch (ex) {
            // メソッド呼び出しは問題なくおこなわれ、内部でも例外は発生しないはず
            // 万が一エラーが発生した場合でも、コンソールに出力するだけにして握りつぶす。
            console.error(
                `unhandled exception in Action(type: ${String(type)})`,
                ex,
            );
        }
    });
}

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
): Generator<[ActionPayload['type'], Action], void, undefined> {
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
    valid || error`store must have one or more action handlers.`;
}
