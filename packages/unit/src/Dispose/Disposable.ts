import {IDisposable} from "../Runtime";

export abstract class Disposable implements IDisposable {
    public abstract dispose(): Promise<void>;
}
