import {
    ActionAny,
    ActionTransactionHandlers,
    ApplyContext,
    Context,
    ContextArg,
    StateType,
    Unit,
    unit,
} from "@bunt/unit";
import {logger, Logger} from "@bunt/util";
import {assert} from "@bunt/assert";
import {isDefined} from "@bunt/is";
import {ActionResponse, IRequest} from "./interfaces.js";
import {IRoute, RouteNotFound} from "./Route/index.js";

export class Application<C extends Context> {
    @logger
    declare protected readonly logger: Logger;

    readonly #unit: Unit<C>;
    readonly #routes = new Set<IRoute<ActionAny<C>>>();
    readonly #index: IRoute<ActionAny<C>>[] = [];

    constructor(unit: Unit<C>, routes: IRoute<ActionAny<C>>[] = []) {
        this.#unit = unit;

        if (routes.length > 0) {
            routes.forEach((route) => this.add(route));
        }
    }

    public get context(): ApplyContext<C> {
        return this.#unit.context;
    }

    public get size(): number {
        return this.#routes.size;
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: IRoute<ActionAny<C>>[] = []): Promise<Application<C>> {
        return new this(await unit(context), routes);
    }

    public add(route: IRoute<ActionAny<C>>): this {
        this.logger.debug("add", route);
        assert(!this.#routes.has(route), `Duplicate route: ${route.route}`);
        this.#routes.add(route);
        this.#index.push(route);

        return this;
    }

    public remove(route: IRoute<ActionAny<C>>): this {
        this.logger.debug("remove", route);
        this.#routes.delete(route);

        this.#index.length = 0;
        this.#index.push(...this.#routes.values());

        return this;
    }

    public async run(request: IRequest): Promise<ActionResponse> {
        const [action, state] = await this.#unit.watch(async () => {
            const route = this.#index.find((route) => route.test(request.route));
            assert(route, () => new RouteNotFound(request.route));

            this.logger.debug("match", route);

            const state: StateType = {};
            const matches = route.match(request.route);

            if (isDefined(route.payload)) {
                const {payload} = route;

                Object.assign(state, await payload.validate({
                    request,
                    context: this.#unit.context,
                    args: new Map<string, string>(Object.entries(matches)),
                }));
            }

            const freezedState = Object.freeze(state);
            await request.linkState?.(freezedState);

            return [route.action, freezedState];
        });

        return this.#unit.run(action, state);
    }

    public on(handlers: ActionTransactionHandlers<C>): void {
        this.#unit.on(handlers);
    }

    public getRoutes(): IRoute<ActionAny<C>>[] {
        return this.#index;
    }

    public captureException(reason: unknown): void {
        this.logger.error("Unexpected error", reason);

        const {error} = this.#unit.getTransactionHandlers();
        error?.(reason, this.context);
    }
}
