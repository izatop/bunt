import {Readable} from "stream";

export interface IBucketOptions {
    region?: string;
}

export type FsWritableFile = string | Readable | Buffer;
