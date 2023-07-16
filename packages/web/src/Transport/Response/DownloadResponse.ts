import {createReadStream, statSync} from "fs";
import {Readable} from "stream";
import {ResponseAbstract} from "./ResponseAbstract.js";

export class DownloadResponse extends ResponseAbstract<string> {
    constructor(filename: string, path: string, mimeType: string) {
        const {size} = statSync(path);
        super(path, {headers: {
            "Content-Disposition": `attachment; filename=${filename}`,
            "Content-Length": size.toString(),
            "Content-Type": mimeType,
        }});
    }

    public stringify(path: string): Readable {
        return createReadStream(path);
    }
}
