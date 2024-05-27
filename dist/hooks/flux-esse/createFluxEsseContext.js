"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFluxEsseContext = exports.createFluxEsseContext = void 0;
const react_1 = require("react");
const error_1 = require("../../utils/error");
const useStoreAndActions_1 = require("./useStoreAndActions");
/**
 * FluxEsseContextとReactのContextを関連付けるマップ。
 *
 * 不要になったあとにガーベージコレクトされるようにWeakMapを使用する。
 */
const contextMap = new WeakMap();
/**
 * {@link useStoreAndActions}が返すStoreとActionを扱うコンテキストを生成します。
 * @param storeSpec 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクト、もしくはクラスです。
 * @param hooks コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。
 * @returns StoreとActionを扱うコンテキストを返します。
 * @remark createFluxEsseContextの実装
 */
function createFluxEsseContext(storeSpec, hooks) {
    const original = (0, react_1.createContext)(undefined);
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
exports.createFluxEsseContext = createFluxEsseContext;
/**
 * Providerコンポーネントを生成します。
 * @param storeSpec {@link useStoreAndActions}に指定するStoreの詳細
 * @param context Reactのコンテキスト
 * @param context.Provider Reactのコンテキストで提供されるProviderコンポーネント
 * @param hooks Providerコンポーネントのレンダリング時に実行されるフック
 * @returns FluxEsseContextのProviderコンポーネントを返します。
 */
function createProvider(storeSpec, { Provider: original }, hooks) {
    // デバッグ時などでコンポーネントとして表示する際に使われるため、
    // アロー関数ではなく関数式にして名前を明示的に付けておく
    return function Provider(props) {
        const value = (0, useStoreAndActions_1.useStoreAndActions)(storeSpec);
        hooks?.(...value);
        return (0, react_1.createElement)(original, { value, ...props });
    };
}
/**
 * {@link createFluxEsseContext}で生成したコンテキストからStoreとActionを取得します。
 * @param context {@link createFluxEsseContext}で生成したコンテキスト
 * @returns StoreとActionを発行するメソッドを持つオブジェクトを返します。
 * @remark useFluxEsseContextの実装
 */
function useFluxEsseContext(context) {
    const original = contextMap.get(context) ??
        (0, error_1.error) `context must be created with createFluxEsseContext.`;
    return ((0, react_1.useContext)(original) ??
        (0, error_1.error) `useFluxEsseContext must be used within the descendant component of ${context.displayName}.Provider.`);
}
exports.useFluxEsseContext = useFluxEsseContext;
//# sourceMappingURL=createFluxEsseContext.js.map