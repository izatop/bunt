import {MessageAbstract} from "../../../src";

export class BarMessage extends MessageAbstract<number> {
    public serialize(): string {
        return this.payload.toString();
    }

    public static parse(value: string): number {
        return parseInt(value, 10);
    }
}
