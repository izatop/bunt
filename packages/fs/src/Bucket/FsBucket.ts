import http from "node:http";
import https from "node:https";
import {Readable} from "node:stream";
import {FileStorage} from "../FileStorage";
import {FsDriverAbstract} from "../Driver/FsDriverAbstract";
import {FsWritableFile, IBucketOptions} from "../interfaces";

export class FsBucket {
    public readonly name: string;
    public readonly region?: string;
    readonly #driver: FsDriverAbstract;

    constructor(fs: FileStorage, name: string, options: IBucketOptions = {}) {
        this.#driver = fs.getDriver();
        this.name = name;
        this.region = options.region;
    }

    public setPolicy(policy: string): Promise<void> {
        return this.#driver.setBucketPolicy(this.name, policy);
    }

    public getPolicy(): Promise<string> {
        return this.#driver.getBucketPolicy(this.name);
    }

    public getPresignedUrl(file: string, expire: number = 7 * 24 * 60 * 60): Promise<string> {
        return this.#driver.getPresignedUrl(this.name, file, expire);
    }

    public putPresignedUrl(file: string, expire: number = 60 * 60): Promise<string> {
        return this.#driver.putPresignedUrl(this.name, file, expire);
    }

    public removeObject(file: string): Promise<void> {
        return this.#driver.removeObject(this.name, file);
    }

    public deletePresignedUrl(file: string, expire: number = 60 * 60): Promise<string> {
        return this.#driver.deletePresignedUrl(this.name, file, expire);
    }

    public async write(path: string, file: FsWritableFile, metadata: Record<any, any>): Promise<string> {
        return this.#driver.write(this.name, path, file, metadata);
    }

    public async writeRemoteURL(path: string, url: string, metadata: Record<any, any>): Promise<string> {
        const get = url.startsWith("https") ? https.get : http.get;
        const stream = await new Promise<Readable>((resolve, reject) => (
            get(url, (res) => resolve(res))
                .on("error", reject)
                .end()
        ));

        return this.write(path, stream, metadata);
    }

    public async save(): Promise<void> {
        await this.#driver.createBucket(this.name, this.region, true);
    }
}
