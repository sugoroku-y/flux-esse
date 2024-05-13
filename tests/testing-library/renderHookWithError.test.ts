import { useRef, useState } from 'react';
import { act } from '@testing-library/react';
import { renderHookWithError } from './renderHookWithError';

describe('renderHookWithError', () => {
    test('error on second call', () => {
        function useTest() {
            const [state, setState] = useState(1);
            const ref = useRef<number>();
            if (ref.current) {
                throw new Error('test');
            }
            ref.current = state;
            return [ref.current, setState] as const;
        }
        const { result } = renderHookWithError(() => useTest());
        expect(result.current[0]).toBe(1);
        act(() => result.current[1](2));
        expect(() => result.current[0]).toThrow(new Error('test'));
    });
});
