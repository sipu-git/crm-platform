import { invokeBedrockAmazon } from "../bedrock.client";

export interface AISummaryResult {
  summary: string;
  objections: string[];
  action_items: Array<{ title: string; priority: "HIGH" | "MEDIUM" | "LOW" }>;
}

export interface MessageInput {
  sender: string;
  text: string;
  date?: string;
}

export const communicationSummaryService = {
  /**
   * Module 3: Communication & Meeting Summarizer
   */
  async summarizeCommunications(messages: MessageInput[]): Promise<AISummaryResult> {
    const systemPrompt = `You are an AI Communications Executive. Summarize the provided interaction history.
Return STRICT JSON with:
1. "summary": short executive overview of conversation.
2. "objections": list of client concerns/hesitations.
3. "action_items": array of objects { "title": string, "priority": "HIGH"|"MEDIUM"|"LOW" }.

JSON format:
{
  "summary": "Client requested pricing breakdown and GST compliance.",
  "objections": ["Timeline is tight"],
  "action_items": [{ "title": "Send updated GST invoice", "priority": "HIGH" }]
}`;

    const prompt = `Conversation Transcript:\n` + messages.map((m) => `${m.sender}: ${m.text}`).join("\n");

    const response = await invokeBedrockAmazon(prompt, systemPrompt);

    if (response.json) {
      return {
        summary: response.json.summary || "Conversation reviewed.",
        objections: Array.isArray(response.json.objections) ? response.json.objections : [],
        action_items: Array.isArray(response.json.action_items) ? response.json.action_items : [],
      };
    }

    return {
      summary: "Communication thread logged.",
      objections: [],
      action_items: [],
    };
  },
};
