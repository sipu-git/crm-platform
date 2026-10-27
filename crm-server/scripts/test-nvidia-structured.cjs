/**
 * Test script for NVIDIA Nemotron 3.5 Bolt E4B via @langchain/openai
 * Run: node scripts/test-nvidia-structured.cjs
 */
const { ChatOpenAI } = require('@langchain/openai');
const { z } = require('zod');

async function run() {
  const apiKey = process.env.NVIDIA_API_KEY || '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';

  const model = new ChatOpenAI({
    apiKey: apiKey,
    model: 'nvidia/nemotron-3.5-bolt-e4b',
    configuration: {
      baseURL: 'https://integrate.api.nvidia.com/v1',
    },
    temperature: 0.2,
    maxTokens: 4096,
    maxRetries: 0,
  });

  // Test 1: Simple chat
  console.log('--- Test 1: Simple chat ---');
  const t0 = Date.now();
  try {
    const simple = await model.invoke([
      { role: 'user', content: 'Say hello in exactly 5 words.' },
    ]);
    console.log('SUCCESS in', Date.now() - t0, 'ms');
    console.log('Response:', simple.content);
  } catch (err) {
    console.error('FAILED in', Date.now() - t0, 'ms');
    console.error(err.message);
  }

  // Test 2: Structured output with Zod schema
  console.log('\n--- Test 2: Structured output ---');
  const schema = z.object({
    ai_score: z.number().int().min(0).max(100),
    ai_intent: z.enum(['HIGH_INTENT', 'MEDIUM_INTENT', 'LOW_INTENT', 'SPAM']),
    ai_summary: z.string(),
    ai_suggested_action: z.string(),
  });

  const t1 = Date.now();
  try {
    const structured = model.withStructuredOutput(schema);
    const result = await structured.invoke([
      {
        role: 'system',
        content: 'You are the lead qualification agent. Assess commercial intent. Return a calibrated score, intent, concise summary, and useful next step.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          company_name: 'Acme Corp',
          project_name: 'CRM Platform',
          project_type: 'Web Application',
          budget: '$15,000',
          timeline: '2 months',
          description: 'We need a full-featured CRM web app with lead management, deal tracking, and email integration.',
        }),
      },
    ]);
    console.log('SUCCESS in', Date.now() - t1, 'ms');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('FAILED in', Date.now() - t1, 'ms');
    console.error(err.message);
  }
}

run().catch(console.error);
