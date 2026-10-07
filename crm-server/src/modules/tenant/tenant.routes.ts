import express from "express";
import multer from "multer";
import { asyncHandler } from "../../shared/middleware/asyncHandler.middleware.js";
import { authGuard } from "../../shared/middleware/authGuard.middleware.js";
import { tenantContext } from "../../shared/middleware/tenantContext.middleware.js";
import { profileController } from "../profiles/profile.controller.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();
router.use(authGuard, tenantContext);

// Dedicated separate API routes specifically for modifying tenant_logo
router.post("/modify-logo", upload.single("file"), asyncHandler(profileController.uploadTenantLogo));
router.post("/tenant-logo", upload.single("file"), asyncHandler(profileController.uploadTenantLogo));

export default router;

