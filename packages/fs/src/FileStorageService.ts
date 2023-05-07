import {Service} from "@bunt/unit";
import {FsDriverAbstract} from "./Driver/FsDriverAbstract.js";
import {FileStorage} from "./FileStorage.js";

export class FileStorageService extends Service<FileStorage> {
    readonly #driver: FsDriverAbstract;

    constructor(driver: FsDriverAbstract) {
        super();
        this.#driver = driver;
    }

    public async resolve(): Promise<FileStorage> {
        return new FileStorage(this.#driver);
    }
}
