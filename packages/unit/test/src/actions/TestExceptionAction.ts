import {assert} from "@bunt/util";
import {Action} from "../../../src";
import {BaseContext} from "../context/BaseContext";

export class TestExceptionAction extends Action<BaseContext, { error: string }> {
    public run(): void {
        assert(false, this.state.error);
    }
}
