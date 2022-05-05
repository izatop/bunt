export function resolveOrReject(resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: any) => void) {
    return (error?: Error): void => {
        if (error) {
            reject(error);
            
            return;
        }

        resolve();
    };
}

export function filterValueCallback<T>(test: (value: unknown) => boolean, cb: (value: T) => unknown) {
    return (value: T): void => {
        if (test(value)) {
            cb(value);
        }
    };
}
