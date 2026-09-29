import { invokeBedrockAmazon } from "../bedrock.client";

export interface CopilotResult {
  answer: string;
  actionTaken?: string;
}

export const copilotService = {
  /**
   * Module 5: Natural Language CRM Co-Pilot Command Assistant
   */
  async runCopilotCommand(userPrompt: string, tenantId: string): Promise<CopilotResult> {
    const systemPrompt = `You are Clearview CRM's intelligent AI Co-Pilot assistant. Analyze the user's natural language request and provide a helpful, professional answer or action recommendation for the CRM user.

Return STRICT JSON:
{
  "answer": "Here is the summary of your pipeline...",
  "actionTaken": "Queried high-value open deals"
}`;

    const prompt = `User Command: "${userPrompt}"\nTenant ID: ${tenantId}`;

    const response = await invokeBedrockAmazon(prompt, systemPrompt);

    if (response.json) {
      return {
        answer: response.json.answer || response.text,
        actionTaken: response.json.actionTaken,
      };
    }

    return {
      answer: response.text || "I have processed your request.",
    };
  },
};
