import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { clientBucket } from "../../../shared/configs/media.config.js";
import { generateImageUrl } from "../../../shared/utils/bucket.util.js";
import { userRepository } from "./users.repository.js";
import { tenantProfileRepository } from "./tenant.repository.js";
import { PrismaClientTx } from "../../../shared/utils/prisma.types.js";
import { ApiError } from "../../../shared/utils/ApiError.js";
import crypto from "node:crypto";

const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"]);

export const mediaRepository = {
    async uploadFileToS3(file: Express.Multer.File, folder: string): Promise<string> {
        if (!file) {
            throw ApiError.badRequest("File is required");
        }
        if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
            throw ApiError.badRequest("Invalid file type. Only PNG, JPEG, JPG, and WEBP images are allowed.");
        }
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) {
            throw new Error("AWS_BUCKET_NAME environment variable is not configured");
        }

        const extension = file.mimetype.split("/")[1] || "png";
        const fileKey = `${folder}/${crypto.randomUUID()}.${extension}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await clientBucket.send(command);
        return fileKey;
    },

    async deleteFileFromS3(fileKey?: string | null): Promise<void> {
        if (!fileKey || fileKey.startsWith("http://") || fileKey.startsWith("https://")) return;
        const bucketName = process.env.AWS_BUCKET_NAME;
        if (!bucketName) return;

        try {
            const command = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: fileKey,
            });
            await clientBucket.send(command);
        } catch (error) {
            console.error("Failed to delete file from S3:", fileKey, error);
        }
    },

    async updateUserProfilePicture(tx: PrismaClientTx, tenantId: string, userId: string, file: Express.Multer.File) {
        const user = await userRepository.findById(tx, tenantId, userId);
        if (!user) {
            throw ApiError.notFound("User not found");
        }

        const fileKey = await this.uploadFileToS3(file, `profile/${tenantId}`);

        if (user.profilePic) {
            await this.deleteFileFromS3(user.profilePic);
        }

        const updatedUser = await userRepository.update(tx, userId, { profilePic: fileKey });
        const imageUrl = await generateImageUrl(fileKey);

        return {
            user: updatedUser,
            profilePic: fileKey,
            imageUrl,
        };
    },

    async updateTenantLogo(tx: PrismaClientTx, tenantId: string, file: Express.Multer.File) {
        const tenant = await tenantProfileRepository.findById(tx, tenantId);
        if (!tenant) {
            throw ApiError.notFound("Tenant workspace not found");
        }

        const fileKey = await this.uploadFileToS3(file, `tenant-logo/${tenantId}`);

        if (tenant.logo_url) {
            await this.deleteFileFromS3(tenant.logo_url);
        }

        const updatedTenant = await tenantProfileRepository.update(tx, tenantId, { logo_url: fileKey });
        const logoUrl = await generateImageUrl(fileKey);

        return {
            tenant: updatedTenant,
            logo_url: fileKey,
            logoUrl,
        };
    },
};