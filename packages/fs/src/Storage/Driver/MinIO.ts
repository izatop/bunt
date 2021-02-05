import {assert} from "@bunt/util";
import {Client} from "minio";
import {parse} from "url";
import {FsDriverAbstract} from "./FsDriverAbstract";
import {MinIOBucketPolicy} from "./MinIOBucketPolicy";

const DEFAULT_REGION = "default";

export class MinIO extends FsDriverAbstract {
    readonly #client: Client;
    readonly #policy = new MinIOBucketPolicy();

    constructor(dsn: string) {
        super();
        const {auth, hostname: endPoint, port, protocol} = parse(dsn);
        assert(auth, "Authorization is required");
        assert(endPoint, "Endpoint is required");
        assert(port, "Port is required");

        const [accessKey, secretKey] = auth?.split(":");
        this.#client = new Client({
            useSSL: protocol?.startsWith("https"),
            port: parseInt(port),
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

    public getPresignedUrl(bucket: string, file: string): Promise<string> {
        return this.#client.presignedUrl('GET', bucket, file, 24*60*60);
    }

    public async createBucket(name: string, region?: string, checkExists = true): Promise<void> {
        if (checkExists && await this.#client.bucketExists(name)) {
            return;
        }

        await this.#client.makeBucket(name, region ?? DEFAULT_REGION);
    }

    public write(bucket: string, name: string, file: string, metadata: Record<any, any>): Promise<string> {
        return this.#client.fPutObject(bucket, name, file, metadata);
    }
}
