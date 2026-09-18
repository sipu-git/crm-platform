import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.middleware";
import { assigneeController } from "../controllers/assign.controller";
import { requirePermission } from "../../../shared/middleware/requireRole.middleware";

const router = Router();

// router.post("/create-assign", asyncHandler(assigneeController.create));
router.get("/", asyncHandler(assigneeController.list));
router.get("/assignee", requirePermission("leads:assign:own"), asyncHandler(assigneeController.getOwnAssignee));
router.get("/:id", asyncHandler(assigneeController.getById));
router.patch('/:leadId/assign', requirePermission("leads:assign"), asyncHandler(assigneeController.create));

export default router;