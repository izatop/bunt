import ws from "ws";
import {filterValueCallback, resolveOrReject} from "@bunt/util";
import {AsyncCallback} from "@bunt/async";
import {IClientConnection} from "./interface.js";

export abstract class ClientConnectionAbstract<T> implements IClientConnection<T> {
    readonly #connection: ws;

    constructor(connection: ws) {
        this.#connection = connection;
    }

    public get ready(): boolean {
        return this.#connection.readyState === this.#connection.OPEN;
    }

    public on(event: "close", listener: () => void): this {
        this.#connection.once(event, listener);

        return this;
    }

    public send(payload: T): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.#connection.readyState !== this.#connection.OPEN) {
                return reject(new Error("Cannot send the message, the connection is in a wrong state"));
            }

            this.#connection.send(this.serialize(payload), resolveOrReject(resolve, reject));
        });
    }

    public [Symbol.asyncIterator](): AsyncIterator<T> {
        const asyncCallback = new AsyncCallback<T>((emit) => {
            const listener = filterValueCallback<Buffer>(Buffer.isBuffer, (message) => emit(this.parse(message)));
            this.#connection.on("message", listener);

            return (): void => {
                this.#connection.removeListener("message", listener);
            };
        });

        return asyncCallback[Symbol.asyncIterator]();
    }

    protected abstract serialize(payload: T): string | Buffer;

    protected abstract parse(payload: Buffer): T;
}
