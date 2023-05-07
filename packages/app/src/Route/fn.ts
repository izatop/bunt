import {ActionAny, ActionFactory} from "@bunt/unit";
import {RouteRuleArg} from "./interfaces.js";
import {RegexpMatcher} from "./Matcher/RegexpMatcher.js";
import {Route} from "./Route.js";

export function route<A extends ActionAny>(action: ActionFactory<A>, rule: RouteRuleArg<A>): Route<A> {
    return new Route<A>(RegexpMatcher.factory, action, rule);
}
