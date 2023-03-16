import {FsWritableFile} from "../interfaces";

export abstract class FsDriverAbstract {
    public abstract createBucket(name: string, region?: string, checkExists?: boolean): Promise<void>;

    public abstract write(bucket: string, name: string, file: FsWritableFile, metadata: Record<any, any>)
    : Promise<string>;

    public abstract setBucketPolicy(bucket: string, policy: string): Promise<void>;

    public abstract getBucketPolicy(bucket: string): Promise<string>;

    public abstract getPresignedUrl(bucket: string, file: string, expire: number): Promise<string>;

    public abstract putPresignedUrl(bucket: string, file: string, expire: number): Promise<string>;

    public abstract removeObject(bucket: string, file: string): Promise<void>;

    public abstract deletePresignedUrl(bucket: string, file: string, expire: number): Promise<string>;
}
