import { unescape } from './unescape';

describe('unescape', () => {
    test('single line', () => {
        expect(unescape('abc def')).toBe('abc def');
    });
    test('multi line', () => {
        expect(
            unescape(`
abc
def
`),
        ).toBe('\nabc\ndef\n');
    });
    describe('escape sequence', () => {
        describe('control code:', () => {
            test('null character', () => {
                expect(unescape(String.raw`\0`)).toBe('\0');
            });
            test('back space', () => {
                expect(unescape(String.raw`\b`)).toBe('\b');
            });
            test('new page', () => {
                expect(unescape(String.raw`\f`)).toBe('\f');
            });
            test('line feed', () => {
                expect(unescape(String.raw`\n`)).toBe('\n');
            });
            test('carriage return', () => {
                expect(unescape(String.raw`\r`)).toBe('\r');
            });
            test('tab', () => {
                expect(unescape(String.raw`\t`)).toBe('\t');
            });
            test('vertical tab', () => {
                expect(unescape(String.raw`\v`)).toBe('\v');
            });
            test('escape', () => {
                expect(unescape(String.raw`\x1b`)).toBe('\x1b');
            });
            test('complex', () => {
                expect(unescape(String.raw`\0\b\f\n\r\t\v\x1b`)).toBe(
                    '\0\b\f\n\r\t\v\x1b',
                );
            });
        });
        describe('octal digits', () => {
            test('null character followed 1', () => {
                expect(() => {
                    expect(unescape(String.raw`\01`)).toBe('01');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \01`,
                ]);
            });
            test('null character followed 8', () => {
                expect(() => {
                    expect(unescape(String.raw`\08`)).toBe('08');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \08`,
                ]);
            });
            test('null character followed 9', () => {
                expect(() => {
                    expect(unescape(String.raw`\09`)).toBe('09');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \09`,
                ]);
            });
            test('octal 1', () => {
                expect(() => {
                    expect(unescape(String.raw`\1`)).toBe('1');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \1`,
                ]);
            });
            test('octal 7', () => {
                expect(() => {
                    expect(unescape(String.raw`\7`)).toBe('7');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \7`,
                ]);
            });
            test('octal? 8', () => {
                expect(() => {
                    expect(unescape(String.raw`\8`)).toBe('8');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \8`,
                ]);
            });
            test('octal? 9', () => {
                expect(() => {
                    expect(unescape(String.raw`\9`)).toBe('9');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \9`,
                ]);
            });
        });
        describe('hexadecimal digits', () => {
            test('copyright', () => {
                expect(unescape(String.raw`\xa9`)).toBe('©');
            });
            test('hiragana', () => {
                expect(unescape(String.raw`\u3042`)).toBe('あ');
            });
            test('code point: copyright', () => {
                expect(unescape(String.raw`\u{a9}`)).toBe('©');
            });
            test('code point: hiragana', () => {
                expect(unescape(String.raw`\u{3042}`)).toBe('あ');
            });
            test('code point: emoji', () => {
                expect(unescape(String.raw`\u{1f170}`)).toBe('🅰');
            });
            test('code point: kanji', () => {
                expect(unescape(String.raw`\u{2fa1a}`)).toBe('鼏');
            });
            test('code point: copyright with 0 paddings', () => {
                expect(unescape(String.raw`\u{0000000000000000a9}`)).toBe('©');
            });
            test('code point: hiragana with 0 paddings', () => {
                expect(unescape(String.raw`\u{000000000000003042}`)).toBe('あ');
            });
            test('code point: emoji with 0 paddings', () => {
                expect(unescape(String.raw`\u{00000000000001f170}`)).toBe('🅰');
            });
            test('code point: kanji with 0 paddings', () => {
                expect(unescape(String.raw`\u{00000000000002fa1a}`)).toBe('鼏');
            });
            test('code point: out of range', () => {
                expect(() => {
                    expect(unescape(String.raw`\u{110000}`)).toBe('u{110000}');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \u{110000}`,
                ]);
            });
            test('code point: out of range with 0 paddings', () => {
                expect(() => {
                    expect(unescape(String.raw`\u{00000110000}`)).toBe(
                        'u{00000110000}',
                    );
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \u{00000110000}`,
                ]);
            });
        });
        describe('escape character', () => {
            test('single quote', () => {
                expect(unescape(String.raw`\'`)).toBe("'");
            });
            test('double quote', () => {
                expect(unescape(String.raw`\"`)).toBe('"');
            });
            test('back slash', () => {
                expect(unescape(String.raw`\\`)).toBe('\\');
            });
            test('a', () => {
                expect(() => {
                    expect(unescape(String.raw`\a`)).toBe('a');
                }).toOutputToConsoleError([
                    String.raw`Unsupported escape sequence: \a`,
                ]);
            });
        });
    });
});
