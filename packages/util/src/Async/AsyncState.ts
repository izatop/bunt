import {isDefined} from "../is.js";

export interface IAsyncStateMap<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (error?: Error) => void;
    listener?: (value: T | Error) => void;
    done: boolean;
}

const registry = new WeakMap<Promise<any>, IAsyncStateMap<any>>();

/**
 * @deprecated use @bunt/async
 */
export class AsyncState {
    public static acquire<T>(listener?: (value: T) => void): Promise<T> {
        const state = {};
        const pending = new Promise<T>((resolve, reject) => {
            Object.assign(state, {resolve, listener, reject, done: false});
        });

        registry.set(pending, state as IAsyncStateMap<T>);

        return pending;
    }

    public static resolve<T>(pending?: Promise<T>, value?: T): void;
    public static resolve<T>(pending: Promise<T> | undefined, value: T): void {
        if (pending) {
            const state = registry.get(pending);
            if (state && !this.isReleased(pending)) {
                state.resolve(value);
                state.listener?.(value);
                state.done = true;
            }
        }
    }

    public static reject<T>(pending?: Promise<T>, reason?: Error): void {
        if (pending) {
            const state = registry.get(pending);
            if (state && !this.isReleased(pending)) {
                state.reject(reason);
                state.listener?.(reason);
                state.done = true;
            }
        }
    }

    public static isReleased<T>(pending: Promise<T> | undefined): boolean {
        return isDefined(pending) && (registry.get(pending)?.done ?? true);
    }

    public static has<T>(pending: Promise<T> | undefined): boolean {
        return isDefined(pending) && registry.has(pending);
    }
}
