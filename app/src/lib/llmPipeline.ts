import type { AvalokaV2Result, ChatMessage } from "../types";

export const DEFAULT_AUTO_LLM_ENDPOINTS = ["/api/avaloka-v2"] as const;

export function createInitialLlmDebugState(
  crisis: boolean,
): Pick<ChatMessage, "orchestratorV2" | "baifa"> {
  if (crisis) {
    return {
      orchestratorV2: { status: "loading" },
      baifa: { status: "skipped", error: "Crisis messages do not run Baifa mapper." },
    };
  }

  return {
    orchestratorV2: { status: "loading" },
    baifa: { status: "loading" },
  };
}

export function applyAvalokaV2Result(message: ChatMessage, orchestratorV2: AvalokaV2Result): ChatMessage {
  if (orchestratorV2.status !== "ready" || !orchestratorV2.candidateText) {
    return { ...message, orchestratorV2 };
  }

  return {
    ...message,
    text: orchestratorV2.candidateText,
    responseSource: "llm_orchestrator_v2",
    orchestratorV2,
    baifa:
      orchestratorV2.baifa && orchestratorV2.model
        ? {
            status: "ready",
            baifa: orchestratorV2.baifa,
            model: orchestratorV2.model,
            latencyMs: orchestratorV2.latencyMs,
          }
        : message.baifa,
  };
}
