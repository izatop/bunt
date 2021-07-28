import {NotFound} from "@bunt/util";

export class RouteNotFound extends NotFound {
    constructor(route: string) {
        super(`Route "${route}" not found`);
    }
}
