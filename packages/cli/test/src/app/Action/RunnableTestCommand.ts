import {IRunnable} from "@bunt/unit";
import {Command} from "../../../../src";
import {BaseContext} from "../Context/BaseContext";
import {RunnableTest} from "../RunnableTest";

export class RunnableTestCommand extends Command<BaseContext> {
    public run(): IRunnable {
        return new RunnableTest();
    }
}
