import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { ChatGeneration, ChatResult } from '@langchain/core/outputs';
import { z } from 'zod';

class ChatNvidia extends BaseChatModel {
  apiKey: string;
  modelName: string;
  temperature: number;

  constructor(fields: { apiKey: string; model?: string; temperature?: number }) {
    super({});
    this.apiKey = fields.apiKey;
    this.modelName = fields.model || 'meta/llama-3.2-11b-vision-instruct';
    this.temperature = fields.temperature ?? 0.2;
  }

  _llmType(): string {
    return 'nvidia';
  }

  async _generate(messages: BaseMessage[],options: this['ParsedCallOptions']): Promise<ChatResult> {
    const formattedMessages = messages.map((m) => {
      let role = 'user';
      if (m._getType() === 'system') role = 'system';
      else if (m._getType() === 'ai') role = 'assistant';
      return { role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) };
    });

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: formattedMessages,
        temperature: this.temperature,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content ?? '';
    const generation: ChatGeneration = {
      text: content,
      message: new AIMessage({ content }),
    };

    return { generations: [generation] };
  }
}

async function test() {
  const model = new ChatNvidia({ apiKey: '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' });
  console.log('Testing ChatNvidia invoke...');
  const res = await model.invoke('Say hello in 3 words');
  console.log('Result:', res.content);
}

test().catch(console.error);

