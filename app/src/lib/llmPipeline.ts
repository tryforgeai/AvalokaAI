import type { AvalokaV2Result, ChatMessage } from "../types";
import { evaluateMemoryClaimGrounding } from "./memoryClaimGrounding";

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
  const candidateText = orchestratorV2.candidateText;

  const memoryClaimGrounding =
    orchestratorV2.memoryClaimGrounding ||
    evaluateMemoryClaimGrounding({
      answerText: candidateText,
      retrievedCareFacts: orchestratorV2.retrievedCareFacts || [],
    });
  const orchestratorWithDiagnostics: AvalokaV2Result = {
    ...orchestratorV2,
    memoryClaimGrounding,
  };
  const hasUnsupportedMemoryClaim = memoryClaimGrounding.claims.some((claim) => claim.status === "unsupported");
  const visibleText = hasUnsupportedMemoryClaim ? message.localBaselineText || message.text : candidateText;

  return {
    ...message,
    text: visibleText,
    responseSource: hasUnsupportedMemoryClaim ? "local_claim_grounding_fallback" : "llm_orchestrator_v2",
    orchestratorV2: orchestratorWithDiagnostics,
    baifa:
      orchestratorWithDiagnostics.baifa && orchestratorWithDiagnostics.model
        ? {
            status: "ready",
            baifa: orchestratorWithDiagnostics.baifa,
            model: orchestratorWithDiagnostics.model,
            latencyMs: orchestratorWithDiagnostics.latencyMs,
          }
        : message.baifa,
  };
}
