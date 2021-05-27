export interface IClientConnection<T> extends AsyncIterable<T> {
    send(message: T): void;

    on(event: "close", listener: () => void): this;
}
