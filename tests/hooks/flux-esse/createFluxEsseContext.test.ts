import { createElement } from 'react';
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
    test('initialize', () => {
        const termination = jest.fn();
        const initialize = jest.fn().mockReturnValue(termination);
        const TestContext = createFluxEsseContext({ a() {} });
        const { unmount } = render(
            createElement(TestContext.Provider, { initialize }),
        );
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
