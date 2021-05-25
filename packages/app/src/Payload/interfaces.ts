import {ActionAny, ActionState} from "@bunt/unit";
import {IRouteContext} from "../Route";

export type ResolverFn<A extends ActionAny> = (context: IRouteContext<A>) => ActionState<A> | unknown;
export type ResolverType<A extends ActionAny> = ActionState<A> | ResolverFn<A>;

export type ResolverList<A extends ActionAny> = {
    [K in keyof ActionState<A>]-?: ResolverType<A>;
};

export type ResolverResolvers<A extends ActionAny> = ResolverFn<A>
    | ResolverList<A>;
