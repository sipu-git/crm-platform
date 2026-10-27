import { analyzeEnquiry } from '../src/modules/automation/services/enquiry-analysis.service.js';

async function test() {
  console.log('Testing Enquiry Analysis LangGraph workflow with NVIDIA Nemotron...');
  const t0 = Date.now();
  const result = await analyzeEnquiry({
    company_name: 'Tech Innovators Inc',
    project_name: 'Enterprise CRM Migration',
    project_type: 'Software Migration',
    budget: '$50,000',
    timeline: '3 months',
    description: 'We need to migrate our legacy database with 200,000 contacts to the new CRM and integrate Gmail and WhatsApp pipelines.',
  });
  console.log('SUCCESS in', Date.now() - t0, 'ms:');
  console.log(JSON.stringify(result, null, 2));
}

test().catch(console.error);

