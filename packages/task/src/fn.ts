import {Context} from "@bunt/unit";
import {Ctor} from "@bunt/type";
import {TaskAbstract} from "./TaskAbstract.js";
import {TaskConfig} from "./interfaces.js";

export function define<C extends Context, S extends Record<any, any>>(
    action: Ctor<TaskAbstract<C, S>>,
    config: Omit<TaskConfig<C, S>, "action">,
): TaskConfig<C, S> {
    return {action, ...config};
}
