import {ActionAny, ActionFactory} from "@bunt/unit";
import {RouteRuleArg} from "./interfaces";
import {RegexpMatcher} from "./Matcher/RegexpMatcher";
import {Route} from "./Route";

export function route<A extends ActionAny>(action: ActionFactory<A>, rule: RouteRuleArg<A>): Route<A> {
    return new Route<A>(RegexpMatcher.factory, action, rule);
}
