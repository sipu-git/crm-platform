import { Request, Response } from 'express';
import { createOAuthClient } from '../../../shared/integrations/google/google.config.js';
import { googleScopes } from '../../../shared/integrations/google/google.scopes.js';
import { googleAccountService } from '../../../shared/integrations/google/google.account.service.js';
import { calendarService } from './calendar.service.js';
import { createEventSchema, listEventsQuerySchema, updateEventSchema } from './calendar.schema.js';
import { successResponse } from '../../../shared/utils/ApiResponse.js';
import { ApiError } from '../../../shared/utils/ApiError.js';

export const calendarController = {
  
  async connect(req: Request, res: Response) {
    const oauth2Client = createOAuthClient();

    const statePayload = JSON.stringify({
      userId: req.auth!.userId,
      tenantId: req.auth!.tenantId,
      returnTo: typeof req.query.returnTo === 'string' ? req.query.returnTo : '/calendar',
    });

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: googleScopes.combined,
      state: statePayload,
    });

    return res.status(200).json(successResponse('Google Calendar auth URL generated', { url }));
  },

  async getStatus(req: Request, res: Response) {
    const status = await googleAccountService.getStatus(req.auth!.userId);
    return res.status(200).json(successResponse('Google account status', status));
  },

  async listEvents(req: Request, res: Response) {
    const query = listEventsQuerySchema.parse(req.query);
    const events = await calendarService.listEvents(req.auth!.userId, query);
    return res.status(200).json(successResponse('Calendar events fetched successfully', events));
  },

  async getEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (!eventId) throw ApiError.badRequest('eventId is required');

    const calendarId = typeof req.query.calendarId === 'string' ? req.query.calendarId : 'primary';
    const event = await calendarService.getEvent(req.auth!.userId, eventId as string, calendarId);
    return res.status(200).json(successResponse('Calendar event details fetched', event));
  },

  async createEvent(req: Request, res: Response) {
    const input = createEventSchema.parse(req.body);
    const event = await calendarService.createEvent(req.auth!.userId, input);
    return res.status(201).json(successResponse('Calendar event created successfully', event));
  },

  async updateEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (!eventId) throw ApiError.badRequest('eventId is required');

    const input = updateEventSchema.parse(req.body);
    const event = await calendarService.updateEvent(req.auth!.userId, eventId as string, input);
    return res.status(200).json(successResponse('Calendar event updated successfully', event));
  },

  async deleteEvent(req: Request, res: Response) {
    const { eventId } = req.params;
    if (!eventId) throw ApiError.badRequest('eventId is required');

    const calendarId = typeof req.query.calendarId === 'string' ? req.query.calendarId : 'primary';
    const result = await calendarService.deleteEvent(req.auth!.userId, eventId as string, calendarId);
    return res.status(200).json(successResponse('Calendar event deleted successfully', result));
  },

  async listCalendars(req: Request, res: Response) {
    const calendars = await calendarService.listCalendars(req.auth!.userId);
    return res.status(200).json(successResponse('Calendars listed successfully', calendars));
  },

  async listHolidays(req: Request, res: Response) {
    const query = listEventsQuerySchema.parse(req.query);
    const holidays = await calendarService.listHolidays(req.auth!.userId, query);
    return res.status(200).json(successResponse('Holiday events fetched successfully', holidays));
  },
};


