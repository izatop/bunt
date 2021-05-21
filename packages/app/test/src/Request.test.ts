import {JSONTransform, URLEncodedFormTransform} from "../../src";
import {Request} from "./app/Request/Request";

describe("Request", () => {
    test("JSONTransform", async () => {
        const request = new Request(
            "/u/123",
            {"Content-Type": "application/json;"},
            JSON.stringify({field1: "Value1", num: 123}),
        );

        expect(() => request.headers.assert("content-type", "application/json")).not.toThrow();
        expect(await JSONTransform(request))
            .toMatchSnapshot();
    });

    test("FormTransform", async () => {
        const request = new Request(
            "/u/123",
            {"Content-Type": "application/json"},
            "key=value&foo=bar",
        );

        expect(await URLEncodedFormTransform(request))
            .toMatchSnapshot();
    });
});
