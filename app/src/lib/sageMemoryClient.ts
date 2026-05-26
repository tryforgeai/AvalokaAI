import type { SageMemoryWriterRequest, SageMemoryWriterResult } from "../types";

export async function requestSageMemoryWriter(payload: SageMemoryWriterRequest): Promise<SageMemoryWriterResult> {
  const startedAt = Date.now();
  let response: Response;

  try {
    response = await fetch("/api/sage-memory-writer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    return {
      status: "error",
      latencyMs: Date.now() - startedAt,
      candidates: [],
      guardian: [],
      error: error instanceof Error ? error.message : "SAGE memory writer request failed.",
    };
  }

  const result = await response.json().catch(() => undefined);
  if (!response.ok) {
    return {
      status: "error",
      latencyMs: Date.now() - startedAt,
      candidates: [],
      guardian: [],
      error: result?.error || `SAGE memory writer request failed with ${response.status}`,
    };
  }

  return {
    status: result?.status === "error" ? "error" : "ready",
    model: result?.model,
    latencyMs: result?.latencyMs ?? Date.now() - startedAt,
    candidates: Array.isArray(result?.candidates) ? result.candidates : [],
    guardian: Array.isArray(result?.guardian) ? result.guardian : [],
    error: result?.error,
  };
}
