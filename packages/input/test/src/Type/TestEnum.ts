import {Enum} from "../../../src";

export enum TestEnum {
    STR = "str",
    NUM = 1,
}

export const TestEnumType = new Enum(TestEnum);
