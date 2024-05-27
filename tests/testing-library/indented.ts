import { unescape } from './unescape';

abstract class Cache<Key extends WeakKey, Value> {
    private cache = new WeakMap<Key, Value>();
    get(key: Key): Value {
        if (this.cache.has(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- hasでチェックしているのでgetの返値はT
            return this.cache.get(key)!;
        }
        const value = this.newInstance(key);
        this.cache.set(key, value);
        return value;
    }
    abstract newInstance(key: Key): Value;
}

class TemplateCache extends Cache<readonly string[], readonly string[]> {
    newInstance(raw: readonly string[]): readonly string[] {
        // 最後の改行から終端までが空白とタブだけであればその空白とタブの連続をインデントと見なす
        const indent = /(?:\r\n|[\r\n\u2028\u2029])([ \t]+)$/.exec(
            raw[raw.length - 1],
        )?.[1];
        return raw.map(
            indent &&
                /^(?:\r\n|[\r\n\u2028\u2029])([ \t]+)/
                    .exec(raw[0])?.[1]
                    .startsWith(indent)
                ? // 先頭が終端と同じく改行とインデントで始まっていればインデント除去とエスケープ解除
                  (s, i) =>
                      unescape(
                          TemplateCache.trimNewLine(
                              TemplateCache.unindent(s, indent),
                              i,
                              raw.length,
                          ),
                      )
                : // でなければエスケープ解除のみ
                  unescape,
        );
    }

    static unindent(s: string, indent: string): string {
        return s.replace(
            /(\r\n|[\r\n\u2028\u2029])([ \t]*)/g,
            (match, newline: string, whitespace: string) =>
                whitespace.startsWith(indent)
                    ? `${newline}${whitespace.slice(indent.length)}`
                    : match,
        );
    }

    static trimNewLine(t: string, i: number, length: number): string {
        let s = t;
        if (i === 0) {
            // 先頭の改行を除去
            s = s.replace(/^(?:\r\n|[\r\n\u2028\u2029])/, '');
        }
        if (i === length - 1) {
            // 終端の改行を除去
            s = s.replace(/(?:\r\n|[\r\n\u2028\u2029])$/, '');
        }
        return s;
    }
}

const templateCache = new TemplateCache();

export function indented(
    { raw }: TemplateStringsArray,
    ...values: unknown[]
): string {
    return templateCache
        .get(raw)
        .reduce((r, e, i) => `${r}${String(values[i - 1])}${e}`);
}
