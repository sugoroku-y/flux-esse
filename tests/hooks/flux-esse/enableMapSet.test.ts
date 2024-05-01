import { enableMapSet } from '@';

describe('enableMapSet', () => {
    test('simple call', () => {
        expect(() => {
            // 問題なく呼び出せることを確認
            enableMapSet();
        }).not.toThrow();
    });
});
