import {ActionContext, ActionState} from "@bunt/unit";
import {isFunction, isObject} from "@bunt/util";
import {RouteAction} from "../interfaces";
import {IRouteContext} from "../Route";
import {ResolverResolvers} from "./interfaces";

export class Resolver<A extends RouteAction> {
    readonly resolvers: ResolverResolvers<A>;

    constructor(resolvers: ResolverResolvers<A>) {
        this.resolvers = resolvers;
    }

    public async resolve(context: IRouteContext<ActionContext<A>>): Promise<ActionState<A>> {
        const state = {};
        const {resolvers} = this;
        if (isFunction(resolvers)) {
            Object.assign(state, await resolvers(context));
        } else if (isObject(resolvers)) {
            for (const [name, resolver] of Object.entries(resolvers)) {
                if (isFunction(resolver)) {
                    Reflect.set(state, name, await resolver(context));
                } else {
                    Reflect.set(state, name, resolver);
                }
            }
        }

        return state as ActionState<A>;
    }
}
