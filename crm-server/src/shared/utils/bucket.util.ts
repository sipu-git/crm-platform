import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { clientBucket } from "../configs/media.config.js";

export const generateImageUrl = async (fileKey?: string | null): Promise<string | null> => {
    if (!fileKey) return null;
    if (fileKey.startsWith("http://") || fileKey.startsWith("https://")) {
        return fileKey;
    }
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) return null;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
        });
        return await getSignedUrl(clientBucket, command, {
            expiresIn: 60 * 60 * 24 * 7,
        });
    } catch (error) {
        console.error("Error generating presigned URL for fileKey:", fileKey, error);
        return null;
    }
};