export interface ITestType {
    name: string;
    age: number;
    parent?: ITestType;
    children?: ITestType[];
    links: string[];
}
