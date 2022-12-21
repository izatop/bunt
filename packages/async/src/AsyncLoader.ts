export class AsyncLoader {
    public static factory<T>(fn: () => Promise<{default: T}>): () => Promise<T> {
        return (): Promise<T> => this.require(fn);
    }

    public static async require<T>(fn: () => Promise<{default: T}>): Promise<T> {
        const module = await fn();

        return module.default;
    }
}
