import * as crypto from "crypto";
import {Context, resolve} from "../../../src";
import {BaseContext} from "./BaseContext";
import {MemoryDb} from "./services/MemoryDb";
import {MemoryDbServiceResolver} from "./services/MemoryDbServiceResolver";

export class MainContext extends BaseContext {
    protected readonly prefix = "db";

    @resolve
    public get memoryDb(): MemoryDbServiceResolver {
        return new MemoryDbServiceResolver(this.prefix);
    }

    public get randomBytes(): Buffer {
        return crypto.randomBytes(8);
    }

    public async getMemoryDb(): Promise<MemoryDb> {
        return Context.resolve(this.memoryDb);
    }
}
