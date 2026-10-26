import { Router } from "express";
import { asyncHandler } from "../../shared/middleware/asyncHandler.middleware";
import { aiController } from "./ai.controller";
import { authGuard } from "../../shared/middleware/authGuard.middleware";
import { automationRunController } from "./automation-run.controller.js";

const router = Router();

// Require authenticated user for all AI endpoints
router.use(authGuard);

router.post("/analyze-enquiry", asyncHandler(aiController.analyzeEnquiry));
router.post("/generate-email", asyncHandler(aiController.generateEmailDraft));
router.post("/summarize", asyncHandler(aiController.summarizeCommunications));
router.post("/deal-health", asyncHandler(aiController.evaluateDealHealth));
router.post("/copilot", asyncHandler(aiController.copilot));
router.get("/automation-runs", asyncHandler(automationRunController.list));

export default router;
