import {ActionAny, ApplyContext, Context, ContextArg, StateType, unit, Unit} from "@bunt/unit";
import {assert, isDefined, logger, Logger} from "@bunt/util";
import {ActionResponse, IRequest} from "./interfaces";
import {IRoute, RouteNotFound} from "./Route";

export class Application<C extends Context> {
    @logger
    protected logger!: Logger;

    readonly #unit: Unit<C>;
    readonly #routes: IRoute<ActionAny<C>>[] = [];

    constructor(u: Unit<C>, routes: IRoute<ActionAny<C>>[] = []) {
        this.#unit = u;

        if (routes.length > 0) {
            routes.forEach((route) => this.add(route));
        }
    }

    public get context(): ApplyContext<C> {
        return this.#unit.context;
    }

    public get size(): number {
        return this.#routes.length;
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: IRoute<ActionAny<C>>[] = []): Promise<Application<C>> {
        return new this(await unit(context), routes);
    }

    public add(route: IRoute<ActionAny<C>>): this {
        this.logger.debug("add", route);
        assert(!this.#unit.has(route.action), "This route was already added");
        this.#unit.add(route.action);
        this.#routes.push(route);
        return this;
    }

    public remove(route: IRoute<ActionAny<C>>): this {
        if (this.#unit.has(route.action)) {
            this.logger.debug("remove", route);
            this.#unit.remove(route.action);
            const index = this.#routes.findIndex((item) => item === route);
            this.#routes.splice(index, index + 1);
        }

        return this;
    }

    public async run(request: IRequest): Promise<ActionResponse> {
        const route = this.#routes.find((route) => route.test(request.route));
        assert(route, () => new RouteNotFound(request.route));

        this.logger.debug("match", route);

        const state: StateType = {};
        const matches = route.match(request.route);
        const routeContext = {
            request,
            context: this.#unit.context,
            args: new Map<string, string>(Object.entries(matches)),
        };

        if (isDefined(route.payload)) {
            const {payload} = route;
            Object.assign(state, await payload.validate(routeContext));
        }

        Object.freeze(state);
        await request.linkState?.(state);

        return this.#unit.run(route.action, state);
    }

    public getRoutes(): IRoute<ActionAny<C>>[] {
        return this.#routes;
    }
}
