import type { RetrievalEvalResult, RetrievalRelevanceGrade } from "../types";

export type RetrievalRelevanceMap = Record<string, RetrievalRelevanceGrade>;

export interface ComputeRetrievalEvalInput {
  retrievedIds: string[];
  relevance: Record<string, number>;
  k: number;
  forbiddenMemoryIds?: string[];
  staleMemoryIds?: string[];
  deletedMemoryIds?: string[];
  supersededMemoryIds?: string[];
  latencyMs: number;
}

export function precisionAtK(retrievedIds: string[], relevance: Record<string, number>, k: number): number {
  const retrievedAtK = dedupeInOrder(retrievedIds).slice(0, safeK(k));
  if (retrievedAtK.length === 0) return 0;

  const relevantRetrievedCount = retrievedAtK.filter((id) => isRelevant(relevance[id])).length;
  return relevantRetrievedCount / retrievedAtK.length;
}

export function recallAtK(retrievedIds: string[], relevance: Record<string, number>, k: number): number {
  const expectedRelevantIds = Object.entries(relevance)
    .filter(([, grade]) => isRelevant(grade))
    .map(([id]) => id);

  if (expectedRelevantIds.length === 0) {
    return retrievedIds.length === 0 ? 1 : 0;
  }

  const retrievedAtK = new Set(dedupeInOrder(retrievedIds).slice(0, safeK(k)));
  const retrievedRelevantCount = expectedRelevantIds.filter((id) => retrievedAtK.has(id)).length;
  return retrievedRelevantCount / expectedRelevantIds.length;
}

export function reciprocalRank(retrievedIds: string[], relevance: Record<string, number>): number {
  const firstRelevantIndex = dedupeInOrder(retrievedIds).findIndex((id) => isRelevant(relevance[id]));
  return firstRelevantIndex === -1 ? 0 : 1 / (firstRelevantIndex + 1);
}

export function dcgAtK(retrievedIds: string[], relevance: Record<string, number>, k: number): number {
  return dedupeInOrder(retrievedIds)
    .slice(0, safeK(k))
    .reduce((total, id, index) => total + discountedGain(relevance[id] || 0, index), 0);
}

export function ndcgAtK(retrievedIds: string[], relevance: Record<string, number>, k: number): number {
  const validK = safeK(k);
  if (validK === 0) return 0;

  const idealRetrievedIds = Object.entries(relevance)
    .filter(([, grade]) => isRelevant(grade))
    .sort(([, leftGrade], [, rightGrade]) => rightGrade - leftGrade)
    .map(([id]) => id);

  if (idealRetrievedIds.length === 0) {
    return retrievedIds.length === 0 ? 1 : 0;
  }

  const ideal = dcgAtK(idealRetrievedIds, relevance, validK);
  if (ideal === 0) return 0;

  return dcgAtK(retrievedIds, relevance, validK) / ideal;
}

export function computeRetrievalEvalResult(input: ComputeRetrievalEvalInput): RetrievalEvalResult {
  const relevance = filterValidRelevance(input.relevance);
  const retrievedIds = dedupeInOrder(input.retrievedIds);
  const unsafeIds = new Set([
    ...(input.forbiddenMemoryIds || []),
    ...(input.staleMemoryIds || []),
    ...(input.deletedMemoryIds || []),
    ...(input.supersededMemoryIds || []),
  ]);

  return {
    precisionAtK: precisionAtK(retrievedIds, relevance, input.k),
    recallAtK: recallAtK(retrievedIds, relevance, input.k),
    reciprocalRank: reciprocalRank(retrievedIds, relevance),
    ndcgAtK: ndcgAtK(retrievedIds, relevance, input.k),
    noMatchCorrect: Object.values(relevance).every((grade) => !isRelevant(grade)) && retrievedIds.length === 0,
    unsafeRetrievalCount: countRetrievedMatches(retrievedIds, unsafeIds),
    staleRetrievalCount: countRetrievedMatches(retrievedIds, new Set(input.staleMemoryIds || [])),
    deletedRetrievalCount: countRetrievedMatches(retrievedIds, new Set(input.deletedMemoryIds || [])),
    supersededRetrievalCount: countRetrievedMatches(retrievedIds, new Set(input.supersededMemoryIds || [])),
    latencyMs: Number.isFinite(input.latencyMs) ? Math.max(0, input.latencyMs) : 0,
  };
}

export function validateRelevanceGrades(relevance: Record<string, number>): string[] {
  return Object.entries(relevance)
    .filter(([, grade]) => !isValidRelevanceGrade(grade))
    .map(([id]) => id);
}

function filterValidRelevance(relevance: Record<string, number>): RetrievalRelevanceMap {
  return Object.fromEntries(
    Object.entries(relevance).filter((entry): entry is [string, RetrievalRelevanceGrade] =>
      isValidRelevanceGrade(entry[1]),
    ),
  );
}

function discountedGain(grade: number, zeroBasedRank: number): number {
  if (!isValidRelevanceGrade(grade) || grade <= 0) return 0;
  return (2 ** grade - 1) / Math.log2(zeroBasedRank + 2);
}

function isRelevant(grade: number | undefined): boolean {
  return typeof grade === "number" && grade > 0;
}

function isValidRelevanceGrade(grade: number): grade is RetrievalRelevanceGrade {
  return grade === 0 || grade === 1 || grade === 2;
}

function safeK(k: number): number {
  return Number.isFinite(k) && k > 0 ? Math.floor(k) : 0;
}

function dedupeInOrder(ids: string[]): string[] {
  return [...new Set(ids)];
}

function countRetrievedMatches(retrievedIds: string[], idsToCount: Set<string>): number {
  return retrievedIds.filter((id) => idsToCount.has(id)).length;
}
