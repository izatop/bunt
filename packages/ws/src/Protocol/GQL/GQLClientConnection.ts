import {ClientConnectionAbstract} from "../../Connection";
import {GQLOperationMessage} from "./index";

export class GQLClientConnection extends ClientConnectionAbstract<GQLOperationMessage> {
    protected parse(payload: Buffer): GQLOperationMessage {
        return JSON.parse(payload.toString("utf-8"));
    }

    protected serialize(payload: GQLOperationMessage): Buffer {
        return Buffer.from(JSON.stringify(payload));
    }
}
