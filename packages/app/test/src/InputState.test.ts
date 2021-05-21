import {Application} from "../../src";
import TestInputStateValidationRoute from "./app/Action/TestInputStateValidationRoute";
import {BaseContext} from "./app/Context/BaseContext";
import {Request} from "./app/Request/Request";

describe("Route", () => {
    const bd = new Date("2020-11-08T12:18:06.051Z").toISOString();
    const headers = {"Content-Type": "application/json", "Authorization": "s5sChdDmOPmFLtEEsq4L"};
    const request = new Request("/test", headers, JSON.stringify({bd, name: "Peter"}));
    const failRequest = new Request("/test", headers, JSON.stringify({}));

    test("Success", async () => {
        const app = await Application.factory(new BaseContext(), [TestInputStateValidationRoute]);
        const response = await app.run(request);
        expect({response, request}).toMatchSnapshot();
    });

    test("Fails", async () => {
        const app = await Application.factory(new BaseContext(), [TestInputStateValidationRoute]);
        await expect(app.run(failRequest)).rejects.toMatchSnapshot();
    });
});
