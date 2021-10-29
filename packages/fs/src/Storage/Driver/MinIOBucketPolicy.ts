import {assert} from "@bunt/util";

export enum MinIOBucketPolicyEnum {
    READONLY = "public-readonly",
}

export class MinIOBucketPolicy {
    readonly #policies = new Map<MinIOBucketPolicyEnum,(bucket: string) => string>();

    public constructor() {
        this.#policies.set(MinIOBucketPolicyEnum.READONLY, this.publicReadOnlyPolicy);
    }

    public getPolicy(bucket: string, maybe: string): string {
        const policy = this.#policies.get(maybe as MinIOBucketPolicyEnum);
        assert(policy, `Unknown bucket policy ${maybe}`);
        return policy(bucket);
    }

    public publicReadOnlyPolicy(bucket: string): string {
        return JSON.stringify({
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicRead",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [`arn:aws:s3:::${bucket}/*`],
                },
            ],
        });
    }
}
