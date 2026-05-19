import type { ChatMessage, LlmShadowResult, ResponseSource } from "../types";
import { buildGuardedResponse } from "./guardedResponse";

export interface PrimaryDevResponseInput {
  localText: string;
  openaiCandidateText?: string;
  openaiModel?: string;
  openaiLatencyMs?: number;
}

export interface PrimaryDevResponseResult {
  text: string;
  responseSource: ResponseSource;
  localBaselineText: string;
  openaiPrimary?: LlmShadowResult;
  guardianFallback: boolean;
  preceptsSeverity?: ChatMessage["preceptsSeverity"];
  preceptsViolations?: string[];
}

export function buildPrimaryDevResponse(input: PrimaryDevResponseInput): PrimaryDevResponseResult {
  const candidateText = input.openaiCandidateText?.trim();
  if (!candidateText) {
    return {
      text: input.localText,
      responseSource: "local_guardian_fallback",
      localBaselineText: input.localText,
      guardianFallback: false,
    };
  }

  const guarded = buildGuardedResponse([candidateText]);
  const openaiPrimary: LlmShadowResult = {
    status: "ready",
    candidateText,
    model: input.openaiModel,
    latencyMs: input.openaiLatencyMs,
    guardianFallback: guarded.guardianFallback,
    preceptsSeverity: guarded.precepts?.severity,
    preceptsViolations: guarded.precepts?.violations.map((violation) => violation.precept) || [],
  };

  if (guarded.guardianFallback) {
    return {
      text: input.localText,
      responseSource: "local_guardian_fallback",
      localBaselineText: input.localText,
      openaiPrimary,
      guardianFallback: false,
      preceptsSeverity: "pass",
      preceptsViolations: [],
    };
  }

  return {
    text: guarded.text,
    responseSource: "openai_primary_dev",
    localBaselineText: input.localText,
    openaiPrimary,
    guardianFallback: false,
    preceptsSeverity: guarded.precepts?.severity,
    preceptsViolations: guarded.precepts?.violations.map((violation) => violation.precept) || [],
  };
}
