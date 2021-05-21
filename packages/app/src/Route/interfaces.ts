import {Action, ActionCtor, IContext} from "@bunt/unit";
import {IRequest, RouteAction} from "../interfaces";
import {Payload} from "../Payload";
import {Route} from "./Route";
import {RouteRule} from "./RouteRule";

export interface IRoute<A extends RouteAction = RouteAction> {
    readonly route: string;

    readonly action: ActionCtor<A>;

    readonly payload?: Payload<A>;

    test(route: string): boolean;

    match(route: string): Record<string, string>;
}

export type RouteMatcherFactory = IRouteMatcher | ((route: string) => IRouteMatcher);

export type RouteRuleArg<A extends Action<any, any>> = A extends Action<any, infer S>
    ? S extends null ? string : RouteRule<A>
    : string;

export type RouteFactory = <A extends RouteAction>(action: ActionCtor<A>, rule: RouteRuleArg<A>) => Route<A>;

export interface IRouteContext<C extends IContext> {
    context: C;
    request: IRequest;
    args: Map<string, string>;
}

export interface IRouteMatcher {
    test(route: string): boolean;

    match(route: string): Record<string, string>;
}
