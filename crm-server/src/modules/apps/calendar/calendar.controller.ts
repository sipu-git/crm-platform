import { Request, Response } from "express";
import { calendarService } from "./calendar.service.js";
import {
  createEventSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from "./calendar.schema.js";
import { successResponse } from "../../../shared/utils/ApiResponse.js";
import { ApiError } from "../../../shared/utils/ApiError.js";

export const calendarController = {
  async listEvents(req: Request, res: Response) {
    const query = listEventsQuerySchema.parse(req.query);
    const events = await calendarService.listEvents(req.tenantId!, query);
    return res
      .status(200)
      .json(successResponse("Calendar events fetched successfully", events));
  },

  async getEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (typeof eventId !== "string" || !eventId) {
      throw ApiError.badRequest("eventId is required");
    }
    const event = await calendarService.getEvent(req.tenantId!, eventId);
    return res
      .status(200)
      .json(successResponse("Calendar event details fetched", event));
  },

  async createEvent(req: Request, res: Response) {
    const input = createEventSchema.parse(req.body);
    const event = await calendarService.createEvent(
      req.tenantId!,
      req.auth!.userId,
      input,
    );
    return res
      .status(201)
      .json(successResponse("Calendar event created successfully", event));
  },

  async updateEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (typeof eventId !== "string" || !eventId) {
      throw ApiError.badRequest("eventId is required");
    }
    const input = updateEventSchema.parse(req.body);
    const event = await calendarService.updateEvent(
      req.tenantId!,
      eventId,
      input,
    );
    return res
      .status(200)
      .json(successResponse("Calendar event updated successfully", event));
  },

  async deleteEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (typeof eventId !== "string" || !eventId) {
      throw ApiError.badRequest("eventId is required");
    }
    const result = await calendarService.deleteEvent(req.tenantId!, eventId);
    return res
      .status(200)
      .json(successResponse("Calendar event deleted successfully", result));
  },
};
