import {unit, Unit} from "../../src";
import {BaseTestAction} from "./actions/BaseTestAction";
import {NeverRunAction} from "./actions/NeverRunAction";
import {ProfileTestAction} from "./actions/ProfileTestAction";
import {TestExceptionAction} from "./actions/TestExceptionAction";
import {BaseContext} from "./context/BaseContext";

test("Unit", async () => {
    const app = await unit(new BaseContext());

    expect(await Unit.factory(new BaseContext())).toBeInstanceOf(Unit);
    expect(await Unit.factory(() => new BaseContext())).toBeInstanceOf(Unit);

    await expect(app.run(NeverRunAction, null)).rejects.toThrow();
    expect(app.has(BaseTestAction)).toBe(false);
    expect(app.add(BaseTestAction)).toEqual([BaseTestAction]);
    expect(app.has(BaseTestAction)).toBe(true);

    const name = Date.now().toString(32);
    const helloWorldRun: string = await app.run(BaseTestAction, {name});
    expect(helloWorldRun).toBe(`Hello, ${name}!`);

    app.add(ProfileTestAction);
    await app.run(ProfileTestAction, null);

    const error = "Should thrown the Error";
    app.add(TestExceptionAction);
    await expect(app.run(TestExceptionAction, {error}))
        .rejects.toThrow(error);
});
