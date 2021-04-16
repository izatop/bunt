export interface ITestDescription {
    author: string;
    date: Date;
    text: string;
}

export interface ITestHobby {
    type: string,
    description?: ITestDescription;
}

export interface ITestType {
    name: string;
    age: number;
    parent?: ITestType;
    children?: ITestType[];
    links: string[];
    hobby?: ITestHobby;
}
