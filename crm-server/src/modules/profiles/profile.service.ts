import { prisma } from "../../../lib/prisma.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { UpdateProfileInput, splitProfileInput } from "./profile.schema.js";
import { tenantProfileRepository } from "./repository/tenant.repository.js";
import { userRepository } from "./repository/users.repository.js";
import { mediaRepository } from "./repository/media.repository.js";
import redisService from "../../shared/redis/caching.js";
import { generateImageUrl } from "../../shared/utils/bucket.util.js";

export const profileService = {
    async uploadProfilePicture(tenantId: string, userId: string, file: Express.Multer.File) {
        return mediaRepository.updateUserProfilePicture(prisma, tenantId, userId, file);
    },

    async uploadTenantLogo(tenantId: string, file: Express.Multer.File) {
        return mediaRepository.updateTenantLogo(prisma, tenantId, file);
    },

    async getProfile(tenantId: string, userId: string) {
        const [user, tenant] = await Promise.all([
            userRepository.findById(prisma, tenantId, userId),
            tenantProfileRepository.findById(prisma, tenantId),
        ]);
        if (!user) throw ApiError.notFound("User not found");

        const userProfilePicUrl = user.profilePic ? await generateImageUrl(user.profilePic) : null;
        const tenantLogoUrl = tenant?.logo_url ? await generateImageUrl(tenant.logo_url) : null;

        return {
            user: {
                ...user,
                profilePicUrl: userProfilePicUrl,
            },
            tenant: tenant ? {
                ...tenant,
                logoUrl: tenantLogoUrl,
            } : null,
        };
    },

    async updateProfile(tenantId: string, userId: string, data: UpdateProfileInput) {
        const existing = await userRepository.findById(prisma, tenantId, userId);
        if (!existing) throw ApiError.notFound("User not found");

        const { userFields, tenantFields } = splitProfileInput(data);
        const tenantFieldKeys = Object.keys(tenantFields);

        if (userFields.email && userFields.email !== existing.email) {
            const emailTaken = await userRepository.findByEmail(prisma, tenantId, userFields.email);
            if (emailTaken) throw ApiError.conflict("This email is already in use");
        }

        const [updatedUser, updatedTenant] = await Promise.all([
            Object.keys(userFields).length > 0
                ? userRepository.update(prisma, userId, userFields)
                : userRepository.findById(prisma, tenantId, userId),
            tenantFieldKeys.length > 0
                ? tenantProfileRepository.update(prisma, tenantId, tenantFields)
                : tenantProfileRepository.findById(prisma, tenantId),
        ]);

        if (tenantFieldKeys.length > 0) {
            await Promise.all([
                redisService.deleteByPattern(`invoice-get-${tenantId}-*`),
                redisService.deleteByPattern(`invoice-list-${tenantId}-*`),
            ]);
        }

        const userProfilePicUrl = updatedUser?.profilePic ? await generateImageUrl(updatedUser.profilePic) : null;
        const tenantLogoUrl = updatedTenant?.logo_url ? await generateImageUrl(updatedTenant.logo_url) : null;

        return {
            user: updatedUser ? { ...updatedUser, profilePicUrl: userProfilePicUrl } : null,
            tenant: updatedTenant ? { ...updatedTenant, logoUrl: tenantLogoUrl } : null,
        };
    },

    async deleteProfile(tenantId: string, userId: string, confirmEmail: string) {
        const existing = await userRepository.findById(prisma, tenantId, userId);
        if (!existing) throw ApiError.notFound("User not found");

        if (confirmEmail.trim().toLowerCase() !== existing.email.toLowerCase()) {
            throw ApiError.badRequest("Confirmation email does not match your account email");
        }

        await userRepository.delete(prisma, userId);
        return { deleted: true };
    },
};
