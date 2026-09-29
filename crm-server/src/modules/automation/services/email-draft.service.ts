import { invokeBedrockAmazon } from "../bedrock.client";

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
  /**
   * Module 2: AI Email & Nurturing Draft Generator
   */
  async generateEmailDraft(context: EmailDraftInput): Promise<AIEmailDraft> {
    const systemPrompt = `You are an elite B2B Sales Representative AI assistant. Write a personalized, highly effective follow-up email.
Return STRICT JSON with keys "subject" and "body". Do not include markdown code block backticks inside the string values.

JSON format:
{
  "subject": "Follow up regarding project proposal for Company",
  "body": "Hi Name,\\n\\nI hope you are having a great week..."
}`;

    const prompt = `Client Name: ${context.clientName}
Company: ${context.companyName}
Context / Last Interaction: ${context.lastInteraction || "Follow-up post quote"}
Purpose: ${context.purpose || "Check status and offer quick Q&A call"}
Tone: ${context.tone || "professional"}`;

    const response = await invokeBedrockAmazon(prompt, systemPrompt);

    if (response.json && response.json.subject && response.json.body) {
      return {
        subject: response.json.subject,
        body: response.json.body,
      };
    }

    return {
      subject: `Follow-up regarding ${context.companyName} project`,
      body: `Hi ${context.clientName},\n\nFollowing up to see if you had a chance to review our proposal. Let me know if you have any questions!\n\nBest regards,\nSales Team`,
    };
  },
};
