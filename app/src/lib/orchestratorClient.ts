import type { AvalokaV2Result } from "../types";

export interface AvalokaV2Request {
  userText: string;
  localText: string;
  localCrisis?: boolean;
  dukkhaTypes?: string[];
  dukkhaPatterns?: string[];
  responseMoves?: string[];
}

export async function requestAvalokaV2(payload: AvalokaV2Request): Promise<AvalokaV2Result> {
  const startedAt = Date.now();
  const response = await fetch("/api/avaloka-v2", {
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
      error: result?.error || `Avaloka V2 request failed with ${response.status}`,
    };
  }

  return {
    status: "ready",
    latencyMs: result.latencyMs ?? Date.now() - startedAt,
    candidateText: result.candidateText,
    responseSource: result.responseSource,
    model: result.model,
    crisis: result.crisis,
    baifa: result.baifa,
    compassionPlan: result.compassionPlan,
    guardian: result.guardian,
    repairAttempted: Boolean(result.repairAttempted),
  };
}
