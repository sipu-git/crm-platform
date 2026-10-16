import {S3Client} from "@aws-sdk/client-s3";
import { env } from "./env";

export const clientBucket = new S3Client({
    region: env.aws.region,
    ...(env.aws.accessKeyId && env.aws.secretAccessKey ? {
        credentials: {
            accessKeyId: env.aws.accessKeyId,
            secretAccessKey: env.aws.secretAccessKey,
        }
    } : {}),
})
