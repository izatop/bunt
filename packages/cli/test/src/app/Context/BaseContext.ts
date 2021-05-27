import {ApplyContext} from "@bunt/unit";
import {CommandContext} from "../../../../src";

export class BaseContext extends CommandContext {
}

export type IBaseContext = ApplyContext<BaseContext>;
