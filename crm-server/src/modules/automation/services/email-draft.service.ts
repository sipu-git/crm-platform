import { runEmailDraftWorkflow } from "../workflows/email-draft/workflow.js";

export interface AIEmailDraft {
  subject: string;
  body: string;
}

export interface EmailDraftInput {
  clientName: string;
  companyName: string;
  lastInteraction?: string;
  purpose?: string;
  tone?: "professional" | "persuasive" | "friendly";
}

export const emailDraftService = {
  async generateEmailDraft(context: EmailDraftInput): Promise<AIEmailDraft> {
    return runEmailDraftWorkflow(context);
  },
};
