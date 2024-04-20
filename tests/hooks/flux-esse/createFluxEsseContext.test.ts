import { createElement, useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { createFluxEsseContext, useFluxEsseContext } from '@';
import { renderHookWithError } from '@tests/testing-library/renderHookWithError';
import '@tests/testing-library/toOutputToConsoleError';

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
                createElement(ViewComponent),
                createElement(ChangeButton),
            );
        }
        function ViewComponent() {
            const [{ text }] = useFluxEsseContext(SampleContext);
            return createElement('div', { 'data-testid': 'Component' }, text);
        }
        function ChangeButton() {
            const [, { change }] = useFluxEsseContext(SampleContext);
            return createElement(
                'button',
                {
                    onClick: () => change('test'),
                    'data-testid': 'ChangeButton',
                },
                'change',
            );
        }
        const { getByTestId } = render(createElement(Page));
        const component = getByTestId('Component');
        const button = getByTestId('ChangeButton');
        expect(component.textContent).toBe('');
        act(() => button.click());
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
    test('hooks', async () => {
        const TestContext = createFluxEsseContext(
            {
                a() {
                    this.b += 1;
                },
                b: 0,
                c(x: string) {
                    this.d = `${this.b}${x}`;
                },
                d: '',
            },
            ({ b }, { c }) => {
                // 初回とbが変化したとき、イベントループ1回分待ってからcを発行
                useEffect(() => {
                    (async () => {
                        await Promise.resolve();
                        c('x');
                    })();
                }, [b, c]);
            },
        );
        function A() {
            // return (
            //     <TestContext.Provider>
            //         <B />
            //         <C />
            //     </TestContext.Provider>
            // );
            return createElement(
                TestContext.Provider,
                {},
                createElement(B),
                createElement(C),
            );
        }
        function B() {
            const [, { a }] = useFluxEsseContext(TestContext);
            // return <button data-testid="button" onClick={a}>click</button>;
            return createElement(
                'button',
                {
                    'data-testid': 'button',
                    onClick: a,
                },
                'click',
            );
        }
        function C() {
            const [{ d }] = useFluxEsseContext(TestContext);
            // return <div data-testid="view">{d}</div>;
            return createElement(
                'div',
                {
                    'data-testid': 'view',
                },
                d,
            );
        }
        const { getByTestId } = render(createElement(A));
        const button = getByTestId('button');
        const view = getByTestId('view');
        expect(button).toBeInstanceOf(HTMLButtonElement);
        expect(view).toBeInstanceOf(HTMLDivElement);
        expect(view.textContent).toBe('');
        await act(() => Promise.resolve());
        expect(view.textContent).toBe('0x');
        act(() => button.click());
        expect(view.textContent).toBe('0x');
        await act(() => Promise.resolve());
        expect(view.textContent).toBe('1x');
    });
    test('initialize', () => {
        const termination = jest.fn();
        const initialize = jest.fn().mockReturnValue(termination);
        const TestContext = createFluxEsseContext({ a() {} }, () => {
            useEffect(() => {
                initialize();
                return () => {
                    termination();
                };
            }, []);
        });
        const { unmount } = render(createElement(TestContext.Provider));
        expect(initialize).toHaveBeenCalledTimes(1);
        expect(termination).not.toHaveBeenCalled();
        initialize.mockReset();
        unmount();
        expect(initialize).not.toHaveBeenCalled();
        expect(termination).toHaveBeenCalledTimes(1);
    });
    describe('error', () => {
        test('no handler', () => {
            const exception = new Error(
                'The store must have one or more action handler.',
            );
            const unhandledException = expect.objectContaining({
                type: 'unhandled exception',
                detail: exception,
            });
            expect(() => {
                const TestContext = createFluxEsseContext(
                    {} as Record<string, () => void>,
                );
                expect(() =>
                    render(createElement(TestContext.Provider)),
                ).toThrow(exception);
            }).toOutputToConsoleError(
                [unhandledException],
                [unhandledException],
                [
                    expect.stringMatching(
                        /^The above error occurred in the <Provider> component:/,
                    ),
                ],
            );
        });
        test('invalid context', () => {
            expect(() =>
                renderHookWithError(() =>
                    useFluxEsseContext({
                        Provider: () => null,
                        displayName: '',
                    }),
                ),
            ).toThrow(/^Specify the context created by createFluxEsseContext$/);
        });
        test('outbound', () => {
            const TestContext = createFluxEsseContext({ a() {} });
            expect(() =>
                renderHookWithError(() => useFluxEsseContext(TestContext)),
            ).toThrow(
                /^Use useFluxEsseContext inside FluxEsseContext\.Provider$/,
            );
        });
    });
});
