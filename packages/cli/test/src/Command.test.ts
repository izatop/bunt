import {Resolver, RouteRule} from "@bunt/app";
import {Fields, Nullable, Text} from "@bunt/input";
import {dispose, Heartbeat, isRunnable} from "@bunt/unit";
import {Commander} from "../../src";
import {BaseTestCommand} from "./action/BaseTestCommand";
import {command} from "./command";
import {BaseContext} from "./context/BaseContext";

describe("Command", () => {
    test("should return runnable", async () => {
        const baseTestCommand = command(BaseTestCommand, new RouteRule(
            "test",
            new Fields({name: new Nullable(Text)}),
            new Resolver({name: ({context}) => context.args.getOption("name")}),
        ));

        const context = new BaseContext(["test", "--name=test"]);
        const result = await Commander.execute(context, [baseTestCommand]);

        expect(isRunnable(result)).toBe(true);

        await dispose(result);
        await expect(Heartbeat.watch(result)).resolves.toBeUndefined();
        expect(result.getHeartbeat().beats).toBe(false);
    });

    test("should return void", async () => {
        const baseTestCommand = command(BaseTestCommand, new RouteRule(
            "test",
            new Fields({name: new Nullable(Text)}),
            new Resolver({name: ({context}) => context.args.getOption("name")}),
        ));

        const context = new BaseContext(["test"]);
        const result = await Commander.execute(context, [baseTestCommand]);
        expect(result).toBeUndefined();
    });
});
