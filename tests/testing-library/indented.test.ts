import { indented } from './indented';

describe('indented', () => {
    test('standard', () => {
        expect(indented`
            abc${true}def
            `).toBe('abctruedef');
    });
    test('not indented end', () => {
        expect(indented`
            abc${true}def`).toBe('\n            abctruedef');
    });
    test('not indented begin', () => {
        expect(indented`abc${true}def
            `).toBe('abctruedef\n            ');
    });
    test('not indented partial', () => {
        expect(indented`
            abc
        ${true}
            def
            `).toBe('abc\n        true\ndef');
    });
    test.each`
        n
        ${1}
        ${2}
    `('cache$n', ({ n }) => {
        expect(indented`
            abc${n}def
            `).toBe(`abc${n}def`);
    });
});
