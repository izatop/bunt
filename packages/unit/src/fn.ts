import {ActionAny, AsyncActionFactory, ActionImport} from "./interfaces";

export function asyncify<A extends ActionAny>(factory: ActionImport<A>): AsyncActionFactory<A> {
    return {factory};
}
