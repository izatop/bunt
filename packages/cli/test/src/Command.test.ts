import {ok} from "assert";
import {Resolver, RouteRule} from "@bunt/app";
import {Fields, Nullable, Text} from "@bunt/input";
import {dispose, Heartbeat, isDisposable, isRunnable} from "@bunt/unit";
import {command, Commander} from "../../src";
import {BaseTestCommand} from "./app/Action/BaseTestCommand";
import {BaseContext} from "./app/Context/BaseContext";

describe("Command", () => {
    test("should return runnable", async () => {
        const testCommand = command(BaseTestCommand, new RouteRule(
            "test",
            new Fields({name: new Nullable(Text)}),
            new Resolver({name: ({context}) => context.args.getOption("name")}),
        ));

        const context = new BaseContext(["test", "--name=test"]);
        const result = await Commander.execute(context, [testCommand]);

        expect(isRunnable(result)).toBe(true);
        ok(isRunnable(result));

        expect(isDisposable(result)).toBe(true);
        ok(isDisposable(result));

        await dispose(result);
        await expect(Heartbeat.watch(result)).resolves.toBeUndefined();
        expect(result.getHeartbeat().beats).toBe(false);
    });

    test("should return void", async () => {
        const testCommand = command(BaseTestCommand, new RouteRule(
            "test",
            new Fields({name: new Nullable(Text)}),
            new Resolver({name: ({context}) => context.args.getOption("name")}),
        ));

        const context = new BaseContext(["test"]);
        const result = await Commander.execute(context, [testCommand]);
        expect(result).toBeUndefined();
    });
});
