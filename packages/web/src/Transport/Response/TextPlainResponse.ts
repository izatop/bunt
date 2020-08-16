import {ResponseAbstract} from "./ResponseAbstract";

export class TextPlainResponse extends ResponseAbstract<string> {
    public readonly type: string = "text/plain";

    public stringify(data: string): string {
        return data;
    }
}
