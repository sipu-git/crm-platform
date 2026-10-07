import express from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.middleware.js";
import { profileController } from "./profile.controller.js";
import { updateProfileSchema, deleteProfileSchema } from "./profile.schema.js";
import { validate } from "../../shared/middleware/validate.middeware.js";
import { authGuard } from "../../shared/middleware/authGuard.middleware.js";
import { tenantContext } from "../../shared/middleware/tenantContext.middleware.js";
import multer from "multer";

const mediaUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();
router.use(authGuard, tenantContext);

router.get("/", asyncHandler(profileController.viewProfile));
router.patch("/", validate({ body: updateProfileSchema }), asyncHandler(profileController.updateProfile));

// Separate dedicated endpoints for user profile picture vs tenant workspace logo
router.post("/user-picture", mediaUpload.single("file"), asyncHandler(profileController.uploadProfilePicture));
router.post("/picture", mediaUpload.single("file"), asyncHandler(profileController.uploadProfilePicture));

router.post("/tenant-logo", mediaUpload.single("file"), asyncHandler(profileController.uploadTenantLogo));
router.post("/logo", mediaUpload.single("file"), asyncHandler(profileController.uploadTenantLogo));

router.delete("/", validate({ body: deleteProfileSchema }), asyncHandler(profileController.deleteProfile));

export default router;
