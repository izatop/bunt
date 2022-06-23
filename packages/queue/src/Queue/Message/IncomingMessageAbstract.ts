export abstract class IncomingMessageAbstract<T> {
    public readonly payload: T;
    public static readonly concurrency: number = 1;

    constructor(payload: T) {
        this.payload = payload;
    }

    public static get channel(): string {
        return this.name;
    }

    public get channel(): string {
        return this.constructor.name;
    }
}
