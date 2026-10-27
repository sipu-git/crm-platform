const https = require('https');

const key = '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';
const body = JSON.stringify({
  model: 'meta/llama-3.2-11b-vision-instruct',
  messages: [
    { role: 'system', content: 'You are an AI assistant. Return JSON object with ai_score (number 0-100), ai_intent (HIGH_INTENT, MEDIUM_INTENT, LOW_INTENT, SPAM), ai_summary (string), ai_suggested_action (string).' },
    { role: 'user', content: 'Acme Corp: Need a CRM web app with $15,000 budget, 2 months timeline.' }
  ],
  temperature: 0.2,
  response_format: { type: 'json_object' }
});

const t0 = Date.now();
const req = https.request('https://integrate.api.nvidia.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('HTTP', res.statusCode, 'Time:', Date.now() - t0, 'ms');
    try {
      const json = JSON.parse(data);
      console.log('Choices:', json.choices[0].message.content);
    } catch {
      console.log('Raw:', data);
    }
  });
});

req.on('error', console.error);
req.write(body);
req.end();

