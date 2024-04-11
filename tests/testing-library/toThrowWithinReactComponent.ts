export function toThrowWithinReactComponent<T = void>(params: {
    prepare: () => T;
    target: (t: T) => void;
    message?: string;
    componentName?: string;
}): void;
export function toThrowWithinReactComponent(params: {
    target: () => void;
    massage?: string;
    componentName?: string;
}): void;
export function toThrowWithinReactComponent<T>(params: {
    prepare?: () => T;
    target: (t: T) => void;
    message?: string;
    componentName?: string;
}) {
    const exception =
        params.message != null ? new Error(params.message) : expect.any(Error);
    const mock = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        let interim: unknown;
        expect(() => {
            interim = params.prepare?.();
        }).not.toThrow();
        expect(() => params.target(interim as T)).toThrow(exception);
        const unhandledException = expect.objectContaining({
            type: 'unhandled exception',
            detail: exception,
        });
        expect(console.error).toHaveBeenCalledTimes(3);
        expect(console.error).toHaveBeenNthCalledWith(1, unhandledException);
        expect(console.error).toHaveBeenNthCalledWith(2, unhandledException);
        expect(console.error).toHaveBeenNthCalledWith(
            3,
            expect.stringMatching(
                new RegExp(
                    `^The above error occurred in ${
                        params.componentName
                            ? `the <${params.componentName}> component`
                            : params.componentName === ''
                              ? 'one of your React components'
                              : '.*'
                    }:`,
                ),
            ),
        );
    } finally {
        mock.mockRestore();
    }
}
