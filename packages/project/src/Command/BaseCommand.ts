import {Command} from "@bunt/cli";
import {StateType} from "@bunt/unit";
import {IProjectContext} from "../ProjectContext";

export abstract class BaseCommand<S extends StateType = null>
    extends Command<IProjectContext, S> {
}
