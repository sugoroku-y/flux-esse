# flux-esse - v0.0.1

## Table of contents

### Functions

- [useStoreAndActions](api.md#usestoreandactions)
- [createFluxEsseContext](api.md#createfluxessecontext)
- [useFluxEsseContext](api.md#usefluxessecontext)

## Functions

### useStoreAndActions

▸ **useStoreAndActions**\<`Store`\>(`StoreClass`): `Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `StoreClass` | () => `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラーを持つクラスです。 |

#### Returns

`Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

**`Example`**

```ts
const [store, {change}] = useStoreAndActions(class {
    text = '';
    change(newText: string) {
        this.text = newText;
    }
});
```

**`Remark`**

StoreClassとして1つもハンドラーを持たないクラスを指定すると返値の型がnever型となり、
StoreやActionが利用できなくなります。

**`Throws`**

以下の場合に例外を投げます。

- StoreClassとして1つもハンドラーを持たないクラスが指定された場合。

▸ **useStoreAndActions**\<`Store`\>(`initialStore`): `Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

FLUXアーキテクチャーのエッセンスを実現するカスタムフックです。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialStore` | `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクトです。 |

#### Returns

`Validation`\<`Store`, `StoreAndActions`\<`Store`\>\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

**`Example`**

```ts
const [store, {change}] = useStoreAndActions({
    text: '',
    change(newText: string) {
        this.text = newText;
    },
});
```

**`Remark`**

このカスタムフックを呼び出したあと、initialStoreに指定したオブジェクトは変更不可になります。

**`Remark`**

initialStoreとして1つもハンドラーを持たないオブジェクトを指定すると返値の型がnever型となり、
StoreやActionが利用できなくなります。

**`Throws`**

以下の場合に例外を投げます。

- initialStoreとして1つもハンドラーを持たないオブジェクトが指定された場合。

___

### createFluxEsseContext

▸ **createFluxEsseContext**\<`Store`\>(`StoreClass`): `Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

[useStoreAndActions](api.md#usestoreandactions)が返すStoreとActionを扱うコンテキストを生成します。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `StoreClass` | () => `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラーを持つクラスです。 |

#### Returns

`Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

StoreとActionを扱うコンテキスト

**`Example`**

```ts
const SampleContext = createFluxEsseContext(class {
    text = '';
    change(newText: string) {
        this.text = newText;
    }
});
```

**`Remark`**

StoreClassとして1つもハンドラーを持たないクラスを指定すると返値の型がnever型となり、
コンテキストとして利用できなくなります。

▸ **createFluxEsseContext**\<`Store`\>(`initialStore`): `Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

[useStoreAndActions](api.md#usestoreandactions)が返すStoreとActionを扱うコンテキストを生成します。

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Store` | extends `object` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `initialStore` | `Store` | 初期状態のStoreのプロパティとActionを処理するハンドラーを持つオブジェクトです。 |

#### Returns

`Validation`\<`Store`, `FluxEsseContext`\<`Store`\>\>

StoreとActionを扱うコンテキスト

**`Example`**

```ts
const SampleContext = createFluxEsseContext({
    text: '',
    change(newText: string) {
        this.text = newText;
    },
});
```

**`Remark`**

返値のコンテキストにあるProviderがレンダリングされたあと、initialStoreに指定したオブジェクトは変更不可になります。

**`Remark`**

initialStoreとして1つもハンドラーを持たないオブジェクトを指定すると返値の型がnever型となり、
コンテキストとして利用できなくなります。

___

### useFluxEsseContext

▸ **useFluxEsseContext**\<`Store`\>(`context`): `StoreAndActions`\<`Store`\>

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

`StoreAndActions`\<`Store`\>

StoreとActionを発行するメソッドを持つオブジェクトを返します。

ただし、Storeからはハンドラーが除外されています。

Actionを発行するメソッドはthisと関連付けられていないため、spread展開で取得可能です。

**`Example`**

```ts
const [store, {change}] = useFluxEsseContext(SampleContext);
```

**`Throws`**

以下の場合に例外を投げます。

- [createFluxEsseContext](api.md#createfluxessecontext)で生成されていないコンテキストを指定した場合。
- FluxEsseContext.Providerの中ではない場所で使用された場合。
