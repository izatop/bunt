import {Command} from "@bunt/cli";
import {IProjectContext} from "../ProjectContext";

export abstract class BaseCommand<S extends Record<string, any> | null = null>
    extends Command<IProjectContext, S> {
}
