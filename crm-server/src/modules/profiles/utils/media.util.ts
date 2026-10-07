import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { clientBucket } from "../../../shared/configs/media.config";

export const deleteImageObject = async (key: string) => {
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  });

  await clientBucket.send(command);
};
