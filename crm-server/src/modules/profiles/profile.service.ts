import { prisma } from "../../../lib/prisma.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { UpdateProfileInput, splitProfileInput } from "./profile.schema.js";
import { tenantProfileRepository } from "./repository/tenant.repository.js";
import { userRepository } from "./repository/users.repository.js";

export const profileService = {
    async getProfile(tenantId: string, userId: string) {
        const [user, tenant] = await Promise.all([
            userRepository.findById(prisma, tenantId, userId),
            tenantProfileRepository.findById(prisma, tenantId),
        ]);
        return { user, tenant };
    },

    async updateProfile(tenantId: string, userId: string, data: UpdateProfileInput) {
        const existing = await userRepository.findById(prisma, tenantId, userId);
        if (!existing) throw ApiError.notFound("User not found");

        const { userFields, tenantFields } = splitProfileInput(data);
        const tenantFieldKeys = Object.keys(tenantFields);

        if (tenantFieldKeys.length > 0) {
            throw ApiError.forbidden(
                `Only workspace owners and admins can update: ${tenantFieldKeys.join(", ")}`,
            );
        }
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

        return { ...updatedUser, ...updatedTenant };
    },

    async deleteProfile(tenantId: string, userId: string, confirmEmail: string) {
        const existing = await userRepository.findById(prisma, tenantId, userId);
        if (!existing) throw ApiError.notFound("User not found");

        if (confirmEmail.trim().toLowerCase() !== existing.email.toLowerCase()) {
            throw ApiError.badRequest("Confirmation email does not match your account email");
        }

        // if (existing.role === "OWNER") {
        //   const ownerCount = await profileRepository.countOwnersInTenant(prisma, tenantId);
        //   if (ownerCount <= 1) {
        //     throw ApiError.badRequest(
        //       "You're the only Owner on this workspace. Transfer ownership to another user before deleting your account.",
        //     );
        //   }
        // }

        await userRepository.delete(prisma, userId);
        return { deleted: true };
    },
};