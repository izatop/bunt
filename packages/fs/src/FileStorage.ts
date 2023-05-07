import {FsBucket} from "./Bucket/FsBucket.js";
import {FsBucketList} from "./Bucket/FsBucketList.js";
import {FsDriverAbstract} from "./Driver/FsDriverAbstract.js";
import {IBucketOptions} from "./interfaces.js";

export class FileStorage {
    readonly #driver: FsDriverAbstract;
    readonly #buckets: FsBucketList;

    constructor(driver: FsDriverAbstract) {
        this.#driver = driver;
        this.#buckets = new FsBucketList(this);
    }

    public getBucket(name: string, options: IBucketOptions = {}): FsBucket {
        return this.#buckets.ensure(name, options);
    }

    public getDriver(): FsDriverAbstract {
        return this.#driver;
    }
}
