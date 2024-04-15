import {createReadStream, createWriteStream} from "fs";
import {Readable} from "stream";
import {randomUUID} from "crypto";
import {tmpdir} from "os";
import {stat, unlink} from "fs/promises";
import {join} from "path";
import {isString, isUndefined} from "@bunt/is";
import {Defer} from "@bunt/async";
import {ResponseAbstract, ResponseArgs} from "./ResponseAbstract.js";

type DownloadSource = string | Readable;
type DownloadOptions = {
    filename: string;
    mimeType: string;
    source: DownloadSource;
    size: number;
};

type DownloadOptionsAuth = {
    filename: string;
    mimeType: string;
    source: DownloadSource;
    size?: number;
};

export class DownloadResponse extends ResponseAbstract<Readable> {
    constructor(options: DownloadOptionsAuth) {
        super(...createOptions(options));
    }

    public serialize(source: Readable): Readable {
        return source;
    }
}

function createHeaders(options: DownloadOptions): Record<string, string> {
    const size = options.size;
    const attributes = [
        "attachment",
        `filename="${encodeURI(options.filename)}"`,
        // Safari https://datatracker.ietf.org/doc/html/rfc5987#section-3.2.2
        `filename*=utf-8''${encodeURI(options.filename)}`,
    ];

    const headers: Record<string, string> = {
        "Content-Disposition": attributes.join("; "),
        "Content-Length": size.toString(),
        "Content-Type": options.mimeType,
    };

    return headers;
}

function factoryReadableStream(source: string | Readable): Readable {
    if (isString(source)) {
        return createReadStream(source);
    }

    return source;
}

function createOptions(options: DownloadOptionsAuth): ResponseArgs<Readable> {
    const {size} = options;
    if (isUndefined(size)) {
        return createTemporarySource(options);
    }

    const readable = factoryReadableStream(options.source);

    return [readable, {headers: createHeaders({...options, size})}];
}

function createTemporarySource(options: DownloadOptionsAuth): ResponseArgs<Readable> {
    const inputReadable = factoryReadableStream(options.source);
    const tmpname = join(tmpdir(), randomUUID());
    const writable = createWriteStream(tmpname);
    const defer = new Defer<number>();
    writable.once("close", () => stat(tmpname).then((s) => defer.resolve(s.size)));
    inputReadable.pipe(writable);

    const ready = (): Readable => createReadStream(tmpname).once("close", () => unlink(tmpname));
    const headers = (size: number): Record<string, string> => createHeaders({...options, size});

    return [
        Promise.resolve(defer.then(ready)),
        {headers: Promise.resolve(defer.then(headers))},
    ];
}
