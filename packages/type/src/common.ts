export type Promisify<T> = T | Promise<T> | PromiseLike<T>;

export type Ctor<T = any, A extends any[] = any[]> = new(...args: A) => T;
export type Newable<T = any> = NewableFunction & {prototype: T};
export type Func<TReturn = any, TArgs extends any[] = any[], This = any> = (this: This, ...args: TArgs) => TReturn;
export type ConstructorFunction<T, A extends any[] = any[]> = (...args: A) => T;

// eslint-disable-next-line @typescript-eslint/ban-types
export type DecoratorTarget = Object;

export type MaybeArray<T> = T | T[];
export type MayNullable<T> = T | null | undefined;
export type Nullable<T> = T | null | undefined;

export type Fn<A extends any[] = [], R = void> = (...args: A) => R;

export type KeyOf<T extends Record<string, any>> = Exclude<keyof T, number | symbol>;
