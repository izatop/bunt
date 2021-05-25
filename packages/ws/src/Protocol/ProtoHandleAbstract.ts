import {Action, Context, IShadowState, ShadowState, StateType} from "@bunt/unit";
import {assert, Logger, logger} from "@bunt/util";
import ws from "ws";

export abstract class ProtoHandleAbstract<C extends Context, S extends StateType = null>
    extends Action<C, S, void> implements IShadowState<ws> {
    /**
     * Supported WebSocket protocol, should be extended in child
     * classes for validation purposes before they will be run.
     *
     * @static
     * @abstract
     */
    protected static protocol: string;

    @logger
    protected logger!: Logger;

    public static isSupported(protocol: string): boolean {
        return this.protocol.toLowerCase() === protocol.toLowerCase();
    }

    public getShadowState(): ws {
        const shadowState = ShadowState.get<ws>(this.state);
        assert(shadowState, "Shadow state should be defined");
        return shadowState;
    }
}
