import type { Request, Response } from "express";
import { updateProfileSchema, deleteProfileSchema } from "./profile.schema.js";
import { successResponse } from "../../shared/utils/ApiResponse.js";
import { profileService } from "./profile.service.js";

export const profileController = {
    async getProfile(req: Request, res: Response) {
        if (!req.auth?.tenantId || !req.auth?.userId) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const profile = await profileService.getProfile(req.auth.tenantId, req.auth.userId);
        return res.status(200).json(successResponse("Profile fetched successfully", profile));
    },

    async updateProfile(req: Request, res: Response) {
        if (!req.auth?.tenantId || !req.auth?.userId || !req.auth?.role) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        const parsed = updateProfileSchema.parse(req.body);
        const profile = await profileService.updateProfile(req.auth.tenantId, req.auth.userId, parsed);
        return res.status(200).json(successResponse("Profile updated successfully", profile));
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