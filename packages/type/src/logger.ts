export type LogableType = string
| Record<any, any>
| number
| bigint
| null
| undefined
| boolean
| Date
| unknown;

export interface ILogable<T extends LogableType> {
    getLogValue(): T;
}

export type Logable = ILogable<LogableType> | LogableType | Logable[];
