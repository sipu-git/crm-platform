import express from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.middleware.js";
import { profileController } from "./profile.controller.js";
import { updateProfileSchema, deleteProfileSchema } from "./profile.schema.js";
import { validate } from "../../shared/middleware/validate.middeware.js";
import { authGuard } from "../../shared/middleware/authGuard.middleware.js";
import { tenantContext } from "../../shared/middleware/tenantContext.middleware.js";

const router = express.Router();
router.use(authGuard, tenantContext);

router.get("/", asyncHandler(profileController.getProfile));
router.patch("/", validate({ body: updateProfileSchema }), asyncHandler(profileController.updateProfile));
router.delete("/", validate({ body: deleteProfileSchema }), asyncHandler(profileController.deleteProfile));

export default router;