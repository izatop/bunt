import {ActionAny, ActionContext, ActionFactory, ActionState, ApplyContext} from "@bunt/unit";
import {IRequest} from "../interfaces.js";
import {Payload} from "../Payload/index.js";
import {Route} from "./Route.js";
import {RouteRule} from "./RouteRule.js";

export interface IRoute<A extends ActionAny> {
    readonly route: string;

    readonly action: ActionFactory<A>;

    readonly payload?: Payload<A>;

    test(route: string): boolean;

    match(route: string): Record<string, string>;
}

export type RouteMatcherFactory = IRouteMatcher | ((route: string) => IRouteMatcher);

export type RouteRuleVariants<A extends ActionAny> = {route: string; payload: undefined}
| {route: string; payload: RouteRule<A>};

export type RouteRuleArg<A extends ActionAny> = ActionState<A> extends null
    ? string : RouteRule<A>;

export type RouteFactory = <A extends ActionAny>(action: ActionFactory<A>, rule: RouteRuleArg<A>) => Route<A>;

export interface IRouteContext<A extends ActionAny> {
    request: IRequest;
    context: ApplyContext<ActionContext<A>>;
    args: Map<string, string>;
}

export interface IRouteMatcher {
    test(route: string): boolean;

    match(route: string): Record<string, string>;
}
