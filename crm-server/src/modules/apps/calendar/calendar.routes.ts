import { Router } from "express";
import { authGuard } from "../../../shared/middleware/authGuard.middleware.js";
import { tenantContext } from "../../../shared/middleware/tenantContext.middleware.js";
import { asyncHandler } from "../../../shared/middleware/asyncHandler.middleware.js";
import { calendarController } from "./calendar.controller.js";

const router = Router();

router.use(authGuard, tenantContext);

router.get("/events", asyncHandler(calendarController.listEvents));
router.get("/events/:eventId", asyncHandler(calendarController.getEvent));
router.post("/events", asyncHandler(calendarController.createEvent));
router.patch("/events/:eventId", asyncHandler(calendarController.updateEvent));
router.delete("/events/:eventId", asyncHandler(calendarController.deleteEvent));

export default router;
