import { ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../shared/configs/env";
import { bedrockClient } from "./bedrock.configs";

export interface BedrockResponse {
  text: string;
  json?: any;
}

/**
 * Invokes Amazon Nova Lite (or any model specified by BEDROCK_MODEL_ID) via AWS Bedrock Converse API
 */
export async function invokeBedrockAmazon(prompt: string, systemPrompt?: string): Promise<BedrockResponse> {
  const modelId = env.aws.bedrockModelId || "global.amazon.nova-2-lite-v1:0";

  const command = new ConverseCommand({
    modelId,
    messages: [
      {
        role: "user",
        content: [{ text: prompt }],
      },
    ],
    ...(systemPrompt
      ? {
          system: [{ text: systemPrompt }],
        }
      : {}),
    inferenceConfig: {
      maxTokens: 2000,
      temperature: 0.2,
    },
  });

  try {
    const response = await bedrockClient.send(command);

    // Extract text response from ConverseCommand output
    const contentBlocks = response.output?.message?.content || [];
    const completionText = contentBlocks
      .map((block) => block.text || "")
      .join("")
      .trim();

    // Try extracting JSON if response contains structured data
    let jsonResult = null;
    try {
      const jsonMatch = completionText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonResult = JSON.parse(jsonMatch[0]);
      }
    } catch {
      jsonResult = null;
    }

    return {
      text: completionText,
      json: jsonResult,
    };
  } catch (error) {
    const awsError = error as {
      name?: string;
      message?: string;
      code?: string;
      Code?: string;
      $fault?: string;
      $metadata?: {
        httpStatusCode?: number;
        requestId?: string;
      };
    };

    console.error("[AWS Bedrock Error Details]", {
      name: awsError.name,
      code: awsError.code ?? awsError.Code,
      fault: awsError.$fault,
      httpStatusCode: awsError.$metadata?.httpStatusCode,
      requestId: awsError.$metadata?.requestId,
      region: env.aws.region,
      modelId,
      message: awsError.message ?? String(error),
    });

    throw new Error(`AWS Bedrock invocation failed: ${awsError.message ?? String(error)}`);
  }
}

// Alias for backwards compatibility
export const invokeBedrockClaude = invokeBedrockAmazon;
