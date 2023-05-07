import {TextPlainResponse} from "./TextPlainResponse.js";

export class HTMLResponse extends TextPlainResponse {
    public readonly type = "text/html";
}
