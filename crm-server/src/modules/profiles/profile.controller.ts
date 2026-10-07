import type { Request, Response } from "express";
import { updateProfileSchema, deleteProfileSchema } from "./profile.schema.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";
import { profileService } from "./profile.service.js";
import { ApiError } from "../../shared/utils/ApiError.js";

export const profileController = {
    async viewProfile(req: Request, res: Response) {
        if (!req.auth?.userId || !req.auth?.tenantId) {
            throw ApiError.unauthorized("Unauthorized");
        }
        const profile = await profileService.getProfile(req.auth.tenantId, req.auth.userId);
        return res.status(200).json(successResponse("Profile fetched successfully", profile));
    },

    async updateProfile(req: Request, res: Response) {
        if (!req.auth?.tenantId || !req.auth?.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const parsed = updateProfileSchema.parse(req.body);
        const profile = await profileService.updateProfile(req.auth.tenantId, req.auth.userId, parsed);
        return res.status(200).json(successResponse("Profile updated successfully", profile));
    },

    async uploadProfilePicture(req: Request, res: Response) {
        if (!req.auth?.tenantId || !req.auth?.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const file = req.file || (req.files && (req.files as any)[0]);
        if (!file) {
            throw ApiError.badRequest("Profile picture file is required");
        }
        const result = await profileService.uploadProfilePicture(req.auth.tenantId, req.auth.userId, file);
        return res.status(200).json(successResponse("Profile picture uploaded successfully", result));
    },

    async uploadTenantLogo(req: Request, res: Response) {
        if (!req.auth?.tenantId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const file = req.file || (req.files && (req.files as any)[0]);
        if (!file) {
            throw ApiError.badRequest("Company logo file is required");
        }
        const result = await profileService.uploadTenantLogo(req.auth.tenantId, file);
        return res.status(200).json(successResponse("Company logo uploaded successfully", result));
    },

    async deleteProfile(req: Request, res: Response) {
        if (!req.auth?.tenantId || !req.auth?.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const parsed = deleteProfileSchema.parse(req.body);
        const result = await profileService.deleteProfile(req.auth.tenantId, req.auth.userId, parsed.confirm_email);
        return res.status(200).json(successResponse("Account deleted successfully", result));
    },
};
