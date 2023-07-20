import {Context, StateType} from "@bunt/unit";
import {noop, Promisify} from "@bunt/util";
import {ProtoHandleAbstract} from "../ProtoHandleAbstract.js";
import {GQLClientConnection} from "./GQLClientConnection.js";
import {GQLProtoLayer} from "./GQLProtoLayer.js";
import {GQLClientPayload} from "./interfaces.js";

export abstract class GQLProtoHandle<C extends Context,
    S extends StateType | null = null> extends ProtoHandleAbstract<C, S> {

    public static protocol = "graphql-transport-ws";

    readonly #connection = new GQLClientConnection(this.getShadowState());

    public async run(): Promise<void> {
        await this.connect();
        this.#connection.on("close", () => this.close());

        const initialize = this.initialize.bind(this);
        const subscribe = this.subscribe.bind(this);
        const layer = new GQLProtoLayer(this.#connection, initialize, subscribe);

        for await (const operation of this.#connection) {
            await layer.handle(operation);
        }

        await this.finish();
    }

    protected abstract subscribe(payload: GQLClientPayload,
        params: Record<string, any>): Promisify<AsyncIterableIterator<any>>;

    protected connect(): Promisify<void> {
        // handle connection event
    }

    protected initialize<T extends Record<string, any>>(params: T): Promisify<void> {
        // handle connection init event
        noop(params);
    }

    protected finish(): Promisify<void> {
        // handle done operations read
    }

    protected close(): Promisify<void> {
        // handle connection close event
    }
}
