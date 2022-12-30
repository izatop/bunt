import {AsyncSingleCall} from "../../src";

test("AsyncSingleCall", async () => {
    let counter = 0;
    const test = async (): Promise<void> => {
        counter++;
    };

    const caller = new AsyncSingleCall(test);
    await caller.call();
    expect(counter).toBe(1);
    expect(caller.call()).toStrictEqual(caller.call());

    await caller.call();
    expect(counter).toBe(2);

    await caller.call();
    expect(counter).toBe(3);
});
