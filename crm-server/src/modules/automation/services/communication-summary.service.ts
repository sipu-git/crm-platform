import { runCommunicationSummaryWorkflow } from "../workflows/communication-summary/workflow.js";

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
  async summarizeCommunications(messages: MessageInput[]): Promise<AISummaryResult> {
    return runCommunicationSummaryWorkflow(messages);
  },
};
