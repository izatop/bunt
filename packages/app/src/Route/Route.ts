import {ActionAny, ActionFactory} from "@bunt/unit";
import {isFunction, isString} from "@bunt/is";
import {ILogable} from "@bunt/type";
import {
    IRoute,
    IRouteMatcher,
    RouteFactory,
    RouteMatcherFactory,
    RouteRuleArg,
    RouteRuleVariants,
} from "./interfaces.js";
import {RouteRule} from "./RouteRule.js";

export class Route<A extends ActionAny> implements IRoute<A>, ILogable<{route: string}> {
    public readonly route: string;
    public readonly action: ActionFactory<A>;
    public readonly payload?: RouteRule<A>;
    readonly #matcher: IRouteMatcher;

    constructor(matcher: RouteMatcherFactory, action: ActionFactory<A>, rule: RouteRuleArg<A>) {
        const {route, payload} = this.getRuleArgs(rule);
        this.route = route;
        this.action = action;
        this.payload = payload;

        this.#matcher = isFunction(matcher) ? matcher(this.route) : matcher;
    }

    /**
     * @deprecated
     *
     * @param matcher RouteMatcherFactory
     * @returns RouteFactory
     */
    public static create(matcher: RouteMatcherFactory): RouteFactory {
        return <A extends ActionAny>(action: ActionFactory<A>, rule: RouteRuleArg<A>) => (
            new Route<A>(matcher, action, rule)
        );
    }

    public getLogValue(): {route: string} {
        return {route: this.route};
    }

    public test(route: string): boolean {
        return this.#matcher.test(route);
    }

    public match(route: string): Record<string, string> {
        return this.#matcher.match(route);
    }

    private getRuleArgs(rule: RouteRuleArg<A>): RouteRuleVariants<A> {
        if (isString(rule)) {
            return {route: rule, payload: undefined};
        }

        return {route: rule.route, payload: rule};
    }
}
