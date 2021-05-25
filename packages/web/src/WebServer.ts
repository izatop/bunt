import {Application, IRoute, RouteNotFound} from "@bunt/app";
import {ActionAny, Context, ContextArg, Heartbeat, IDisposable, IRunnable, unit, Unit} from "@bunt/unit";
import {assert, AssertionError, Ctor, logger, Logger} from "@bunt/util";
import * as http from "http";
import {IncomingMessage, ServerResponse} from "http";
import {Socket} from "net";
import {IErrorResponseHeaders, IProtocolAcceptor, IResponderOptions, Responder} from "./Transport";

export class WebServer<C extends Context> extends Application<C>
    implements IDisposable, IRunnable {
    @logger
    public readonly logger!: Logger;

    readonly #options: IResponderOptions;
    readonly #server: http.Server;
    readonly #acceptors = new Map<string, IProtocolAcceptor>();
    readonly #errorsHeadersMap = new Map<Ctor<Error>, IErrorResponseHeaders>();

    protected constructor(unit: Unit<C>, routes: IRoute<ActionAny<C>>[] = [], options?: IResponderOptions) {
        super(unit, routes);
        this.#server = new http.Server();
        this.#options = options ?? {};

        this.setExceptionResponseHeaders(
            [AssertionError, {code: 400}],
            [RouteNotFound, {code: 404, status: "Not found"}],
        );
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        routes: IRoute<ActionAny<C>>[] = [],
        options?: IResponderOptions): Promise<WebServer<C>> {
        return new this(await unit(context), routes, options);
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this, (resolve) => this.#server.once("close", resolve));
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

    public setExceptionResponseHeaders(...map: [error: Ctor<Error>, options: IErrorResponseHeaders][]): void {
        for (const [error, options] of map) {
            this.#errorsHeadersMap.set(error, options);
        }
    }

    public async dispose(): Promise<void> {
        this.logger.info("destroy");
        assert(this.#server.listening, "Server was destroyed");
        await new Promise<void>((resolve) => this.#server.close(() => resolve));
    }

    protected async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const finish = this.logger.perf("handle", req.url);
        const request = new Responder(req, res, this.#errorsHeadersMap, this.#options);

        try {
            assert(request.validate(this), "Invalid Request");
            const response = await this.run(request);
            await request.respond(response);
        } catch (error) {
            await request.respond(error);
        } finally {
            finish();
        }
    }

    private handleUpgrade = (req: IncomingMessage, socket: Socket, head: Buffer): void => {
        const {upgrade} = req.headers;
        try {
            assert(upgrade, "Upgrade headers mustn't be empty");

            const protocol = upgrade.toLowerCase();
            const acceptor = this.#acceptors.get(protocol);
            assert(acceptor, `Unsupported protocol ${protocol}`);
            acceptor.handle(req, socket, head);
        } catch (error) {
            this.logger.warning(error.message, error);
            socket.write(`HTTP/1.1 400 Bad request\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n`);
            socket.destroy(error);
        }
    };

    private handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        const finish = this.logger.perf("request", {method: req.method, url: req.url});
        try {
            this.logger.debug(`${req.method} ${req.url}`);
            await this.handle(req, res);
        } catch (error) {
            const {url, method, headers} = req;
            const request = {url, method, headers};
            const response = {writable: res.writable, headersSent: res.headersSent, headers: res.getHeaders()};
            this.logger.critical("Uncaught error", error);
            this.logger.debug(error.message, error, {request, response});

            if (!res.headersSent) {
                res.writeHead(500, "Internal Server Error");
            }
        } finally {
            finish();

            if (res.writable) {
                res.end();
            }
        }
    };
}
