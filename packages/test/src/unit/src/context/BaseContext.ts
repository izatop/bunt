import {Context} from "@typesafeunit/unit";

export class BaseContext extends Context {
    public version = "1.0.0";
    public startAt = new Date();
}
