# @sugoroku-y/flux-esse

## Table of contents

### Functions

- [useStoreAndActions](api.md#usestoreandactions)
- [createFluxEsseContext](api.md#createfluxessecontext)
- [useFluxEsseContext](api.md#usefluxessecontext)

## Functions

### useStoreAndActions

▸ **useStoreAndActions**\<`Store`\>(`StoreClass`): `Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。

[^1]: publicで返値がvoid型のインスタンスメソッドをActionを処理するハンドラーと見なします。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `StoreClass` | () => `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つクラスです。 |

#### Returns

`Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

StoreClassが1つもハンドラーを持たない場合、返値の型がnever型となり、
StoreやActionが利用できなくなります。

**`Example`**

```ts
const [store, {change}] = useStoreAndActions(class {
    text = '';
    change(newText: string) {
        this.text = newText;
    }
});
```

**`Throws`**

以下の場合に例外を投げます。

- StoreClassとして1つもハンドラーを持たないクラスが指定された場合。

▸ **useStoreAndActions**\<`Store`\>(`initialStore`): `Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。

[^2]: このカスタムフックを呼び出したあと、initialStoreに指定したオブジェクトは変更不可になります。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialStore` | `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つオブジェクトです。[^2] |

#### Returns

`Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

initialStoreが1つもハンドラーを持たない場合、返値の型がnever型となり、
StoreやActionが利用できなくなります。

**`Example`**

```ts
const [store, {change}] = useStoreAndActions({
    text: '',
    change(newText: string) {
        this.text = newText;
    },
});
```

**`Throws`**

以下の場合に例外を投げます。

- initialStoreとして1つもハンドラーを持たないオブジェクトが指定された場合。

___

### createFluxEsseContext

▸ **createFluxEsseContext**\<`Store`\>(`StoreClass`, `hooks?`): `Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

[useStoreAndActions](api.md#usestoreandactions)が返すStoreとActionを扱うコンテキストを生成します。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `StoreClass` | () => `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つクラスです。 |
| `hooks?` | `Hooks`\<`Store`\> | コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。 |

#### Returns

`Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

StoreとActionを扱うコンテキストを返します。

StoreClassが1つもハンドラーを持たない場合、返値の型がnever型となり、
コンテキストとして利用できなくなります。

**`Example`**

```ts
const SampleContext = createFluxEsseContext(
    class {
        text = '';
        count = 0;
        change(newText: string) {
            this.text = newText;
        }
        increment() {
            this.count += 1;
        }
    },
    ({text}, {increment}) => {
        // textが変更されたらcountを1つ増やす
        useEffect(
            () => {
                increment();
            },
            [text, increment]
        );
    },
});
```

▸ **createFluxEsseContext**\<`Store`\>(`initialStore`, `hooks?`): `Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

[useStoreAndActions](api.md#usestoreandactions)が返すStoreとActionを扱うコンテキストを生成します。

[^3]: 返値のコンテキストにあるProviderがレンダリングされたあと、initialStoreに指定したオブジェクトは変更不可になります。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialStore` | `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラー[^1]を持つオブジェクトです。[^3] |
| `hooks?` | `Hooks`\<`Store`\> | コンテキストのProviderをレンダリングするときに呼び出されるフックです。省略可能です。 |

#### Returns

`Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

StoreとActionを扱うコンテキストを返します。

initialStoreが1つもハンドラーを持たない場合、返値の型がnever型となり、
コンテキストとして利用できなくなります。

**`Example`**

```ts
const SampleContext = createFluxEsseContext(
    {
        text: '',
        count: 0,
        change(newText: string) {
            this.text = newText;
        },
        increment() {
            this.count += 1;
        },
    },
    ({text}, {increment}) => {
        // textが変更されたらcountを1つ増やす
        useEffect(
            () => {
                increment();
            },
            [text, increment]
        );
    },
);
```

___

### useFluxEsseContext

▸ **useFluxEsseContext**\<`Store`\>(`context`): `Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

[createFluxEsseContext](api.md#createfluxessecontext)で生成したコンテキストからStoreとActionを取得します。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | `FluxEsseContext`\<`Store`\> | [createFluxEsseContext](api.md#createfluxessecontext)で生成したコンテキスト |

#### Returns

`Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

contextが[createFluxEsseContext](api.md#createfluxessecontext)で生成されていない場合や、
contextを作成したときの[createFluxEsseContext](api.md#createfluxessecontext)に指定されたStoreが1つもハンドラーを持たない場合、
返値の型がnever型となり、StoreやActionが利用できなくなります。

**`Example`**

```ts
const [store, {change}] = useFluxEsseContext(SampleContext);
```

**`Throws`**

以下の場合に例外を投げます。

- [createFluxEsseContext](api.md#createfluxessecontext)で生成されていないコンテキストを指定した場合。
- FluxEsseContext.Providerの中ではない場所で使用された場合。
