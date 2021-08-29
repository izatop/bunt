import {toError} from "@bunt/util";
import {createReleaseState} from "./fn";
import {IHandleReleaseFactory, IReadOperation, IReadOperationFail, Message, OperationReleaseState} from "./interfaces";

export class ReadOperation<M extends Message> implements IReadOperation<M> {
    readonly #message: M;
    readonly #release: IHandleReleaseFactory<M>;

    constructor(message: M) {
        this.#message = message;
        this.#release = createReleaseState(message);
    }

    public get channel(): string {
        return this.#message.channel;
    }

    public get message(): M {
        return this.#message;
    }

    public async commit(): Promise<OperationReleaseState<M>> {
        try {
            return this.release();
        } catch (error) {
            return this.release(toError(error, "Unexpected error"));
        }
    }

    public async rollback(reason?: Error): Promise<IReadOperationFail<M>> {
        return this.release(reason ?? new Error("Unknown reason"));
    }

    protected release(): OperationReleaseState<M>;
    protected release(reason: Error): IReadOperationFail<M>;
    protected release(reason?: Error): OperationReleaseState<M> {
        if (reason) {
            return this.#release(reason);
        }

        return this.#release();
    }
}
