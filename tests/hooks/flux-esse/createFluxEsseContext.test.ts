import { createElement } from 'react';
import { act, render } from '@testing-library/react';
import { createFluxEsseContext, useFluxEsseContext } from '@';
import { renderHookWithError } from '@tests/testing-library/renderHookWithError';
import { toThrowWithinReactComponent } from '@tests/testing-library/toThrowWithinReactComponent';

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
            toThrowWithinReactComponent({
                prepare: () =>
                    createFluxEsseContext({} as Record<string, () => void>),
                target: (TestContext) => {
                    render(createElement(TestContext.Provider));
                },
                message: 'The store must have one or more action handler.',
                componentName: 'Provider',
            });
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
