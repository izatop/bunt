import {ActionAny} from "@bunt/unit";
import {Ctor, ILogable, isFunction, isString} from "@bunt/util";
import {Payload} from "../Payload";
import {IRoute, IRouteMatcher, RouteFactory, RouteMatcherFactory, RouteRuleArg} from "./interfaces";
import {RouteRule} from "./RouteRule";

export class Route<A extends ActionAny> implements IRoute<A>, ILogable<{ route: string }> {
    public readonly route: string;
    public readonly action: Ctor<A>;
    public readonly payload?: Payload<A>;
    readonly #matcher: IRouteMatcher;

    constructor(matcher: RouteMatcherFactory, action: Ctor<A>, rule: RouteRuleArg<A>) {
        const {route, payload} = this.getRuleArgs(rule);
        this.route = route;
        this.action = action;
        this.payload = payload;

        this.#matcher = isFunction(matcher) ? matcher(this.route) : matcher;
    }

    public static create(matcher: RouteMatcherFactory): RouteFactory {
        return <A extends ActionAny>(action: Ctor<A>, rule: RouteRuleArg<A>) => (
            new Route<A>(matcher, action, rule)
        );
    }

    public getLogValue(): { route: string } {
        return {route: this.route};
    }

    public test(route: string): boolean {
        return this.#matcher.test(route);
    }

    public match(route: string): Record<string, string> {
        return this.#matcher.match(route);
    }

    private getRuleArgs(rule: string | RouteRule<A>): { route: string, payload?: Payload<A> } {
        if (isString(rule)) {
            return {route: rule, payload: undefined};
        }

        return {route: rule.route, payload: rule};
    }
}
