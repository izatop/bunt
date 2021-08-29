import {toError} from "@bunt/util";
import {IReadOperationFail, Message, OperationReleaseState, ReadOperation} from "../Queue";

export class RedisQ2ReadOperation<M extends Message> extends ReadOperation<M> {
    readonly #commit: () => Promise<void>;
    readonly #rollback: () => Promise<void>;

    constructor(message: M, commit: () => Promise<void>, rollback: () => Promise<void>) {
        super(message);
        this.#commit = commit;
        this.#rollback = rollback;
    }

    public async commit(): Promise<OperationReleaseState<M>> {
        try {
            await this.#commit();
        } catch (error) {
            return this.release(toError(error, "Unknown"));
        }

        return this.release();
    }

    public async rollback(reason?: Error): Promise<IReadOperationFail<M>> {
        try {
            await this.#rollback();
        } catch (error) {
            return this.release(toError(error, "Unexpected error"));
        }

        return this.release(reason ?? new Error("Unknown reason"));
    }
}
