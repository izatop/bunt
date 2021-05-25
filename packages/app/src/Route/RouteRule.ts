import {FieldSelectType} from "@bunt/input";
import {ActionAny, ActionState} from "@bunt/unit";
import {Payload, Resolver} from "../Payload";

export class RouteRule<A extends ActionAny> extends Payload<A> {
    public readonly route: string;

    constructor(route: string, type: FieldSelectType<ActionState<A>>, resolver: Resolver<A>) {
        super(type, resolver);
        this.route = route;
    }
}
