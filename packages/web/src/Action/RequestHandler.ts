import {Action, Context, StateType} from "@bunt/unit";
import {RequestProxy} from "../Transport/RequestProxy.js";

export abstract class RequestHandler<C extends Context, S extends StateType = null, R = unknown>
    extends Action<C, S, R> {
    public get request(): RequestProxy {
        return RequestProxy.getStateLink(this.state);
    }
}
