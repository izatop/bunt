import {ClientConnectionAbstract} from "./ClientConnectionAbstract";

export class ClientConnection extends ClientConnectionAbstract<string> {
    protected parse(payload: Buffer): string {
        return payload.toString("utf-8");
    }

    protected serialize(payload: string): string {
        return payload;
    }

}
