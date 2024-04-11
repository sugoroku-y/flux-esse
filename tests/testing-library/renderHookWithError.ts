import {
    renderHook,
    type RenderHookOptions,
    type RenderHookResult,
} from '@testing-library/react';

export function renderHookWithError<Result, Props>(
    render: (initialProps: Props) => Result,
    options?: RenderHookOptions<Props>,
): RenderHookResult<Result, Props> {
    const { result, ...props } = renderHook((initialProps: Props) => {
        try {
            return { success: render(initialProps) };
        } catch (ex) {
            return { failure: ex };
        }
    }, options);
    if ('failure' in result.current) {
        throw result.current.failure;
    }
    return {
        result: {
            get current() {
                if ('failure' in result.current) {
                    throw result.current.failure;
                }
                return result.current.success;
            },
        },
        ...props,
    };
}
