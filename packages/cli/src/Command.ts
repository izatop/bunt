import {Application, IRoute, MatchRoute} from "@bunt/app";
import {ApplyContext, Context, ContextArg, IContext, unit} from "@bunt/unit";
import {RequestCommand} from "./Request";

export class Command<C extends IContext> extends Application<C> {
    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: MatchRoute<C, IRoute>[] = []): Promise<Command<ApplyContext<C>>> {
        return new this(await unit<C>(context), routes);
    }

    public async handle(argv?: string[]): Promise<void> {
        const request = new RequestCommand(argv);
        await this.run(request);
    }
}
