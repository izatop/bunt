import {IDisposable} from "../Runtime/index.js";

export abstract class Disposable implements IDisposable {
    public abstract dispose(): Promise<void>;
}
