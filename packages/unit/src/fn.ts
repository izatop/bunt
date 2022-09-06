import {Context} from "./Context";
import {ActionAny, AsyncActionFactory, ActionImport, ContextArg} from "./interfaces";
import {Unit} from "./Unit";

export function asyncify<A extends ActionAny>(factory: ActionImport<A>): AsyncActionFactory<A> {
    return {factory};
}

export function unit<C extends Context>(context: ContextArg<C>): Promise<Unit<C>> {
    return Unit.factory<C>(context);
}
