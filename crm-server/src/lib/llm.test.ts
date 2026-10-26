import assert from 'node:assert/strict';
import test from 'node:test';
import { withLlmRetries } from './llm';

test('retries a 429 response and returns the next successful result', async () => {
  let calls = 0;
  const delays: number[] = [];

  const result = await withLlmRetries(async () => {
    calls += 1;
    if (calls === 1) throw { status: 429 };
    return 'ok';
  }, { maxRetries: 2, sleep: async (milliseconds) => { delays.push(milliseconds); } });

  assert.equal(result, 'ok');
  assert.equal(calls, 2);
  assert.equal(delays.length, 1);
  assert.ok(delays[0] >= 300 && delays[0] < 500);
});

test('retries server errors and stops at the configured limit', async () => {
  let calls = 0;

  await assert.rejects(withLlmRetries(async () => {
    calls += 1;
    throw { status: 503 };
  }, { maxRetries: 2, sleep: async () => {} }));

  assert.equal(calls, 3);
});

test('does not retry non-transient errors', async () => {
  let calls = 0;

  await assert.rejects(withLlmRetries(async () => {
    calls += 1;
    throw { status: 401 };
  }, { maxRetries: 3, sleep: async () => {} }));

  assert.equal(calls, 1);
});
