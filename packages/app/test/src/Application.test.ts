import {Application} from "../../src";
import HelloWorldRoute from "./app/Action/HelloWorldRoute";
import {BaseContext} from "./app/Context/BaseContext";

test("Application", async () => {
    const app = await Application.factory(async () => new BaseContext(), []);
    expect(app).toBeInstanceOf(Application);
    expect(app.size).toBe(0);
    app.add(HelloWorldRoute);

    expect(app.size).toBe(1);
    expect(() => app.add(HelloWorldRoute)).toThrow();

    app.remove(HelloWorldRoute);
    expect(app.size).toBe(0);
});
