import {memoize} from "../../../../src";

export class MemoizeTest {
    @memoize
    public static test(): number {
        return Math.random();
    }
}
