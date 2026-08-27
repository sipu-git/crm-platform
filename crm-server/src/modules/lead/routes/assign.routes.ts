import { Router } from "express";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.middleware";
import { assigneeController } from "../controllers/assign.controller";

const router = Router();

router.post("/create-assign", asyncHandler(assigneeController.create));
router.get("/", asyncHandler(assigneeController.list));
router.get("/:id", asyncHandler(assigneeController.getById));

export default router;