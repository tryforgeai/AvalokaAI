import type {
  CareCard,
  CareMemory,
  MemoryCandidate,
  RetrievalTraceCandidateV1,
  RetrievalTraceReason,
  RetrievalTraceV1,
  RetrievedCareFact,
  SageMemoryCandidateKind,
} from "../types";

export type MemoryCandidateKind = SageMemoryCandidateKind;
export type { MemoryCandidate };

export interface CareFact extends MemoryCandidate {
  tags: string[];
}

export type MemoryGuardianStatus = "allow" | "revise" | "reject";

export type MemoryGuardianReason =
  | "missing_evidence"
  | "empty_text"
  | "low_confidence"
  | "raw_or_private_detail"
  | "medical_or_spiritual_claim"
  | "harm_or_crisis_detail";

export interface MemoryGuardianResult {
  status: MemoryGuardianStatus;
  reasons: MemoryGuardianReason[];
  memory?: CareFact;
}

export interface MemoryReaderContext {
  userText?: string;
  scenarioId?: string;
  dukkhaTypes?: string[];
  dukkhaPatterns?: string[];
  responseMoves?: string[];
  tags?: string[];
}

export interface MemoryReaderOptions {
  limit?: number;
  minConfidence?: number;
  now?: string;
  staleAfterDays?: number;
}

export interface MemoryReaderTraceResult {
  facts: CareMemory[];
  trace: RetrievalTraceV1;
}

const rejectRules: Array<{ reason: MemoryGuardianReason; patterns: RegExp[] }> = [
  {
    reason: "raw_or_private_detail",
    patterns: [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      /specific address/i,
      /住在.*(街|路|号|apartment|公寓)/i,
    ],
  },
  {
    reason: "medical_or_spiritual_claim",
    patterns: [
      /has .*cancer/i,
      /may have .*cancer/i,
      /diagnosed/i,
      /karmically guilty/i,
      /karmic debt/i,
      /业力|业障|报应|还债|惩罚/,
    ],
  },
  {
    reason: "harm_or_crisis_detail",
    patterns: [/suicide plan/i, /self-harm means/i, /自杀计划|自残方式|报复计划|伤害.*方法/],
  },
];

export function guardMemoryCandidate(candidate: MemoryCandidate): MemoryGuardianResult {
  const reasons: MemoryGuardianReason[] = [];
  const text = candidate.text.trim();

  if (!text) reasons.push("empty_text");
  if (candidate.evidenceIds.length === 0) reasons.push("missing_evidence");
  if (candidate.confidence < 0.5) reasons.push("low_confidence");

  for (const rule of rejectRules) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      reasons.push(rule.reason);
    }
  }

  const uniqueReasons = [...new Set(reasons)];
  if (uniqueReasons.length > 0) {
    return { status: "reject", reasons: uniqueReasons };
  }

  return {
    status: "allow",
    reasons: [],
    memory: {
      ...candidate,
      text,
      tags: candidate.tags || [],
    },
  };
}

export function selectCareFacts(facts: CareFact[], activeTags: string[], limit = 5): CareFact[] {
  const activeTagSet = new Set(activeTags);

  return facts
    .filter((fact) => fact.confidence >= 0.5)
    .map((fact) => ({
      fact,
      relevance: fact.tags.filter((tag) => activeTagSet.has(tag)).length,
    }))
    .filter(({ relevance }) => relevance > 0)
    .sort((a, b) => b.relevance - a.relevance || b.fact.confidence - a.fact.confidence)
    .slice(0, limit)
    .map(({ fact }) => fact);
}

const responseMoveTagAliases: Record<string, string[]> = {
  reject_punishment_frame: ["self_blame", "illness_fear"],
  conditions_not_blame: ["self_blame", "illness_fear"],
  protect_from_self_blame: ["self_blame"],
  return_from_story_to_step: ["body_grounding", "tone"],
  protect_before_practice: ["safety", "body_grounding"],
  give_fearlessness_first: ["safety", "illness_fear"],
  role_not_whole_self: ["role_loss", "self_worth"],
  protect_self_worth: ["role_loss", "self_worth"],
};

const scenarioTagAliases: Record<string, string[]> = {
  "dukkha:reject_punishment_frame": ["self_blame", "illness_fear"],
  "dukkha:role_not_whole_self": ["role_loss", "self_worth"],
};

const riskTags = new Set(["self_blame", "illness_fear", "safety", "crisis", "harm"]);

const textTagRules: Array<{ tag: string; patterns: RegExp[] }> = [
  {
    tag: "illness_fear",
    patterns: [/复查|检查结果|体检|化验|报告|生病|病了|病情|疾病|癌|肿瘤|怕死|真的完了|自己.*完了|活不久|结果还没出来/],
  },
];

function expandScenarioTags(scenarioId: string): string[] {
  const tags = [scenarioId, ...(scenarioTagAliases[scenarioId] || [])];
  const [, responseMove] = scenarioId.split(":");
  if (responseMove) {
    tags.push(responseMove, ...(responseMoveTagAliases[responseMove] || []));
  }

  return tags;
}

function deriveReaderTags(context: MemoryReaderContext): string[] {
  const tags = [
    ...(context.tags || []),
    ...(context.dukkhaTypes || []),
    ...(context.dukkhaPatterns || []),
    ...(context.scenarioId ? expandScenarioTags(context.scenarioId) : []),
    ...deriveTextTags(context.userText || ""),
  ];

  for (const move of context.responseMoves || []) {
    tags.push(move, ...(responseMoveTagAliases[move] || []));
  }

  return unique(tags);
}

function deriveTextTags(userText: string): string[] {
  return textTagRules
    .filter((rule) => rule.patterns.some((pattern) => pattern.test(userText)))
    .map((rule) => rule.tag);
}

function isStaleMemory(memory: CareMemory, now: string, staleAfterDays: number): boolean {
  const nowMs = Date.parse(now);
  const lastSeenMs = Date.parse(memory.lastSeenAt || memory.updatedAt || memory.createdAt);
  if (!Number.isFinite(nowMs) || !Number.isFinite(lastSeenMs)) return false;

  const ageMs = nowMs - lastSeenMs;
  return ageMs > staleAfterDays * 24 * 60 * 60 * 1000;
}

export function readCareFactsFromCard(
  card: CareCard,
  context: MemoryReaderContext,
  options: MemoryReaderOptions = {},
): CareMemory[] {
  return readCareFactsFromCardWithTrace(card, context, options).facts;
}

export function readCareFactsFromCardWithTrace(
  card: CareCard,
  context: MemoryReaderContext,
  options: MemoryReaderOptions = {},
): MemoryReaderTraceResult {
  const startedAt = performanceNow();
  const limit = options.limit ?? 5;
  const minConfidence = options.minConfidence ?? 0.5;
  const now = options.now ?? new Date().toISOString();
  const staleAfterDays = options.staleAfterDays ?? 180;
  const activeTags = deriveReaderTags(context);
  const activeTagSet = new Set(activeTags);
  const riskContext = activeTags.some((tag) => riskTags.has(tag));

  const candidates = card.memories.map((memory) => {
    const memoryTags = unique(memory.tags);
    const matchedTags = memoryTags.filter((tag) => activeTagSet.has(tag));
    const relevance = matchedTags.length;
    const reasons: RetrievalTraceReason[] = [];
    const status = memory.status || "active";

    if (relevance > 0) reasons.push("tag_overlap");
    if (riskContext && (memory.kind === "safety_note" || memory.kind === "avoid_response_move")) reasons.push("risk_kind_boost");
    if (memory.confidence < minConfidence) reasons.push("low_confidence");
    if (status !== "active") reasons.push("inactive_or_superseded");
    if (memory.evidenceIds.length === 0) reasons.push("missing_evidence");
    if (isStaleMemory(memory, now, staleAfterDays)) reasons.push("stale");
    if (relevance === 0) reasons.push("no_tag_overlap");

      const riskBoost =
        riskContext && memory.kind === "safety_note"
          ? 200
          : riskContext && memory.kind === "avoid_response_move"
            ? 120
            : 0;
      const score = relevance * 100 + riskBoost + memory.confidence * 10 + Math.min(memory.occurrences, 5);

    return { memory, memoryTags, matchedTags, reasons: unique(reasons) as RetrievalTraceReason[], score };
  });

  const eligible = activeTags.length === 0 || limit <= 0
    ? []
    : candidates
        .filter(({ reasons }) => !reasons.includes("low_confidence"))
        .filter(({ reasons }) => !reasons.includes("inactive_or_superseded"))
        .filter(({ reasons }) => !reasons.includes("missing_evidence"))
        .filter(({ reasons }) => !reasons.includes("stale"))
        .filter(({ reasons }) => !reasons.includes("no_tag_overlap"))
        .sort((a, b) => b.score - a.score || b.memory.updatedAt.localeCompare(a.memory.updatedAt));
  const selectedMemoryIds = eligible.slice(0, limit).map(({ memory }) => memory.id);
  const selectedMemoryIdSet = new Set(selectedMemoryIds);
  const traceCandidates: RetrievalTraceCandidateV1[] = candidates.map(({ memory, memoryTags, matchedTags, reasons, score }) => {
    const selected = selectedMemoryIdSet.has(memory.id);
    const finalReasons = selected || reasons.some((reason) => reason !== "tag_overlap" && reason !== "risk_kind_boost")
      ? reasons
      : [...reasons, "ranked_below_limit"] as RetrievalTraceReason[];

    return {
      memoryId: memory.id,
      kind: memory.kind,
      status: memory.status || "active",
      tags: memoryTags,
      matchedTags,
      score,
      decision: selected ? "selected" : "rejected",
      reasons: unique(finalReasons) as RetrievalTraceReason[],
    };
  });
  const facts = eligible.slice(0, limit).map(({ memory }) => memory);

  return {
    facts,
    trace: {
      version: "retrieval_trace_v1",
      readerVersion: "deterministic_memory_reader_v0",
      policyVersion: "retrieval_policy_v1",
      inputHash: hashTraceInput(context),
      activeTags,
      requestedLimit: limit,
      minConfidence,
      staleAfterDays,
      candidates: traceCandidates,
      selectedMemoryIds,
      rejected: traceCandidates
        .filter((candidate) => candidate.decision === "rejected")
        .map((candidate) => ({ memoryId: candidate.memoryId, reasons: candidate.reasons })),
      latencyMs: performanceNow() - startedAt,
    },
  };
}

export function buildPromptCareFacts(memories: CareMemory[]): RetrievedCareFact[] {
  return memories.map((memory) => ({
    memoryId: memory.id,
    kind: memory.kind,
    text: memory.text,
    confidence: memory.confidence,
    tags: memory.tags,
  }));
}

function hashTraceInput(context: MemoryReaderContext): string {
  const payload = JSON.stringify({
    userText: context.userText || "",
    scenarioId: context.scenarioId || "",
    dukkhaTypes: context.dukkhaTypes || [],
    dukkhaPatterns: context.dukkhaPatterns || [],
    responseMoves: context.responseMoves || [],
    tags: context.tags || [],
  });
  let hashA = 0x811c9dc5;
  let hashB = 0x1000193;

  for (let index = 0; index < payload.length; index += 1) {
    const code = payload.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 0x01000193) >>> 0;
    hashB ^= code + index;
    hashB = Math.imul(hashB, 0x85ebca6b) >>> 0;
  }

  const seed = `${hashA.toString(16).padStart(8, "0")}${hashB.toString(16).padStart(8, "0")}`;
  return seed.repeat(4).slice(0, 64);
}

function performanceNow(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function normalizeMemoryText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function careMemoryKey(memory: Pick<MemoryCandidate, "kind" | "text">): string {
  return `${memory.kind}:${normalizeMemoryText(memory.text).toLowerCase()}`;
}

export function createEmptyCareCard(now: string): CareCard {
  return {
    version: "care_card_v1",
    createdAt: now,
    updatedAt: now,
    memories: [],
  };
}

export function upsertCareMemory(card: CareCard, candidate: MemoryCandidate, now: string): CareCard {
  const text = normalizeMemoryText(candidate.text);
  const key = careMemoryKey({ ...candidate, text });
  const existingIndex = card.memories.findIndex(
    (memory) => (memory.status || "active") === "active" && careMemoryKey(memory) === key,
  );

  if (existingIndex === -1) {
    const memory: CareMemory = {
      ...candidate,
      text,
      tags: candidate.tags || [],
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
      occurrences: 1,
      status: "active",
    };

    return {
      ...card,
      updatedAt: now,
      memories: [...card.memories, memory],
    };
  }

  const memories = [...card.memories];
  const existing = memories[existingIndex];
  memories[existingIndex] = {
    ...existing,
    confidence: Math.max(existing.confidence, candidate.confidence),
    evidenceIds: unique([...existing.evidenceIds, ...candidate.evidenceIds]),
    tags: unique([...existing.tags, ...(candidate.tags || [])]),
    updatedAt: now,
    lastSeenAt: now,
    occurrences: existing.occurrences + 1,
  };

  return {
    ...card,
    updatedAt: now,
    memories,
  };
}

export function addAllowedMemoryCandidates(card: CareCard, candidates: MemoryCandidate[], now: string): CareCard {
  return candidates.reduce((nextCard, candidate) => {
    const result = guardMemoryCandidate(candidate);
    if (result.status !== "allow" || !result.memory) return nextCard;

    return upsertCareMemory(nextCard, result.memory, now);
  }, card);
}
