import type { BaifaMapResult } from "../types";

export interface BaifaMapRequest {
  userText: string;
  dukkhaTypes?: string[];
  dukkhaPatterns?: string[];
  responseMoves?: string[];
}

export async function requestBaifaMap(payload: BaifaMapRequest): Promise<BaifaMapResult> {
  const startedAt = Date.now();
  const response = await fetch("/api/baifa-map", {
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
      error: result?.error || `Baifa map request failed with ${response.status}`,
    };
  }

  return {
    status: "ready",
    latencyMs: Date.now() - startedAt,
    baifa: result.baifa,
    model: result.model,
  };
}
