export type MemoryCandidateKind =
  | "recurring_pain_pattern"
  | "helpful_response_move"
  | "avoid_response_move"
  | "tone_preference"
  | "safety_note"
  | "context_category";

export interface MemoryCandidate {
  id: string;
  kind: MemoryCandidateKind;
  text: string;
  confidence: number;
  evidenceIds: string[];
  tags?: string[];
}

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
