import {Context} from "@bunt/unit";
import * as HTTP from "http-status";
import {JSONResponse, NoContentResponse, RedirectResponse, WebServer} from "../../src";
import HelloWorldRoute from "./app/Action/HelloWorldRoute";

describe("Response", () => {
    test("Main", async () => {
        const resp = new NoContentResponse({headers: {"foo": "123"}});
        expect(resp.getContentType()).toMatchSnapshot();
        expect(resp.getHeaders()).toMatchSnapshot();
        expect(await resp.getResponse()).toMatchSnapshot();
        expect(resp.code).toBe(204);
    });

    test("JSON", async () => {
        const resp = new JSONResponse({foo: "bar"}, {code: 200});
        expect(resp.getContentType()).toMatchSnapshot();
        expect(resp.getHeaders()).toMatchSnapshot();
        expect(await resp.getResponse()).toMatchSnapshot();
        expect(resp.code).toBe(200);
    });

    test("Redirect", async () => {
        const redirect = new RedirectResponse("/redirect");
        expect(redirect.code).toBe(HTTP["MOVED_PERMANENTLY"]);
        expect(redirect.status).toBe(HTTP["301"]);
        expect(await redirect.getResponse()).toMatchSnapshot();
        expect(redirect.getHeaders()).toMatchSnapshot();

        expect(() => new RedirectResponse("/", 500)).toThrow();
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
