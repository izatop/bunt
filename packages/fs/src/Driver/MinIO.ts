import {URL} from "url";
import {Readable} from "stream";
import {assert, isString} from "@bunt/util";
import {Client, UploadedObjectInfo} from "minio";
import fetch from "node-fetch";
import {FsSource, FsStat, FsWritable} from "../interfaces";
import {FsDriverAbstract} from "./FsDriverAbstract";
import {MinIOBucketPolicy} from "./MinIOBucketPolicy";

const DEFAULT_REGION = "default";
const protocols = ["http:", "https:"];

export class MinIO extends FsDriverAbstract {
    readonly #client: Client;
    readonly #policy = new MinIOBucketPolicy();

    constructor(dsn: string) {
        super();
        const {username: accessKey, password: secretKey, hostname: endPoint, port, protocol} = new URL(dsn);
        assert(accessKey && secretKey, "Authorization is required");
        assert(endPoint, "Endpoint is required");

        this.#client = new Client({
            useSSL: protocol?.startsWith("https"),
            port: port ? parseInt(port) : (protocol?.startsWith("https") ? 443 : 80),
            endPoint,
            accessKey,
            secretKey,
        });
    }

    public async setBucketPolicy(bucket: string, policy: string): Promise<void> {
        await this.#client.setBucketPolicy(bucket, this.#policy.getPolicy(bucket, policy));
    }

    public getBucketPolicy(bucket: string): Promise<string> {
        return this.#client.getBucketPolicy(bucket);
    }

    public getPresignedUrl(bucket: string, file: string, expire: number): Promise<string> {
        return this.#client.presignedUrl("GET", bucket, file, expire);
    }

    public putPresignedUrl(bucket: string, file: string, expire: number): Promise<string> {
        return this.#client.presignedUrl("PUT", bucket, file, expire);
    }

    public deletePresignedUrl(bucket: string, file: string, expire: number): Promise<string> {
        return this.#client.presignedUrl("DELETE", bucket, file, expire);
    }

    public removeObject(bucket: string, file: string): Promise<void> {
        return this.#client.removeObject(bucket, file);
    }

    public async createBucket(name: string, region?: string, checkExists = true): Promise<void> {
        if (checkExists && await this.#client.bucketExists(name)) {
            return;
        }

        await this.#client.makeBucket(name, region ?? DEFAULT_REGION);
    }

    public async write(bucket: string, name: string, file: FsWritable, metadata: Record<string, any>)
        : Promise<string> {
        const op = isString(file)
            ? this.#client.fPutObject(bucket, name, file, metadata)
            : this.#client.putObject(bucket, name, file, metadata);

        return (await op).etag;
    }

    public get(bucket: string, file: string): Promise<Readable> {
        return this.#client.getObject(bucket, file);
    }

    public async stat(bucket: string, file: string): Promise<FsStat> {
        const {metaData: metadata, ...stat} = await this.#client.statObject(bucket, file);

        return {
            metadata,
            ...stat,
        };
    }

    public async put(
        bucket: string,
        name: string,
        source: FsSource,
        metadata?: Record<string, any>,
    ): Promise<FsStat> {
        await this.#put(bucket, name, source, metadata);

        return this.stat(bucket, name);
    }

    async #put(
        bucket: string,
        name: string,
        source: FsSource,
        metadata: Record<string, any> = {},
    ): Promise<UploadedObjectInfo> {
        if (source instanceof URL) {
            if (source.protocol.startsWith("file")) {
                return this.#client.fPutObject(bucket, name, source.pathname, metadata);
            }

            if (protocols.includes(source.protocol)) {
                const response = await fetch(source, {redirect: "follow", follow: 5});
                const known = ["content-type"];
                const headers = Object.fromEntries(
                    [...response.headers.entries()]
                        .filter(([key]) => known.includes(key)),
                );

                assert(response.body, `Response body is null for URL ${source.href}`);

                return this.#client.putObject(
                    bucket,
                    name,
                    response.body as Readable,
                    {...headers, ...metadata},
                );
            }

            throw new Error(`Unsupported protocol: ${source.protocol}`);
        }

        return this.#client.putObject(bucket, name, source, metadata);
    }
}
