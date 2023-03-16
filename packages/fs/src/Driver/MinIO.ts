import {URL} from "url";
import {assert, isString} from "@bunt/util";
import {Client} from "minio";
import {FsWritableFile} from "../interfaces";
import {FsDriverAbstract} from "./FsDriverAbstract";
import {MinIOBucketPolicy} from "./MinIOBucketPolicy";

const DEFAULT_REGION = "default";

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

    public async write(bucket: string, name: string, file: FsWritableFile, metadata: Record<any, any>)
        : Promise<string> {
        const result = isString(file)
            ? this.#client.fPutObject(bucket, name, file, metadata)
            : this.#client.putObject(bucket, name, file, metadata);

        return (await result).etag;
    }
}
