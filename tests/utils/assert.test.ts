import { assert } from '@/utils/assert';

describe('assert', () => {
    test('success', () => {
        expect(() => {
            assert(true);
        }).not.toThrow();
    });
    test('failure without message', () => {
        expect(() => {
            assert(false);
        }).toThrow(/^$/);
    });
    test('failure with message', () => {
        expect(() => {
            assert(false, 'message');
        }).toThrow(/^message$/);
    });
    test('failure with message function', () => {
        expect(() => {
            assert(false, () => 'message');
        }).toThrow(/^message$/);
    });
});
