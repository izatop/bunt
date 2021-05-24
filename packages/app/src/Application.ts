import {ApplyContext, Context, ContextArg, IContext, unit, Unit} from "@bunt/unit";
import {assert, isDefined, logger, Logger} from "@bunt/util";
import {ActionResponse, IRequest, MatchRoute} from "./interfaces";
import {IRoute, RouteNotFound} from "./Route";

export class Application<C extends IContext> {
    @logger
    protected logger!: Logger;

    protected readonly unit: Unit<C>;
    protected readonly route: IRoute[] = [];

    constructor(u: Unit<C>, routes: MatchRoute<C, IRoute>[] = []) {
        this.unit = u;

        if (routes.length > 0) {
            routes.forEach((route) => this.add(route));
        }
    }

    public get context(): C {
        return this.unit.context;
    }

    public get size(): number {
        return this.route.length;
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: MatchRoute<C, IRoute>[] = []): Promise<Application<ApplyContext<C>>> {
        return new this(await unit<C>(context), routes);
    }

    public add<R extends IRoute>(route: MatchRoute<C, R>): this {
        this.logger.debug("add", route);
        assert(!this.unit.has(route.action), `This route was already added`);
        this.unit.add(route.action);
        this.route.push(route);
        return this;
    }

    public remove<R extends IRoute>(route: MatchRoute<C, R>): this {
        if (this.unit.has(route.action)) {
            this.logger.debug("remove", route);
            this.unit.remove(route.action);
            const index = this.route.findIndex((item) => item === route);
            this.route.splice(index, index + 1);
        }

        return this;
    }

    public async run(request: IRequest): Promise<ActionResponse> {
        const route = this.route.find((route) => route.test(request.route));
        assert(route, () => new RouteNotFound(request.route));

        this.logger.debug("match", route);

        const unit = this.unit;
        const state: Record<string, unknown> = {};
        const matches = route.match(request.route);
        const routeContext = {
            request,
            context: unit.context,
            args: new Map<string, string>(Object.entries(matches)),
        };

        if (isDefined(route.payload)) {
            const {payload} = route;
            Object.assign(state, await payload.validate(routeContext));
        }

        return unit.run(route.action, state);
    }

    public getRoutes(): IRoute[] {
        return this.route;
    }
}
