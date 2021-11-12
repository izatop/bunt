import {dispose, isDisposable, isRunnable} from "@bunt/unit";
import {ok} from "assert";
import {Commander} from "../../src";
import {RunnableTestCommand} from "./app/Action/RunnableTestCommand";
import {command} from "./app/command";
import {BaseContext} from "./app/Context/BaseContext";

test("Runnable Command", async () => {
    const testCommand = command(RunnableTestCommand, "test");
    const result = await Commander.execute(new BaseContext(["test"]), [testCommand]);
    expect(isRunnable(result)).toBe(true);
    ok(isRunnable(result));

    const heartbeat = result.getHeartbeat();
    const pending = heartbeat.watch();

    expect(heartbeat.beats).toBe(true);
    expect(pending.then).not.toBeUndefined();

    expect(isDisposable(result)).toBe(true);
    ok(isDisposable(result));

    await dispose(result);
});
