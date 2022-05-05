import {resolve} from "path";
import {CommandContext} from "@bunt/cli";
import {ApplyContext} from "@bunt/unit";
import {ResourceStore} from "./Resource";

export class ProjectContext extends CommandContext {
    public get store(): ResourceStore {
        return new ResourceStore(resolve(__dirname, "../resources"));
    }
}

export type IProjectContext = ApplyContext<ProjectContext>;
