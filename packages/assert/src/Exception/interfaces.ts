export interface IReadableError {
    toSafeString(): string;

    toSafeJSON(): Record<any, any>;
}
