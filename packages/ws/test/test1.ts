import {Resolver, RouteRule} from "@bunt/app";
import {Fields, Text} from "@bunt/input";
import {ApplyContext, Context} from "@bunt/unit";
import {debugLogFormat, Logger, SeverityLevel, StdErrorTransport, StdOutTransport} from "@bunt/util";
import {WebServer} from "@bunt/web";
import {EchoProtoHandle, WebSocketServer} from "@bunt/ws";
import * as crypto from "crypto";
import * as websocket from "websocket";

class TestContext extends Context {}

type ITestContext = ApplyContext<TestContext>;

class TestHandle extends EchoProtoHandle<ITestContext, {authorization: string}> {
    public async run(): Promise<void> {
        for await (const message of this.connection) {
            this.send("hello");
            this.logger.info("received", {message});
        }
    }
}

function conn() {
    return new Promise<websocket.connection>((resolve, reject) => {
        const client = new websocket.client();
        client.on("connectFailed", function (error) {
            // eslint-disable-next-line
            console.log("[CLIENT] Connect Error: " + error.toString());
            reject(error);
        });

        client.on("connect", function (connection) {
            // console.log("[CLIENT] WebSocket Client Connected");
            resolve(connection);

            connection.on("error", function (error) {
                // eslint-disable-next-line
                console.log("[CLIENT] Connection Error: " + error.toString());
            });

            connection.on("close", function (code, reason = "None") {
                // eslint-disable-next-line
                console.log(`[CLIENT] close: { code: ${code}, reason: ${reason} }`);
            });

            connection.on("message", function (message) {
                if (message.type === "utf8") {
                    // console.log("[CLIENT] Received: '" + message.utf8Data + "'");
                }
            });

            connection.on("ping", () => {
                // console.log("[CLIENT] ping");
            });

            function sendNumber() {
                if (connection.connected) {
                    const number = Math.round(Math.random() * 0xFFFFFF);
                    connection.sendUTF(number.toString());
                    setTimeout(sendNumber, 2000);
                }
            }

            sendNumber();
        });

        client.connect(
            "ws://127.0.0.1:3333/admin",
            "echo-protocol",
            "localhost",
            {authorization: "Bearer " + crypto.randomBytes(128).toString("base64")},
        );
    });
}

async function main() {
    try {
        Logger.setSeverity(SeverityLevel.INFO);
        Logger.set([new StdErrorTransport(debugLogFormat), new StdOutTransport(debugLogFormat)]);

        const server = await WebServer.factory(new TestContext());
        const ws = await WebSocketServer.attachTo(server);
        ws.route<TestHandle>(
            TestHandle,
            new RouteRule(
                "/admin",
                new Fields({authorization: Text}),
                new Resolver({
                    authorization: ({request: {headers}}) => headers.get("authorization"),
                }),
            ),
        );

        const clients = 1024;
        const backlog = 128;
        await server.listen(3333, backlog);
        const all = [];
        const ready = [];
        const errors = [];
        const connecting = new Set();
        while (all.length < clients) {
            if (connecting.size < 128) {
                const pending = conn();
                all.push(pending);
                connecting.add(pending);
                pending
                    .then((value) => ready.push(value))
                    .catch((error) => errors.push(error))
                    .finally(() => connecting.delete(pending));
                continue;
            }

            // eslint-disable-next-line
            console.log("stat", {
                all: all.length,
                ready: ready.length,
                error: errors.length,
            });

            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        await Promise.allSettled(all);

        // eslint-disable-next-line
        console.log("finish", {
            all: all.length,
            ready: ready.length,
            error: errors.length,
        });
    } catch (error) {
        // eslint-disable-next-line
        console.error(error);
    }
}

main();
