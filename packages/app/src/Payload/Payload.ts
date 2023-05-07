import {FieldSelectType, validate} from "@bunt/input";
import {ActionAny, ActionState} from "@bunt/unit";
import {IRouteContext} from "../Route/index.js";
import {Resolver} from "./Resolver.js";

export class Payload<A extends ActionAny> {
    public readonly resolver: Resolver<A>;
    public readonly type: FieldSelectType<ActionState<A>>;

    constructor(type: FieldSelectType<ActionState<A>>, resolver: Resolver<A>) {
        this.type = type;
        this.resolver = resolver;
    }

    public async validate(context: IRouteContext<A>): Promise<ActionState<A>> {
        return validate<ActionState<A>>(this.type, await this.resolver.resolve(context));
    }
}
