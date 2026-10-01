import type { Request, Response } from "express";
import { aiService } from "./ai.service";
import { successResponse } from "../../shared/utils/ApiResponse";
import { ApiError } from "../../shared/utils/ApiError";

export const aiController = {
  /**
   * Analyze lead enquiry
   */
  async analyzeEnquiry(req: Request, res: Response) {
    const analysis = await aiService.analyzeEnquiry(req.body);
    return res.status(200).json(successResponse("AI Lead Analysis completed successfully!", analysis));
  },

  /**
   * Generate AI Email Draft
   */
  async generateEmailDraft(req: Request, res: Response) {
    const { clientName, companyName, lastInteraction, purpose, tone } = req.body;
    if (!clientName || !companyName) {
      throw ApiError.badRequest("clientName and companyName are required");
    }
    const draft = await aiService.generateEmailDraft({
      clientName,
      companyName,
      lastInteraction,
      purpose,
      tone,
    });
    return res.status(200).json(successResponse("AI Email draft generated successfully!", draft));
  },

  /**
   * Summarize Communications
   */
  async summarizeCommunications(req: Request, res: Response) {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw ApiError.badRequest("messages array is required");
    }
    const summary = await aiService.summarizeCommunications(messages);
    return res.status(200).json(successResponse("Communication summary generated successfully!", summary));
  },

  /**
   * Evaluate Deal Health
   */
  async evaluateDealHealth(req: Request, res: Response) {
    const { dealName, stage, amount, daysInStage, hasOverdueInvoice, lastActivityDaysAgo } = req.body;
    const health = await aiService.evaluateDealHealth({
      dealName: dealName || "Deal",
      stage: stage || "QUALIFICATION",
      amount: Number(amount || 0),
      daysInStage: Number(daysInStage || 0),
      hasOverdueInvoice: Boolean(hasOverdueInvoice),
      lastActivityDaysAgo: Number(lastActivityDaysAgo || 0),
    });
    return res.status(200).json(successResponse("Deal Health evaluated successfully!", health));
  },

  /**
   * AI Co-Pilot command
   */
  async copilot(req: Request, res: Response) {
    const { prompt } = req.body;
    if (!prompt) throw ApiError.badRequest("prompt is required");
    if (!req.auth) throw ApiError.unauthorized("Not authenticated");

    const result = await aiService.runCopilotCommand(prompt, req.auth.tenantId)
    return res.status(200).json(successResponse("AI Co-Pilot response generated!", result));
  },
};
