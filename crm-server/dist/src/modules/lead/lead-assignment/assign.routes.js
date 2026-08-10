import { Router } from "express";
import { assigneeController } from "./assign.controller.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.middleware.js";
const router = Router();
router.post("/create-assign", asyncHandler(assigneeController.create));
router.get("/", asyncHandler(assigneeController.list));
router.get("/:id", asyncHandler(assigneeController.getById));
export default router;
