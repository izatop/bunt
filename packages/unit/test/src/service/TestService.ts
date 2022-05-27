import {Service} from "../../../src";

export type TestInstance = {service: string};

export class TestService extends Service<TestInstance> {
    public async resolve(): Promise<TestInstance> {
        return Promise.resolve({service: "test"});
    }
}
