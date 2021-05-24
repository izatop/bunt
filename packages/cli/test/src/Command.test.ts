import {Resolver, RouteRule} from "@bunt/app";
import {Fields, Text} from "@bunt/input";
import {Commander} from "../../src";
import {BaseTestCommand} from "./action/BaseTestCommand";
import {command} from "./command";
import {BaseContext} from "./context/BaseContext";

test("Command", async () => {
    const baseTestCommand = command(BaseTestCommand, new RouteRule(
        "test",
        new Fields({name: Text}),
        new Resolver({name: ({context}) => context.args.getOption("name")}),
    ));

    const context = new BaseContext(["test", "--name=test"]);
    const action = await Commander.execute(context, [baseTestCommand]);
    expect(action).toMatchSnapshot();
});
