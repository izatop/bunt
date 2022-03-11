import {FsDriverAbstract} from "../Driver/FsDriverAbstract";
import {FileStorage} from "../FileStorage";

export interface IBucketOptions {
    region?: string;
}

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

    public async write(id: string, file: string, metadata: Record<any, any>): Promise<string> {
        return this.#driver.write(this.name, id, file, metadata);
    }

    public async save(): Promise<void> {
        await this.#driver.createBucket(this.name, this.region, true);
    }
}
