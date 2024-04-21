export function isPromiseLike(o: unknown): o is PromiseLike<unknown> {
    return (
        o instanceof Promise ||
        (typeof o === 'object' &&
            o !== null &&
            'then' in o &&
            typeof o.then === 'function')
    );
}
