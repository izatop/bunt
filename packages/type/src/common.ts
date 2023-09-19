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
export type NonNullable<T> = Exclude<T,  null | undefined>;

export type Fn<A extends any[] = [], R = void> = (...args: A) => R;

export type KeyOf<T extends Record<string, any>> = Exclude<keyof T, number | symbol>;

export type Rec<K extends keyof any = any, T = any> = Record<K, T>;
export type Prop<T extends Rec, K extends keyof T> = T[K];

export type DeepPartial<T extends Rec> = {
    [K in keyof T]?: T[K] extends Rec ? DeepPartial<T[K]> : T[K];
};

export type DeepRequire<T extends Rec> = {
    [K in keyof T]-?: T[K] extends Rec ? DeepRequire<T[K]> : T[K];
};

export type DeepReadonly<T extends Rec> = {
    readonly [K in keyof T]: T[K] extends Rec ? DeepReadonly<T[K]> : T[K];
};

export type DeepWritable<T extends Rec> = {
    -readonly [K in keyof T]: T[K] extends Rec ? DeepWritable<T[K]> : T[K];
};
