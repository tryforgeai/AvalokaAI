import type { CareCard, CareMemory, CareMemoryLifecycleEvent, ChatMessage, SageMemoryWriterResult } from "../types";

export interface MemoryInspectorReport {
  summary: {
    careMemoryCount: number;
    activeMemoryCount: number;
    supersededMemoryCount: number;
    deletedMemoryCount: number;
    staleMemoryCount: number;
    writerReadyCount: number;
    writerErrorCount: number;
    writerCandidateCount: number;
    latestRetrievedCareFactCount: number;
    latestMemoryClaimCount: number;
    latestUnsupportedMemoryClaimCount: number;
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
    status: "active" | "superseded";
    supersededBy?: string;
    supersededAt?: string;
    stale: boolean;
  }>;
  lifecycleEvents: Array<{
    type: CareMemoryLifecycleEvent["type"];
    memoryId: string;
    replacementMemoryId?: string;
    createdAt: string;
    memoryKind: string;
  }>;
  latestWriter: {
    status: SageMemoryWriterResult["status"] | "none";
    model?: string;
    latencyMs?: number;
    candidateIds: string[];
    guardianStatusCounts: Record<string, number>;
  };
  latestRetrievedCareFacts: string[];
  latestMemoryClaimGrounding: {
    verdict: "pass" | "warn" | "fail" | "error" | "skipped" | "none";
    claimStatuses: string[];
    supportingMemoryIds: string[];
  };
  evalCommands: string[];
}

export function buildMemoryInspectorReport({
  careCard,
  messages,
  now,
}: {
  careCard: CareCard;
  messages: ChatMessage[];
  now?: string;
}): MemoryInspectorReport {
  const reportNow = now || new Date().toISOString();
  const writerResults = messages.map((message) => message.sageMemory).filter(Boolean) as SageMemoryWriterResult[];
  const latestWriter = [...writerResults].reverse()[0];
  const latestV2WithRetrieval = [...messages].reverse().find((message) => message.orchestratorV2?.retrievedCareFacts);
  const latestRetrievedCareFacts = latestV2WithRetrieval?.orchestratorV2?.retrievedCareFacts || [];
  const latestV2WithClaimGrounding = [...messages]
    .reverse()
    .find((message) => message.orchestratorV2?.memoryClaimGrounding);
  const latestClaimGrounding = latestV2WithClaimGrounding?.orchestratorV2?.memoryClaimGrounding;

  return {
    summary: {
      careMemoryCount: careCard.memories.length,
      activeMemoryCount: careCard.memories.filter((memory) => memoryStatus(memory) === "active").length,
      supersededMemoryCount: careCard.memories.filter((memory) => memoryStatus(memory) === "superseded").length,
      deletedMemoryCount: (careCard.lifecycleEvents || []).filter((event) => event.type === "delete").length,
      staleMemoryCount: careCard.memories.filter((memory) => isStaleMemory(memory, reportNow)).length,
      writerReadyCount: writerResults.filter((result) => result.status === "ready").length,
      writerErrorCount: writerResults.filter((result) => result.status === "error").length,
      writerCandidateCount: writerResults.reduce((total, result) => total + result.candidates.length, 0),
      latestRetrievedCareFactCount: latestRetrievedCareFacts.length,
      latestMemoryClaimCount: latestClaimGrounding?.claims.length || 0,
      latestUnsupportedMemoryClaimCount:
        latestClaimGrounding?.claims.filter((claim) => claim.status === "unsupported").length || 0,
    },
    kindCounts: countBy(careCard.memories.map((memory) => memory.kind)),
    tagCounts: countBy(careCard.memories.flatMap((memory) => memory.tags)),
    memories: careCard.memories.map((memory) => formatMemoryForInspector(memory, reportNow)),
    lifecycleEvents: (careCard.lifecycleEvents || []).map((event) => ({
      type: event.type,
      memoryId: event.memoryId,
      replacementMemoryId: event.replacementMemoryId,
      createdAt: event.createdAt,
      memoryKind: event.memoryKind,
    })),
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
    latestMemoryClaimGrounding: latestClaimGrounding
      ? {
          verdict: latestClaimGrounding.verdict,
          claimStatuses: latestClaimGrounding.claims.map((claim) => claim.status),
          supportingMemoryIds: unique(latestClaimGrounding.claims.flatMap((claim) => claim.supportingMemoryIds)),
        }
      : {
          verdict: "none",
          claimStatuses: [],
          supportingMemoryIds: [],
        },
    evalCommands: [
      "npm run eval:sage",
      "npm run eval:sage:writer",
      "npm run eval:memory",
      "npm run eval:memory:reader",
      "npm run eval:memory:claim-grounding",
    ],
  };
}

function formatMemoryForInspector(memory: CareMemory, now: string): MemoryInspectorReport["memories"][number] {
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
    status: memoryStatus(memory),
    supersededBy: memory.supersededBy,
    supersededAt: memory.supersededAt,
    stale: isStaleMemory(memory, now),
  };
}

function memoryStatus(memory: CareMemory): "active" | "superseded" {
  return memory.status || "active";
}

function isStaleMemory(memory: CareMemory, now: string, staleAfterDays = 180): boolean {
  const nowMs = Date.parse(now);
  const lastSeenMs = Date.parse(memory.lastSeenAt || memory.updatedAt || memory.createdAt);
  if (!Number.isFinite(nowMs) || !Number.isFinite(lastSeenMs)) return false;

  return nowMs - lastSeenMs > staleAfterDays * 24 * 60 * 60 * 1000;
}

function countBy(items: string[]): Record<string, number> {
  return items.reduce<Record<string, number>>((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}
