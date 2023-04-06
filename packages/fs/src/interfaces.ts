import {Readable} from "stream";

export interface IBucketOptions {
    region?: string;
}

export type FsWritable = string | Buffer | Readable;

export type FsSource = string | Buffer | Readable | URL;

export type FsStat = {
    size: number;
    etag: string;
    lastModified: Date;
    metadata: Record<string, any>;
};
