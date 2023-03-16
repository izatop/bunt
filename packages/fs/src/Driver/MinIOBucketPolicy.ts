import {BucketPolicyAbstract} from "./BucketPolicyAbstract";

export class MinIOBucketPolicy extends BucketPolicyAbstract {
    public static PUBLIC_READONLY = "public-readonly";

    constructor() {
        super();

        this.policies.set(MinIOBucketPolicy.PUBLIC_READONLY, this.getPublicReadOnlyPolicy);
    }

    public getPublicReadOnlyPolicy(bucket: string): string {
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
