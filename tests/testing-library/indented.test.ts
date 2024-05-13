import { indented } from './indented';

describe('indented', () => {
    test('parameterize', () => {
        expect(indented`abc${true}def`).toBe('abctruedef');
    });
});
