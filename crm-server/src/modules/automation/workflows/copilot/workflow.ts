import { createAgent } from "langchain";
import { getLlmModel, withLlmRetries } from "../../../../lib/llm.js";
import { env } from "../../../../shared/configs/env.js";
import type { AccessTokenPayload } from "../../../../shared/utils/jwt.js";
import { createCopilotTools } from "./tools/index.js";
import { COPILOT_SYSTEM_PROMPT } from "./prompts.js";
import { copilotAnswerSchema } from "./schemas.js";

function readMessageText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return typeof part.text === "string" ? part.text : "";
      return "";
    })
    .filter(Boolean)
    .join("\n")
    .trim();
}

export async function runCopilotWorkflow(prompt: string, actor: AccessTokenPayload) {
  const agent = createAgent({
    model: getLlmModel(),
    tools: createCopilotTools(actor),
    systemPrompt: COPILOT_SYSTEM_PROMPT,
  });
  const result = await withLlmRetries(
    () => agent.invoke(
      { messages: [{ role: "user", content: prompt }] },
      { signal: AbortSignal.timeout(env.llm.timeoutMs) },
    ),
    { maxRetries: env.llm.maxRetries },
  );

  const messages = result.messages;
  const draftAnswer = readMessageText(messages[messages.length - 1]?.content);
  if (!draftAnswer) throw new Error("The CRM assistant returned an empty response.");
  const usedCrmTools = messages.some((message) => message.getType() === "tool");
  const toolEvidence = messages
    .filter((message) => message.getType() === "tool")
    .map((message) => readMessageText(message.content));

  const reviewer = getLlmModel().withStructuredOutput(copilotAnswerSchema);
  const reviewed = await withLlmRetries(
    () => reviewer.invoke([
      {
        role: "system",
        content: "You are the CRM response reviewer. Check the draft against the user's question and supplied read-only CRM tool evidence. For CRM facts, use only the tool evidence; remove unsupported claims and state when evidence is insufficient. When no CRM evidence is provided, answer only general CRM questions without inventing workspace facts. Never claim that records were changed or that an email was sent.",
      },
      { role: "user", content: JSON.stringify({ question: prompt, draftAnswer, toolEvidence }) },
    ], { signal: AbortSignal.timeout(env.llm.timeoutMs) }),
    { maxRetries: env.llm.maxRetries },
  );

  return {
    answer: copilotAnswerSchema.parse(reviewed).answer,
    ...(usedCrmTools ? { actionTaken: "Reviewed CRM data. No records were changed." } : {}),
  };
}
