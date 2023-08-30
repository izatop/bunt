import {assert} from "@bunt/assert";
import {isFunction, isUndefined} from "@bunt/is";
import {DecoratorTarget} from "@bunt/type";

export function memoize(target: DecoratorTarget, key: string): PropertyDescriptor {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    assert(!isUndefined(descriptor));
    assert(
        isFunction(descriptor.value) || isFunction(descriptor.get),
        "Memoization should be apply only to methods",
    );

    const memoizeCache = new WeakMap();
    if (descriptor.value) {
        const fn = descriptor.value;
        descriptor.value = function memoizeCacheFunction(this: any, ...args: any[]): any {
            if (!memoizeCache.has(this)) {
                memoizeCache.set(this, fn.call(this, args));
            }

            return memoizeCache.get(this);
        };
    }

    if (descriptor.get) {
        const fn = descriptor.get;
        descriptor.get = function memoizeCacheFunction(this: any): any {
            if (!memoizeCache.has(this)) {
                memoizeCache.set(this, fn.call(this));
            }

            return memoizeCache.get(this);
        };
    }

    return descriptor;
}

export function bind<T extends(...args: any[]) => any>(
    target: Record<any, any>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
    return {
        configurable: true,
        get(this: T): T {
            const bound = descriptor.value?.bind(this) as T;
            if (bound) {
                Object.defineProperty(this, propertyKey, {
                    value: bound,
                    configurable: true,
                    writable: true,
                });
            }

            return bound;
        },
    };
}
