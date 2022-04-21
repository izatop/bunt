import {unit, Unit} from "../../src";
import {BaseTestAction} from "./actions/BaseTestAction";
import {ProfileTestAction} from "./actions/ProfileTestAction";
import {TestExceptionAction} from "./actions/TestExceptionAction";
import {BaseContext} from "./context/BaseContext";

const ActionImport = () => import("./actions/BaseTestAction");

test("Unit", async () => {
    const app = await unit(new BaseContext());

    expect(await unit(new BaseContext())).toBeInstanceOf(Unit);
    expect(await unit(Promise.resolve(new BaseContext()))).toBeInstanceOf(Unit);
    expect(await unit(() => new BaseContext())).toBeInstanceOf(Unit);
    expect(await unit(() => Promise.resolve(new BaseContext()))).toBeInstanceOf(Unit);

    const name = Date.now().toString(32);
    const helloWorldRun: string = await app.run(BaseTestAction, {name});
    expect(helloWorldRun).toBe(`Hello, ${name}!`);

    const asyncTest = await app.run(ActionImport, {name: "AsyncTest"});
    expect(asyncTest).toBe("Hello, AsyncTest!");

    await app.run(ProfileTestAction, null);

    const error = "Should thrown the Error";
    await expect(app.run(TestExceptionAction, {error}))
        .rejects.toThrow(error);
});
