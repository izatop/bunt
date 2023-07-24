import {ResponseAbstract} from "./ResponseAbstract.js";

export class TextPlainResponse extends ResponseAbstract<string> {
    public readonly type: string = "text/plain";

    public serialize(data: string): string {
        return data;
    }
}
