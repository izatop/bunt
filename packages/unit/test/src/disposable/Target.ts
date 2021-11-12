import {IDisposable} from "../../../src";

export const disposedIds = new Set<string>();

export class Target implements IDisposable {
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    public async dispose() {
        disposedIds.add(this.id);
    }
}
