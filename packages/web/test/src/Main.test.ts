import {resolve} from "path";
import {stat} from "fs/promises";
import {Context} from "@bunt/unit";
import * as HTTP from "http-status";
import {isReadableStream} from "@bunt/util";
import {DownloadResponse, JSONResponse, NoContentResponse, RedirectResponse, WebServer} from "../../src";
import HelloWorldRoute from "./app/Action/HelloWorldRoute";

describe("Response", () => {
    test("Main", async () => {
        const resp = new NoContentResponse({headers: {"foo": "123"}});
        expect(resp.getContentType()).toMatchSnapshot();
        expect(await resp.getResponse()).toMatchSnapshot();
        expect(resp.code).toBe(204);
    });

    test("JSON", async () => {
        const resp = new JSONResponse({foo: "bar"}, {code: 200});
        expect(resp.getContentType()).toMatchSnapshot();
        expect(await resp.getResponse()).toMatchSnapshot();
        expect(resp.code).toBe(200);
    });

    test("Redirect", async () => {
        const redirect = new RedirectResponse("/redirect");
        expect(redirect.code).toBe(HTTP["MOVED_PERMANENTLY"]);
        expect(redirect.status).toBe(HTTP["301"]);
        expect(await redirect.getResponse()).toMatchSnapshot();

        expect(() => new RedirectResponse("/", 500)).toThrow();
    });

    test("Download", async () => {
        const source = resolve(__dirname, "app", "download.txt");
        const download = new DownloadResponse({
            source,
            filename: "download.txt",
            mimeType: "text/plain",
            size: await stat(source).then((s) => s.size),
        });

        expect(download.code).toBe(HTTP["OK"]);
        expect(download.status).toBe(HTTP["200"]);
        const {body, ...headers} = await download.getResponse();
        expect(isReadableStream(body)).toBeTruthy();
        expect(headers).toMatchSnapshot();
    });

    test("Download (auto)", async () => {
        const download = new DownloadResponse({
            filename: "download.txt",
            mimeType: "text/plain",
            source: resolve(__dirname, "app", "download.txt"),
        });

        expect(download.code).toBe(HTTP["OK"]);
        expect(download.status).toBe(HTTP["200"]);
        const {body, ...headers} = await download.getResponse();
        expect(isReadableStream(body)).toBeTruthy();
        expect(headers).toMatchSnapshot();
    });

    test("WebServer", async () => {
        const webServer = await WebServer.factory(
            new Context(),
            [],
            {headers: {"x-ww-header": "y"}},
        );

        webServer.add(HelloWorldRoute);
        expect(webServer).toBeInstanceOf(WebServer);
        expect(webServer.size).toBe(1);
    });
});
