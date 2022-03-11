import {BucketPolicyAbstract} from "./BucketPolicyAbstract";

export enum MinIOBucketPolicyEnum {
    READONLY = "public-readonly",
}

export class MinIOBucketPolicy extends BucketPolicyAbstract {
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
