
export class MemoizeTest {
    @memoize
    public static test(): number {
        return Math.random();
    }
}
