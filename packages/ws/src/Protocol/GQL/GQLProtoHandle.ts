import {IContext, StateType} from "@bunt/unit";
import {Promisify} from "@bunt/util";
import {ProtoHandleAbstract} from "../ProtoHandleAbstract";
import {GQLClientConnection} from "./GQLClientConnection";
import {GQLProtoLayer} from "./GQLProtoLayer";
import {GQLClientPayload} from "./interfaces";

export abstract class GQLProtoHandle<C extends IContext,
    S extends StateType | null = null> extends ProtoHandleAbstract<C, S> {

    public static protocol = "graphql-ws";

    readonly #connection = new GQLClientConnection(this.getShadowState());

    public async run(): Promise<void> {
        this.connect();
        this.#connection.on("close", () => this.close());
        const layer = new GQLProtoLayer(
            this.#connection,
            (payload, params) => this.subscribe(payload, params),
        );

        for await (const operation of this.#connection) {
            await layer.handle(operation);
        }
    }

    protected abstract subscribe(payload: GQLClientPayload,
                                 params: Record<string, any>): Promisify<AsyncIterableIterator<any>>;

    protected connect(): Promisify<void> {
        // handle connection event
    }

    protected close(): Promisify<void> {
        // handle connection close event
    }
}
