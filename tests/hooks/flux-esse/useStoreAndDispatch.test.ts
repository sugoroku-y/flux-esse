import { act, renderHook } from '@testing-library/react';
import { useStoreAndDispatch } from '@';

describe('flux-esse', () => {
    describe('useStoreAndDispatch', () => {
        test('simple', () => {
            const { result } = renderHook(() =>
                useStoreAndDispatch({
                    text: '',
                    change(newText: string) {
                        this.text = newText;
                    },
                }),
            );
            expect(result.current[0].text).toBe('');
            act(() => {
                result.current[1]({type: 'change', payload: ['test']});
            });
            expect(result.current[0].text).toBe('test');
        });
    });
});
