import {FileStorage} from "../FileStorage";

export interface IBucketOptions {
    region?: string;
}

export class FsBucket {
    public readonly name: string;
    public readonly region?: string;
    protected ready = false;
    readonly #fs: FileStorage;

    constructor(fs: FileStorage, name: string, options: IBucketOptions = {}) {
        this.#fs = fs;
        this.name = name;
        this.region = options.region;
    }

    public setPolicy(policy: string): Promise<void> {
        return this.#fs.getDriver().setBucketPolicy(this.name, policy);
    }

    public getPolicy(): Promise<string> {
        return this.#fs.getDriver().getBucketPolicy(this.name);
    }

    public getPresignedUrl(file: string): Promise<string> {
        return this.#fs.getDriver().getPresignedUrl(this.name, file);
    }

    public async write(id: string, file: string, metadata: Record<any, any>): Promise<string> {
        if (!this.ready) {
            await this.save();
        }

        const driver = this.#fs.getDriver();
        return driver.write(this.name, id, file, metadata);
    }

    public async save(): Promise<void> {
        const driver = this.#fs.getDriver();
        await driver.createBucket(this.name, this.region, true);
        this.ready = true;
    }
}
