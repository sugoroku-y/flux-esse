import immer from 'immer';

/**
 * StoreのプロパティとしてES2015のMapやSetを持つとき、Actionのハンドラー内で変更できるようにします。
 *
 * [Pick your Immer version](https://immerjs.github.io/immer/installation/#pick-your-immer-version)
 *
 * ```plaintext
 * To make sure Immer is as small as possible, features that are not required
 * by every project has been made opt-in, and have to be enabled explicitly.
 * This ensures that when bundling your application for production, unused
 * features don't take any space.
 * ```
 *
 * > Immerを可能な限り小さくするために、すべてのプロジェクトで必要とされない機能はオプトインにし、明示的に有効にする必要があります。
 * >
 * > これにより、アプリケーションを本番用にバンドルする際に、未使用の機能がスペースを取らないようになっています。
 *
 * 逆に言えばActionのハンドラー内でMapやSetを変更しなければ`enableMapSet`を呼ぶ必要はありませんし、
 * `enableMapSet`を呼ばなければimmerとしてロードされるスクリプトのサイズも軽減されます。
 *
 * Actionのハンドラー内でMapやSetを変更しない場合は`enableMapSet`を呼ばないでください。
 */
export function enableMapSet(): void;
/**
 * StoreのプロパティとしてES2015のMapやSetを持つとき、Actionのハンドラー内で変更できるようにします。
 * @remark Map/Setを扱えるようにするにはimmerを使用するモジュール内からのenableMapSetの呼び出しが必要になります。
 */
export function enableMapSet() {
    immer.enableMapSet();
}
