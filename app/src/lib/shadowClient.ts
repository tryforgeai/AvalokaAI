import type { LlmShadowResult } from "../types";

export interface LlmShadowRequest {
  userText: string;
  localText: string;
  dukkhaTypes?: string[];
  dukkhaPatterns?: string[];
  responseMoves?: string[];
}

export async function requestLlmShadow(payload: LlmShadowRequest): Promise<LlmShadowResult> {
  const startedAt = Date.now();
  const response = await fetch("/api/llm-shadow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => undefined);
  if (!response.ok) {
    return {
      status: "error",
      latencyMs: Date.now() - startedAt,
      error: result?.error || `Shadow request failed with ${response.status}`,
    };
  }

  return {
    status: "ready",
    latencyMs: Date.now() - startedAt,
    candidateText: result.candidateText,
    model: result.model,
    guardianFallback: Boolean(result.guardianFallback),
    preceptsSeverity: result.preceptsSeverity,
    preceptsViolations: result.preceptsViolations || [],
  };
}

