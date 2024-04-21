/**
 * エスケープ文字のうち、定数から定数への変換を行うもののマップ
 */
const UNESCAPE_MAP = {
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    // 改行前に`\`があれば`\`ごと削除
    '\r': '',
    '\n': '',
    // 8進数のエスケープ文字の中でも`\0`だけ(後ろに数字が続かないもの)は例外的に許可
    0: '\0',
} as const;

export function unescape(s: string): string {
    return s.replace(
        /\\([\s\S])(?:(?<=0)[0-9]|(?<=x)([0-9A-Fa-f]{2})|(?<=u)(?:\{([0-9A-Fa-f]{1,6})\}|([0-9A-Fa-f]{4})))?/g,
        (match, ch: string, hex2?: string, hexLong?: string, hex4?: string) => {
            if (ch in UNESCAPE_MAP) {
                return UNESCAPE_MAP[ch as keyof typeof UNESCAPE_MAP];
            }
            const hex = hex2 ?? hexLong ?? hex4;
            if (hex) {
                const code = parseInt(hex, 16);
                if (code <= 0x10ffff) {
                    return String.fromCodePoint(code);
                }
            }
            // その他(もしくは不正なエスケープ)はそのまま'\'だけ削除
            return match.slice(1);
        },
    );
}
