import {NotFound} from "@bunt/assert";

export class RouteNotFound extends NotFound {
    constructor(route: string) {
        super(`Route "${route}" not found`);
    }
}
