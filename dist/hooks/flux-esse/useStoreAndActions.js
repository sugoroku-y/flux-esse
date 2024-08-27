"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStoreAndActions = useStoreAndActions;
const react_1 = require("react");
const immer_1 = require("immer");
const error_1 = require("../../utils/error");
const getAllPropertyKeys_1 = require("../../utils/getAllPropertyKeys");
// useStoreAndActionsの実装
// eslint-disable-next-line jsdoc/require-param, jsdoc/require-returns -- 実装のparam/returnsも重複して表示されるのでここでは除去
/**
 * FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。
 */
function useStoreAndActions(storeSpec) {
    const [store, dispatch] = (0, react_1.useReducer)((reducer), storeSpec, initializer);
    // Actionを限定する
    const actions = (0, react_1.useMemo)(() => Object.freeze(Object.fromEntries(actionEntries(store, dispatch))), 
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回だけ実行するために空配列を指定します。
    []);
    return [store, actions];
}
function reducer(previous, { type, payload }) {
    // 第2引数に指定した関数内でdraftに行われた変更をpreviousにマージした新しいStoreを返値とする
    return (0, immer_1.produce)(previous, (draft) => {
        try {
            // typeはStoreが持つpublicで返値がvoid型のインスタンスメソッドのキーであり、payloadはその引数なので、問題なく呼び出せるはず
            draft[type](...payload);
        }
        catch (ex) {
            // メソッド呼び出しは問題なくおこなわれ、内部でも例外は発生しないはず
            // 万が一エラーが発生した場合でも、コンソールに出力するだけにして握りつぶす。
            console.error(`unhandled exception in Action(type: ${String(type)})`, ex);
        }
    });
}
function initializer(storeSpec) {
    // クラスのときはnewしてインスタンス化します。
    const initialStore = typeof storeSpec === 'function' ? new storeSpec() : storeSpec;
    if (!(0, immer_1.isDraftable)(initialStore)) {
        // produceで扱えるようにimmerableをtrueに設定します。
        Object.defineProperty(initialStore, immer_1.immerable, { value: true });
    }
    // 初期状態から変更不可になるように再帰的にfreezeしておきます。
    (0, immer_1.freeze)(initialStore, true);
    // freezeしたのでImmutableにキャストして返します。
    return initialStore;
}
function* actionEntries(store, dispatch) {
    let valid;
    for (const type of (0, getAllPropertyKeys_1.getAllPropertyKeys)(store)) {
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
    valid || (0, error_1.error) `store must have one or more action handlers.`;
}
//# sourceMappingURL=useStoreAndActions.js.map