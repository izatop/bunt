import {assert} from "@bunt/util";
import {Action} from "../../../src";
import {BaseContext} from "../context/BaseContext";

export class NeverRunAction extends Action<BaseContext> {
    public run(): void {
        assert(false, "This method shouldn't run");
    }
}
