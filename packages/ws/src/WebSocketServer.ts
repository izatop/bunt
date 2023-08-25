import {IncomingMessage} from "http";
import {Socket} from "net";
import {URL} from "url";
import {IRoute, RegexpMatcher, Route, RouteNotFound, RouteRuleArg} from "@bunt/app";
import {
    ActionAny,
    ActionCtor,
    Context,
    ContextArg,
    Disposer,
    Heartbeat,
    IRunnable,
    ShadowState,
    unit,
    Unit,
} from "@bunt/unit";
import {AsyncSingleCall, Defer} from "@bunt/async";
import {RequestMessage, WebServer} from "@bunt/web";
import * as ws from "ws";
import {Logger, logger, resolveOrReject} from "@bunt/util";
import {assert} from "@bunt/assert";
import {isDefined, isString} from "@bunt/is";
import {WebSocketCloseReason} from "./const.js";
import {HandleProtoType, ProtoHandleAbstract} from "./Protocol/index.js";

type WebSocketPingQueue = {connection: ws.WebSocket; time: number};

export class WebSocketServer<C extends Context> extends Disposer implements IRunnable {
    @logger
    declare protected readonly logger: Logger;

    readonly #disposeAcceptor: () => void;
    readonly #servers = new Map<IRoute<ActionAny<C>>, ws.Server>();
    readonly #state = new Defer<void>();
    readonly #web: WebServer<C>;

    readonly #unit: Unit<C>;
    readonly #handles = new Map<string, Route<ProtoHandleAbstract<C, any>>>();
    readonly #limits = {
        maxConnections: 10240,
        pingsPerSecond: 512,
        pingTimeout: 60000,
    };

    protected constructor(unit: Unit<C>, server: WebServer<any>) {
        super();
        this.#web = server;
        this.#unit = unit;
        this.#disposeAcceptor = this.#web.setUpgradeProtocolAcceptor({
            protocol: "websocket",
            handle: this.handleUpgrade,
        });

        this.onDispose(server);
    }

    public static async attachTo<C extends Context>(server: WebServer<C>): Promise<WebSocketServer<C>>;
    public static async attachTo<C extends Context>(
        server: WebServer<any>,
        context: ContextArg<C>): Promise<WebSocketServer<C>>;

    public static async attachTo(
        server: WebServer<any>,
        context?: ContextArg<any>): Promise<WebSocketServer<any>> {
        if (context) {
            return new this(await unit(context), server);
        }

        return new this(Unit.from(server.context), server);
    }

    public route<A extends ProtoHandleAbstract<C, any>>(action: HandleProtoType<C, A>, rule: RouteRuleArg<A>): void {
        const route = new Route<A>((route) => RegexpMatcher.factory(route), action, rule);

        assert(!this.#handles.has(route.route), "Route must be unique");
        this.#handles.set(route.route, route);
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this)
            .enqueue(this.#state)
            .onDispose(this);
    }

    public async dispose(): Promise<void> {
        this.logger.info("destroy");

        try {
            this.#disposeAcceptor();

            const operations = [];
            for (const webSocket of this.#servers.values()) {
                try {
                    operations.push(new Promise<void>((resolve, reject) => {
                        webSocket.close(resolveOrReject(resolve, reject));
                    }));
                } catch (error) {
                    this.#web.captureException(error);
                }
            }

            await Promise.allSettled(operations);
            await super.dispose();
        } finally {
            this.#state.resolve();
        }
    }

    protected resolveRoute(route: string): Route<ProtoHandleAbstract<C, any>> | undefined {
        for (const item of this.#handles.values()) {
            if (item.test(route)) {
                return item;
            }
        }
    }

    protected getWebSocketServer(route: IRoute<ActionAny<C>>): ws.Server {
        const webSocketServer = this.#servers.get(route) ?? this.factoryWebSocketServer();
        if (!this.#servers.has(route)) {
            this.#servers.set(route, webSocketServer);
        }

        return webSocketServer;
    }

    protected factoryWebSocketServer(): ws.WebSocketServer {
        const alive = new WeakSet<ws.WebSocket>();
        const wss = new ws.WebSocketServer({noServer: true});
        const minIntervalMs = this.#limits.pingTimeout / (this.#limits.maxConnections / this.#limits.pingsPerSecond);
        const intervalMs = minIntervalMs > 5000 ? minIntervalMs : 5000;
        const queue: WebSocketPingQueue[] = [];

        wss.on("connection", (connection) => {
            alive.add(connection);
            queue.push({connection, time: Date.now()});
            connection.once("close", () => alive.delete(connection));
            connection.on("error", (reason) => this.logger.error("WebSocketClient", reason));
            connection.on("pong", () => alive.add(connection));
        });

        const {call: keepAlive} = new AsyncSingleCall(() => this.#keepAlive(alive, queue));
        const timerInterval = setInterval(keepAlive, intervalMs);
        wss.on("close", () => clearInterval(timerInterval));
        wss.on("error", (reason) => this.logger.error("WebSocket", reason));

        return wss;
    }

    #keepAlive(alive: WeakSet<ws.WebSocket>, queue: WebSocketPingQueue[]): void {
        const current = Date.now();
        while (queue.length > 0) {
            const {connection, time} = queue[0];
            if (time + this.#limits.pingTimeout > current) {
                return;
            }

            queue.shift();
            if (!alive.has(connection)) {
                return connection.terminate();
            }

            alive.delete(connection);
            queue.push({connection, time: Date.now()});

            connection.ping();
        }
    }

    protected handleUpgrade = async (req: IncomingMessage, socket: Socket, head: Buffer): Promise<void> => {
        try {
            assert(isString(req.url), "Malformed URL");
            this.logger.info("handle", {url: req.url});
            const {pathname} = new URL(req.url, "http://localhost");
            const route = this.resolveRoute(pathname);

            assert(route, () => new RouteNotFound(pathname));
            this.logger.debug("match", route);

            const state: Record<string, any> = {};
            const request = new RequestMessage(req);
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

            const ws = this.getWebSocketServer(route);
            ws.handleUpgrade(req, socket, head, async (connection) => {
                const action = await Unit.getAction(route.action);
                if (!this.isHandleProto(action)) {
                    connection.close(WebSocketCloseReason.INTERNAL_ERROR);

                    return;
                }

                if (!action.isSupported(connection.protocol)) {
                    connection.close(WebSocketCloseReason.PROTOCOL_ERROR);

                    return;
                }

                if (ws.clients.size >= this.#limits.maxConnections) {
                    connection.close(WebSocketCloseReason.TRY_AGAIN_LATER);

                    return;
                }

                this.logger.debug("Accept connection");
                ws.emit("connection", connection, req);
                ShadowState.set(state, connection);

                // @todo
                this.handle(connection, () => this.#unit.run(route.action as any, state));
            });
        } catch (error) {
            this.#web.captureException(error);

            const response = [
                "HTTP/1.1 404 Not found",
                "Content-Type: text/plain",
                "Content-Length: 0",
                "Connection: close",
                "",
            ];

            socket.end(response.join("\r\n"));
        }
    };

    protected async handle(connection: ws.WebSocket, action: () => Promise<unknown>): Promise<void> {
        try {
            await action();
            connection.close(WebSocketCloseReason.NORMAL_CLOSURE);
        } catch (error) {
            this.#web.captureException(error);
            connection.close(WebSocketCloseReason.INTERNAL_ERROR);
        }
    }

    protected isHandleProto<A extends HandleProtoType<any, any>>(action: ActionCtor<any>): action is A {
        return "protocol" in action;
    }
}
