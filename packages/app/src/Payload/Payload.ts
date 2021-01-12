import {FieldSelectType, validate} from "@bunt/input";
import {ActionContext, ActionState} from "@bunt/unit";
import {RouteAction} from "../interfaces";
import {IRouteContext} from "../Route";
import {Resolver} from "./Resolver";

export class Payload<A extends RouteAction> {
    public readonly resolver: Resolver<A>;
    public readonly type: FieldSelectType<ActionState<A>>;

    constructor(type: FieldSelectType<ActionState<A>>, resolver: Resolver<A>) {
        this.type = type;
        this.resolver = resolver;
    }

    public async validate(context: IRouteContext<ActionContext<A>>): Promise<ActionState<A>> {
        return validate<ActionState<A>>(this.type, await this.resolver.resolve(context));
    }
}
