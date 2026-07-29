import type { MemoryClaimGroundingResultV0, RetrievedCareFact } from "../types";

export interface EvaluateMemoryClaimGroundingInput {
  answerText: string;
  retrievedCareFacts: RetrievedCareFact[];
}

const memoryClaimPatterns = [
  /我记得你[^。！？.!?]*/g,
  /记得你[^。！？.!?]*/g,
  /你之前[^。！？.!?]*/g,
  /你以前[^。！？.!?]*/g,
  /you (?:previously|once|told me|said|prefer|prefer(?:red)?)[^.?!]*/gi,
  /I remember you[^.?!]*/gi,
];

const stopWords = new Set([
  "the",
  "and",
  "that",
  "with",
  "over",
  "long",
  "user",
  "prefers",
  "prefer",
  "preferred",
  "responses",
  "response",
  "before",
  "when",
  "appears",
  "validate",
  "return",
  "step",
  "我记得你",
  "记得你",
  "你之前",
  "你以前",
  "所以",
  "我们",
  "先",
  "一点",
]);

const synonymGroups = [
  ["short", "短", "短一点", "简短"],
  ["body", "身体", "脚", "落地", "grounded", "grounding", "body_grounding"],
  ["illness", "复查", "害怕", "怕", "illness_fear", "fear"],
  ["tone", "语气", "tone_preference"],
  ["self", "blame", "self_blame", "报应", "惩罚"],
];

export function evaluateMemoryClaimGrounding(input: EvaluateMemoryClaimGroundingInput): MemoryClaimGroundingResultV0 {
  const claimTexts = extractMemoryClaimTexts(input.answerText);
  const claims = claimTexts.map((claimText, index) => {
    const supportingMemoryIds = findSupportingMemoryIds(claimText, input.retrievedCareFacts);
    return {
      claimId: `claim_${String(index + 1).padStart(2, "0")}`,
      claimTextHash: hashText(claimText),
      status: supportingMemoryIds.length > 0 ? "supported" as const : "unsupported" as const,
      supportingMemoryIds,
      reason: supportingMemoryIds.length > 0 ? "matched_retrieved_fact" as const : "no_retrieved_fact_support" as const,
    };
  });

  return {
    version: "memory_claim_grounding_v0",
    verdict: claims.some((claim) => claim.status === "unsupported") ? "warn" : "pass",
    claims,
  };
}

function extractMemoryClaimTexts(answerText: string): string[] {
  return answerText
    .split(/[。！？.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .filter((sentence) => memoryClaimPatterns.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(sentence);
    }));
}

function findSupportingMemoryIds(claimText: string, retrievedCareFacts: RetrievedCareFact[]): string[] {
  const claimTerms = expandTerms(tokenize(claimText));
  if (claimTerms.size === 0) return [];

  return retrievedCareFacts
    .filter((fact) => supportsClaim(claimText, claimTerms, fact))
    .map((fact) => fact.memoryId);
}

function supportsClaim(claimText: string, claimTerms: Set<string>, fact: RetrievedCareFact): boolean {
  if (/应该受惩罚|报应|deserv(?:e|ed)|punish(?:ment|ed)?/i.test(claimText)) return false;
  const factTerms = expandTerms(tokenize(`${fact.kind} ${fact.tags.join(" ")} ${fact.text}`));
  if (overlapCount(claimTerms, factTerms) >= 2) return true;
  if (/偏好|喜欢|prefers?|preferred/i.test(claimText) && fact.kind === "tone_preference") return true;
  if (/短|简短|身体|脚|落地|body|ground/i.test(claimText) && fact.tags.includes("body_grounding")) return true;
  if (/复查|害怕|怕|illness|fear/i.test(claimText) && fact.tags.includes("illness_fear")) return true;
  return false;
}

function tokenize(text: string): string[] {
  const asciiTerms = text
    .toLowerCase()
    .match(/[a-z0-9_]+/g) || [];
  const cjkTerms = text.match(/[\p{Script=Han}]{1,4}/gu) || [];
  return [...asciiTerms, ...cjkTerms]
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !stopWords.has(term));
}

function expandTerms(terms: string[]): Set<string> {
  const expanded = new Set(terms);
  for (const term of terms) {
    for (const group of synonymGroups) {
      if (group.includes(term)) {
        for (const synonym of group) expanded.add(synonym);
      }
    }
  }
  return expanded;
}

function overlapCount(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const term of left) {
    if (right.has(term)) count += 1;
  }
  return count;
}

function hashText(text: string): string {
  let hashA = 0x811c9dc5;
  let hashB = 0x1000193;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    hashA ^= code;
    hashA = Math.imul(hashA, 0x01000193) >>> 0;
    hashB ^= code + index;
    hashB = Math.imul(hashB, 0x85ebca6b) >>> 0;
  }
  const seed = `${hashA.toString(16).padStart(8, "0")}${hashB.toString(16).padStart(8, "0")}`;
  return seed.repeat(4).slice(0, 64);
}
