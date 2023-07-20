import {assert, isArray, isFunction, isObject} from "@bunt/util";
import {GQLClientConnection} from "./GQLClientConnection.js";
import {GQLOperationType, IGQLOperationComplete} from "./interfaces.js";
import {
    GQLClientOperation,
    GQLClientOperationType,
    GQLClientPayload,
    GQLError,
    GQLInitFunction,
    GQLOperationMessage,
    GQLServerOperationType,
    GQLSubscribeFunction,
} from "./index.js";

// @TODO Upgrade type validation to input schema validation
const AllowTypes: string[] = [
    ...Object.values(GQLClientOperationType),
    ...Object.values(GQLOperationType),
];

/**
 * @final
 */
export class GQLProtoLayer {
    readonly #initialize: GQLInitFunction;
    readonly #subscribe: GQLSubscribeFunction;
    readonly #client: GQLClientConnection;
    readonly #subscriptions = new Map<string, AsyncIterableIterator<any>>();
    readonly #params: Record<string, any> = {};

    constructor(client: GQLClientConnection, init: GQLInitFunction, factory: GQLSubscribeFunction) {
        this.#client = client;
        this.#initialize = init;
        this.#subscribe = factory;

        const interval = setInterval(() => this.ping(), 30000);
        this.#client.on("close", () => this.unsubscribeAll());
        this.#client.on("close", () => clearInterval(interval));
    }

    public async handle(operation: GQLOperationMessage): Promise<void> {
        assert(this.isClientOperation(operation), "Wrong the Operation Message");
        switch (operation.type) {
            case GQLClientOperationType.ConnectionInit:
                Object.assign(this.#params, operation.payload);
                await Promise.resolve(this.#initialize(this.#params));
                await this.#client.send({type: GQLServerOperationType.ConnectionAck});
                break;

            case GQLOperationType.Pong:
                break;

            case GQLOperationType.Ping:
                await this.#client.send({type: GQLOperationType.Pong});
                break;

            case GQLOperationType.Complete:
                this.unsubscribe(operation);
                break;

            case GQLClientOperationType.Subscribe:
                this.createSubscription(operation.id, operation.payload)
                    // eslint-disable-next-line
                    .catch(console.error);
                break;
        }
    }

    private unsubscribe(operation: IGQLOperationComplete): void {
        const subscription = this.#subscriptions.get(operation.id);
        if (subscription) {
            this.#subscriptions.delete(operation.id);
            subscription.return?.();
        }
    }

    private ping(): Promise<void> {
        return this.#client.send({type: GQLOperationType.Ping});
    }

    private pong(): Promise<void> {
        return this.#client.send({type: GQLOperationType.Pong});
    }

    private unsubscribeAll(): void {
        for (const [id, subscription] of this.#subscriptions.entries()) {
            this.#subscriptions.delete(id);
            subscription.return?.();
        }
    }

    private async createSubscription(id: string, payload: GQLClientPayload): Promise<void> {
        try {
            const subscription = await this.#subscribe(payload, this.#params);
            assert(isFunction(subscription.return), "AsyncIterator should be cancelable");

            this.#subscriptions.set(id, subscription);
            for await (const next of subscription) {
                await this.#client.send({id, type: GQLServerOperationType.Next, payload: next});
            }

            await this.#client.send({id, type: GQLOperationType.Complete});
        } catch (error) {
            if (this.#client.ready) {
                await this.#client.send({
                    id,
                    type: GQLServerOperationType.Error,
                    payload: [this.serializeError(error)],
                });

                await this.#client.send({id, type: GQLOperationType.Complete});
            }
        }
    }

    private isClientOperation(operation: GQLOperationMessage): operation is GQLClientOperation {
        return isObject(operation) && AllowTypes.includes(operation.type);
    }

    private isReadableError(error: unknown): error is GQLError {
        return isObject(error) && ("message" in error || ("errors" in error && isArray(error.errors)));
    }

    private serializeError(error: unknown): GQLError {
        if (error instanceof Error) {
            return {message: error.message, code: 500};
        }

        if (this.isReadableError(error)) {
            return error;
        }

        return {message: "Unknown error", code: 500};
    }
}
