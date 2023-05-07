import {hostname} from "os";
import {MessageAbstract} from "./MessageAbstract.js";

export abstract class TransactionAbstract<T> extends MessageAbstract<T> {
    public static getBackupKey(): string {
        return `${this.channel}:backup:${hostname()}`;
    }

    public static getFallbackKey(): string {
        return `${this.channel}:fallback`;
    }
}
