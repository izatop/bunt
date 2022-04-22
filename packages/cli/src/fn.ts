import {EqualMatcher, Route, RouteRuleArg} from "@bunt/app";
import {ActionAny, ActionFactory} from "@bunt/unit";

export function command<A extends ActionAny>(action: ActionFactory<A>, rule: RouteRuleArg<A>): Route<A> {
    return new Route<A>(EqualMatcher.factory, action, rule);
}
