import {Command} from "../../../src";
import {BaseContext} from "../context/BaseContext";

export class BaseTestCommand extends Command<BaseContext, { name: string }> {
    public execute(): void {
        return;
    }
}
