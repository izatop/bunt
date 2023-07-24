import {createReadStream} from "fs";
import {Readable} from "stream";
import {isString} from "@bunt/is";
import {Defer} from "@bunt/async";
import {ResponseAbstract, ResponseArgs} from "./ResponseAbstract.js";

type DownloadSource = string | Readable;
type DownloadOptions = {
    filename: string;
    mimeType: string;
    source: DownloadSource;
    size?: number;
};

export class DownloadResponse extends ResponseAbstract<Readable> {
    constructor(options: DownloadOptions) {
        super(...createOptions(options));
    }

    public serialize(source: Readable): Readable {
        return source;
    }
}

async function createHeaders(readable: Readable, options: DownloadOptions): Promise<Record<string, string>> {
    const size = options.size ?? await getReadableLength(readable);
    const headers: Record<string, string> = {
        "Content-Disposition": `attachment; filename=${options.filename}`,
        "Content-Length": size.toString(),
        "Content-Type": options.mimeType,
    };

    return headers;
}

async function getReadableLength(readable: Readable): Promise<number> {
    const deferSize = new Defer<number>();
    if (readable.readable) {
        deferSize.resolve(readable.readableLength);
    } else {
        readable.on("readable", () => deferSize.resolve(readable.readableLength));
        readable.on("error", deferSize.reject);
    }

    return deferSize;
}

function factoryReadableStream(options: DownloadOptions): Readable {
    if (isString(options.source)) {
        return createReadStream(options.source);
    }

    return options.source;
}

function createOptions(options: DownloadOptions): ResponseArgs<Readable> {
    const readable = factoryReadableStream(options);

    return [readable, {headers: createHeaders(readable, options)}];
}
