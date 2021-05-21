import {Resolver, RouteRule} from "@bunt/app";
import {Fields, Text} from "@bunt/input";
import {Command} from "../../src/Command";
import {BaseTestAction} from "./action/BaseTestAction";
import {command} from "./command";
import {BaseContext} from "./context/BaseContext";

test("Command", async () => {
    const baseTestCommand = command(BaseTestAction, new RouteRule(
        "test",
        new Fields({name: Text}),
        new Resolver({name: () => "test"}),
    ));

    const app = await Command.factory(new BaseContext(), [baseTestCommand]);
    expect(await app.handle(["test", "--foo=bar", "-f"])).toBe(undefined);
    await expect(app.handle()).rejects.toThrow();
});
