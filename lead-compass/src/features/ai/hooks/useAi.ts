import { useMutation, useQuery } from "@tanstack/react-query";
import { aiApi } from "../apis/ai.api";

/**
 * Hook for AI Lead Enquiry Analysis
 */
export function useAnalyzeEnquiryMutation() {
  return useMutation({
    mutationFn: aiApi.analyzeEnquiry,
  });
}

/**
 * Hook for AI Email Draft Generation
 */
export function useGenerateEmailDraftMutation() {
  return useMutation({
    mutationFn: aiApi.generateEmailDraft,
  });
}

/**
 * Hook for Communication Thread Summarizer
 */
export function useSummarizeCommunicationsMutation() {
  return useMutation({
    mutationFn: aiApi.summarizeCommunications,
  });
}

/**
 * Hook for Predictive Deal Health Analysis
 */
export function useEvaluateDealHealthMutation() {
  return useMutation({
    mutationFn: aiApi.evaluateDealHealth,
  });
}

/**
 * Hook for AI Co-Pilot Command Assistant
 */
export function useCopilotMutation() {
  return useMutation({
    mutationFn: aiApi.copilot,
  });
}

/**
 * Hook for AI Automation Runs History
 */
export function useAutomationRunsQuery(limit = 50) {
  return useQuery({
    queryKey: ["ai", "automation-runs", limit],
    queryFn: () => aiApi.getAutomationRuns(limit),
    refetchInterval: 15000,
  });
}
