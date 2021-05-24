import {Application, IRoute} from "@bunt/app";
import {Action, ApplyContext, ContextArg, Disposable, Heartbeat, IDisposable, IRunnable} from "@bunt/unit";
import {CommandContext, ICommandContext} from "./Context/CommandContext";
import {RequestCommand} from "./Request";

export class Commander<C extends ICommandContext> implements IRunnable, IDisposable {
    readonly #application: Application<C>;

    protected constructor(application: Application<C>) {
        this.#application = application;
    }

    public static async execute<C extends CommandContext>(
        context: ContextArg<C>, routes: IRoute<Action<C, any, IRunnable>>[] = []): Promise<Commander<ApplyContext<C>>> {
        const command = new this(await Application.factory(context, routes));
        return command.handle();
    }

    public async handle(): Promise<Commander<any>> {
        const {context} = this.#application;
        const request = new RequestCommand(context.program.args);

        return this.#application.run(request);
    }

    public async dispose(): Promise<void> {
        return;
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this, (fn) => Disposable.attach(this, fn));
    }
}
