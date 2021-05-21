import {Application, RouteNotFound} from "../../src";
import HelloWorldRoute from "./app/Action/HelloWorldRoute";
import {BaseContext} from "./app/Context/BaseContext";
import {Request} from "./app/Request/Request";

describe("Route", () => {
    const headers = {"Content-Type": "application/json"};

    test("Success", async () => {
        const app = await Application.factory(new BaseContext(), [HelloWorldRoute]);
        const request = new Request(
            "/u/123",
            headers,
            JSON.stringify({name: "World"}),
        );

        const response = await app.run(request);
        expect({request, response}).toMatchSnapshot();
    });

    test("Validation fails", async () => {
        const app = await Application.factory(new BaseContext(), [HelloWorldRoute]);
        const wrongRequest = new Request(
            "/u/123",
            headers,
            JSON.stringify({}),
        );

        await expect(app.run(wrongRequest))
            .rejects
            .toThrow("Assertion failed");
    });

    test("Route not found", async () => {
        const app = await Application.factory(new BaseContext());
        const request = new Request("/wrong-uri", {});
        await expect(app.run(request)).rejects.toThrowError(RouteNotFound);
    });
});
