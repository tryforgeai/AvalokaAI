import type { CareCard, CareMemory, ChatMessage, SageMemoryWriterResult } from "../types";

export interface MemoryInspectorReport {
  summary: {
    careMemoryCount: number;
    writerReadyCount: number;
    writerErrorCount: number;
    writerCandidateCount: number;
    latestRetrievedCareFactCount: number;
  };
  kindCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  memories: Array<{
    id: string;
    source: "care_card";
    kind: string;
    text: string;
    confidence: number;
    tags: string[];
    occurrences: number;
    evidenceCount: number;
    updatedAt: string;
    lastSeenAt: string;
  }>;
  latestWriter: {
    status: SageMemoryWriterResult["status"] | "none";
    model?: string;
    latencyMs?: number;
    candidateIds: string[];
    guardianStatusCounts: Record<string, number>;
  };
  latestRetrievedCareFacts: string[];
  evalCommands: string[];
}

export function buildMemoryInspectorReport({
  careCard,
  messages,
}: {
  careCard: CareCard;
  messages: ChatMessage[];
}): MemoryInspectorReport {
  const writerResults = messages.map((message) => message.sageMemory).filter(Boolean) as SageMemoryWriterResult[];
  const latestWriter = [...writerResults].reverse()[0];
  const latestV2WithRetrieval = [...messages].reverse().find((message) => message.orchestratorV2?.retrievedCareFacts);
  const latestRetrievedCareFacts = latestV2WithRetrieval?.orchestratorV2?.retrievedCareFacts || [];

  return {
    summary: {
      careMemoryCount: careCard.memories.length,
      writerReadyCount: writerResults.filter((result) => result.status === "ready").length,
      writerErrorCount: writerResults.filter((result) => result.status === "error").length,
      writerCandidateCount: writerResults.reduce((total, result) => total + result.candidates.length, 0),
      latestRetrievedCareFactCount: latestRetrievedCareFacts.length,
    },
    kindCounts: countBy(careCard.memories.map((memory) => memory.kind)),
    tagCounts: countBy(careCard.memories.flatMap((memory) => memory.tags)),
    memories: careCard.memories.map(formatMemoryForInspector),
    latestWriter: latestWriter
      ? {
          status: latestWriter.status,
          model: latestWriter.model,
          latencyMs: latestWriter.latencyMs,
          candidateIds: latestWriter.candidates.map((candidate) => candidate.id),
          guardianStatusCounts: countBy(latestWriter.guardian.map((result) => result.status)),
        }
      : {
          status: "none",
          candidateIds: [],
          guardianStatusCounts: {},
        },
    latestRetrievedCareFacts: latestRetrievedCareFacts.map((fact) => fact.memoryId),
    evalCommands: ["npm run eval:sage", "npm run eval:sage:writer", "npm run eval:memory"],
  };
}

function formatMemoryForInspector(memory: CareMemory): MemoryInspectorReport["memories"][number] {
  return {
    id: memory.id,
    source: "care_card",
    kind: memory.kind,
    text: memory.text,
    confidence: memory.confidence,
    tags: memory.tags,
    occurrences: memory.occurrences,
    evidenceCount: memory.evidenceIds.length,
    updatedAt: memory.updatedAt,
    lastSeenAt: memory.lastSeenAt,
  };
}

function countBy(items: string[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}
