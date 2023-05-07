import {ClientConnectionAbstract} from "../../Connection/index.js";
import {GQLOperationMessage} from "./index.js";

export class GQLClientConnection extends ClientConnectionAbstract<GQLOperationMessage> {
    protected parse(payload: Buffer): GQLOperationMessage {
        return JSON.parse(payload.toString("utf-8"));
    }

    protected serialize(payload: GQLOperationMessage): string {
        return JSON.stringify(payload);
    }
}
