import {FileStorage} from "../FileStorage";
import {IBucketOptions} from "../interfaces";
import {FsBucket} from "./FsBucket";

export class FsBucketList {
    readonly #fs: FileStorage;
    readonly #buckets = new Map<string, FsBucket>();

    constructor(fs: FileStorage) {
        this.#fs = fs;
    }

    public ensure(name: string, options: IBucketOptions = {}): FsBucket {
        const bucket = this.#buckets.get(name) || this.factory(name, options);
        if (!this.#buckets.has(name)) {
            this.#buckets.set(name, bucket);
        }

        return bucket;
    }

    protected factory(name: string, options: IBucketOptions = {}): FsBucket {
        return new FsBucket(this.#fs, name, options);
    }
}
