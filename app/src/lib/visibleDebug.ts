import type { BaifaMapResult, ChatMessage } from "../types";

export function getVisibleBaifaResult(message?: ChatMessage): BaifaMapResult | undefined {
  if (!message) return undefined;
  if (message.crisis) {
    return {
      status: "skipped",
      error: "Crisis messages do not run Baifa mapper.",
    };
  }

  return message.baifa;
}
