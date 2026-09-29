import { enquiryAnalysisService } from "./services/enquiry-analysis.service";
import { emailDraftService } from "./services/email-draft.service";
import { communicationSummaryService } from "./services/communication-summary.service";
import { dealHealthService } from "./services/deal-health.service";
import { copilotService } from "./services/copilot.service";

export * from "./services";

export const aiService = {
  analyzeEnquiry: enquiryAnalysisService.analyzeEnquiry.bind(enquiryAnalysisService),
  generateEmailDraft: emailDraftService.generateEmailDraft.bind(emailDraftService),
  summarizeCommunications: communicationSummaryService.summarizeCommunications.bind(communicationSummaryService),
  evaluateDealHealth: dealHealthService.evaluateDealHealth.bind(dealHealthService),
  runCopilotCommand: copilotService.runCopilotCommand.bind(copilotService),
};
