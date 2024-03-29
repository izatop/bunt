import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import {Socket} from "net";
import {Application, IRoute} from "@bunt/app";
import {ActionAny, Context, ContextArg, Heartbeat, IDisposable, IRunnable, unit, Unit} from "@bunt/unit";
import {
    assert,
    Ctor,
    Logger,
    PermissionError,
    NotFound,
    ValidationError,
    Defer,
    logger,
    AssertionError,
    isError,
} from "@bunt/util";
import {
    IErrorResponseHeaders,
    IProtocolAcceptor,
    IResponderOptions,
    Responder,
    ResponseAbstract,
} from "./Transport/index.js";

export class WebServer<C extends Context> extends Application<C> implements IDisposable, IRunnable {
    @logger
    declare protected readonly logger: Logger;

    readonly #server: http.Server;
    readonly #state = new Defer<void>();

    readonly #options: IResponderOptions;
    readonly #acceptors = new Map<string, IProtocolAcceptor>();
    readonly #errorCodeMap = new Map<Ctor<Error>, IErrorResponseHeaders>();

    protected constructor(unit: Unit<C>, routes: IRoute<ActionAny<C>>[] = [], options?: IResponderOptions) {
        super(unit, routes);
        this.#server = new http.Server();
        this.#options = options ?? {};

        this.#server.once("close", () => this.#state.resolve());
        this.setExceptionResponseHeaders(
            [PermissionError, {code: 403, status: "Permission denied"}],
            [ValidationError, {code: 400, status: "Validation error"}],
            [NotFound, {code: 404, status: "Not found"}],
        );
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: IRoute<ActionAny<C>>[] = [],
        options?: IResponderOptions): Promise<WebServer<C>> {
        return new this(await unit(context), await this.preload(routes), options);
    }

    private static preload<C extends Context>(routes: IRoute<ActionAny<C>>[]): Promise<IRoute<any>[]> {
        return Promise.all(
            routes.map(async (route) => (
                Object.assign(route, {action: await Unit.getAction(route.action)})
            )),
        );
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this)
            .enqueue(this.#state)
            .onDispose(this);
    }

    public listen(port: number, backlog?: number): this {
        assert(!this.#server.listening, "Server already in listening mode");

        this.#server.on("upgrade", this.handleUpgrade);
        this.#server.on("request", this.handleRequest)
            .on("listening", () => this.logger.info("listen", {port}))
            .listen({port, backlog});

        return this;
    }

    public setUpgradeProtocolAcceptor(acceptor: IProtocolAcceptor): () => void {
        const protocol = acceptor.protocol.toLowerCase();
        assert(
            !this.#acceptors.has(protocol),
            `The ${acceptor.protocol} acceptor has already exists`,
        );

        this.logger.info("Set upgrade protocol acceptor", {protocol});
        this.#acceptors.set(protocol, acceptor);

        return () => this.#acceptors.delete(protocol);
    }

    public setExceptionResponseHeaders(...map: [error: Ctor<Error>, options: IErrorResponseHeaders][]): this {
        for (const [error, options] of map) {
            this.#errorCodeMap.set(error, options);
        }

        return this;
    }

    public async dispose(): Promise<void> {
        assert(this.#server.listening, "Server was destroyed");

        this.logger.info("close");
        this.#server.close();

        return this.#state;
    }

    protected async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const request = new Responder(req, res, this.#errorCodeMap, this.#options);

        try {
            if (!request.validate(this)) {
                return request.respond(new AssertionError("Validate request failed"));
            }
        } catch (reason) {
            if (reason instanceof ResponseAbstract) {
                return request.respond(reason);
            }

            if (isError(reason)) {
                throw reason;
            }
        }

        return request.respond(
            await this.run(request)
                .catch((reason) => reason),
        );
    }

    private handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        try {
            this.logger.debug(`${req.method} ${req.url}`);
            await this.handle(req, res);
        } catch (reason) {
            this.captureException(reason);

            if (!res.headersSent) {
                res.writeHead(500, "Internal Server Error");
            }
        } finally {
            if (res.writable) {
                res.end();
            }
        }
    };

    private handleUpgrade = (req: IncomingMessage, socket: Socket, head: Buffer): void => {
        const {upgrade} = req.headers;
        try {
            assert(upgrade, "Upgrade headers mustn't be empty");

            const protocol = upgrade.toLowerCase();
            const acceptor = this.#acceptors.get(protocol);
            assert(acceptor, `Unsupported protocol ${protocol}`);
            acceptor.handle(req, socket, head);
        } catch (error) {
            this.captureException(error);

            const response = [
                "HTTP/1.1 400 Bad request",
                "Content-Type: text/plain",
                "Content-Length: 0",
                "Connection: close",
                "",
            ];

            socket.end(response.join("\r\n"));
        }
    };
}
