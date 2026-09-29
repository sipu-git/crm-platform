import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { env } from "../../shared/configs/env";

export const bedrockClient = new BedrockRuntimeClient({
  region: env.aws.region,
  ...(env.aws.accessKeyId && env.aws.secretAccessKey ? {
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    }
  } : {}),
});
