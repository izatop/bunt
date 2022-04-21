import {Context, Unit} from "../../src";
import {AsyncServiceTestAction} from "./actions/AsyncServiceTestAction";
import {MainContext} from "./context/MainContext";
import {MemoryDb} from "./context/services/MemoryDb";

test("Context", async () => {
    const state = {key: "key"};
    const mainContext = new MainContext();
    const context = await Context.apply(mainContext);
    const {memoryDb} = context;

    expect(memoryDb).toBeInstanceOf(MemoryDb);
    expect(context === await Context.apply(mainContext)).toBe(true);
    expect(await mainContext.memoryDb.resolve()).toBeInstanceOf(MemoryDb);
    expect(await context.getMemoryDb()).toBeInstanceOf(MemoryDb);
    expect(await context.getMemoryDb() === context.memoryDb).toBe(true);

    expect(context.parentDb).toBeInstanceOf(MemoryDb);
    expect(context.randomBytes).not.toStrictEqual(context.randomBytes);
    expect(context.randomBytes).toBeInstanceOf(Buffer);

    const unit = await Unit.factory(() => mainContext);
    const res = await unit.run(AsyncServiceTestAction, state);
    expect(memoryDb.get(state.key)).toBe(res);
});
