import {Application, IRoute} from "@bunt/app";
import {Action, ActionTransactionHandlers, ContextArg, IRunnable} from "@bunt/unit";
import {CommandContext} from "./Context/CommandContext.js";
import {RequestCommand} from "./Request/index.js";

export class Commander<C extends CommandContext> {
    readonly #application: Application<C>;

    protected constructor(application: Application<C>) {
        this.#application = application;
    }

    public static async execute<C extends CommandContext>(
        context: ContextArg<C>,
        routes: IRoute<Action<C, any, IRunnable | void>>[] = [],
        handlers: ActionTransactionHandlers<C> = {}): Promise<IRunnable | void> {
        const command = new this<C>(await Application.factory<C>(context, routes));
        command.#application.on(handlers);

        return command.handle();
    }

    public async handle(): Promise<IRunnable | void> {
        const {context} = this.#application;
        const request = new RequestCommand(context.program.args);

        return this.#application.run(request);
    }
}
