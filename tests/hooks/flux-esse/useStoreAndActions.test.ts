import { act } from '@testing-library/react';
import { useStoreAndActions } from '@';
import { renderHookWithError } from '@tests/testing-library/renderHookWithError';
import { toThrowWithinReactComponent } from '@tests/testing-library/toThrowWithinReactComponent';

describe('flux-esse', () => {
    describe('useStoreAndActions', () => {
        test('simple', () => {
            const { result } = renderHookWithError(() =>
                useStoreAndActions({
                    text: '',
                    /**
                     * textを変更する。
                     * @param newText 設定する文字列
                     */
                    change(newText: string) {
                        this.text = newText;
                    },
                }),
            );
            expect(result.current[0].text).toBe('');
            act(() => result.current[1].change('test'));
            expect(result.current[0].text).toBe('test');
            expect(result.current[1]).toHaveProperty('change');
            expect(result.current[1]).not.toHaveProperty('text');
        });
        test('simple with class', () => {
            const { result } = renderHookWithError(() =>
                useStoreAndActions(
                    class {
                        text = '';
                        /**
                         * textを変更する。
                         * @param newText 設定する文字列
                         */
                        change(newText: string) {
                            this.text = newText;
                        }
                    },
                ),
            );
            expect(result.current[0].text).toBe('');
            act(() => result.current[1].change('test'));
            expect(result.current[0].text).toBe('test');
        });
        test('no handler', () => {
            expect(() =>
                renderHookWithError(() => useStoreAndActions({})),
            ).toThrow(
                new Error('The store must have one or more action handler.'),
            );
        });
        test('invalid handler call', () => {
            toThrowWithinReactComponent({
                prepare: () =>
                    renderHookWithError(() =>
                        useStoreAndActions({
                            destructure({ _ }: { _: string }) {},
                        }),
                    ),
                target: ({ result }) => {
                    act(() => {
                        // @ts-expect-error 引数が必須のメソッドを無理やり引数無しで呼び出す
                        result.current[1].destructure();
                    });
                },
                message:
                    "Cannot destructure property '_' of 'undefined' as it is undefined.",
                componentName: 'TestComponent',
            });
        });
        test('handler disappearance', () => {
            toThrowWithinReactComponent({
                prepare: () => {
                    const { result } = renderHookWithError(() =>
                        useStoreAndActions({
                            disappear() {
                                // @ts-expect-error 無理やりハンドラーを削除
                                delete this.disappear;
                            },
                        }),
                    );
                    act(() => result.current[1].disappear());
                    return { result };
                },
                target: ({ result }) => {
                    act(() => result.current[1].disappear());
                },
                message: 'draft[type] is not a function',
                componentName: 'TestComponent',
            });
        });
        test.skip('compile test', () => {
            expect(
                useStoreAndActions({
                    text: '',
                    change(newText: string) {
                        this.text = newText;
                    },
                }),
            ).toEqualType<
                readonly [
                    Readonly<{ text: string }>,
                    Readonly<{ change(newText: string): void }>,
                ]
            >();
            expect(
                useStoreAndActions(
                    class {
                        text = '';
                        change(newText: string) {
                            this.text = newText;
                        }
                    },
                ),
            ).toEqualType<
                readonly [
                    Readonly<{ text: string }>,
                    Readonly<{ change(newText: string): void }>,
                ]
            >();
            expect(useStoreAndActions({})).toEqualType<never>();
            expect(useStoreAndActions(class {})).toEqualType<never>();
        });
    });
});
