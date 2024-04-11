import { createElement } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import { createFluxEsseContext, useFluxEsseContext } from '@';

describe('createFluxEsseContext', () => {
    test('object literal', () => {
        const SampleContext = createFluxEsseContext({
            text: '',
            change(newText: string) {
                this.text = newText;
            },
        });
        function Page() {
            return createElement(
                SampleContext.Provider,
                {},
                createElement(Component),
            );
        }
        function Component() {
            const [{ text }, { change }] = useFluxEsseContext(SampleContext);
            return createElement(
                'div',
                {
                    onClick() {
                        change('test');
                    },
                    'data-testid': 'Component',
                },
                text,
            );
        }
        const { getByTestId } = render(createElement(Page));
        const component = getByTestId('Component');
        expect(component.textContent).toBe('');
        act(() => component.click());
        expect(component.textContent).toBe('test');
    });
    test('displayName', () => {
        const TestContext = createFluxEsseContext({ a() {} });
        expect(TestContext.displayName).toBe('FluxEsseContext');
        TestContext.displayName = 'abc';
        expect(TestContext.displayName).toBe('abc');
        // @ts-expect-error displayNameを強引にundefinedにする
        TestContext.displayName = undefined;
        expect(TestContext.displayName).toBe('');
    });
    describe('error', () => {
        test('no handler', () => {
            const mock = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            try {
                const exception = new Error(
                    'The store must have one or more action handler.',
                );
                const unhandledException = expect.objectContaining({
                    type: 'unhandled exception',
                    detail: exception,
                });
                const TestContext: ReturnType<
                    typeof createFluxEsseContext<{ a(): void }>
                > = createFluxEsseContext({});
                expect(() =>
                    render(createElement(TestContext.Provider)),
                ).toThrow(exception);
                expect(console.error).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenNthCalledWith(
                    1,
                    unhandledException,
                );
                expect(console.error).toHaveBeenNthCalledWith(
                    2,
                    unhandledException,
                );
                expect(console.error).toHaveBeenNthCalledWith(
                    3,
                    expect.stringMatching(
                        /^The above error occurred in the <Provider> component:/,
                    ),
                );
            } finally {
                mock.mockRestore();
            }
        });
        test('invalid context', () => {
            expect(() => {
                const { result } = renderHook(() => {
                    try {
                        return {
                            success: useFluxEsseContext({
                                Provider: () => null,
                                displayName: '',
                            }),
                        };
                    } catch (ex) {
                        return { failure: ex };
                    }
                });
                if ('failure' in result.current) {
                    throw result.current.failure;
                }
            }).toThrow(
                /^Specify the context created by createFluxEsseContext$/,
            );
        });
        test('outbound', () => {
            const TestContext = createFluxEsseContext({ a() {} });
            expect(() => {
                const { result } = renderHook(() => {
                    try {
                        return { success: useFluxEsseContext(TestContext) };
                    } catch (ex) {
                        return { failure: ex };
                    }
                });
                if ('failure' in result.current) {
                    throw result.current.failure;
                }
            }).toThrow(
                /^Use useFluxEsseContext inside FluxEsseContext\.Provider$/,
            );
        });
    });
});
