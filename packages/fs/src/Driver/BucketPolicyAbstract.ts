import {assert} from "@bunt/assert";

export type PolicyFn = (bucket: string) => string;

export abstract class BucketPolicyAbstract {
    public readonly policies = new Map<string, PolicyFn>();

    public getPolicy(bucket: string, maybe: string): string {
        const policy = this.policies.get(maybe);
        assert(policy, `Unknown bucket policy ${maybe}`);

        return policy(bucket);
    }
}
