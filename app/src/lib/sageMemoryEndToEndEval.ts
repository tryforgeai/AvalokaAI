import {
  addAllowedMemoryCandidates,
  createEmptyCareCard,
  guardMemoryCandidate,
  readCareFactsFromCard,
  type MemoryReaderContext,
} from "./sageMemory";
import type { MemoryCandidate } from "../types";

export type SageEndToEndFailureStage = "writer" | "guardian" | "store" | "reader" | "fixture";
export type SageEndToEndVerdict = "passed" | "failed";

export interface SageEndToEndCase {
  id: string;
  group: string;
  now: string;
  writerCandidates: MemoryCandidate[];
  expectedWriterIds?: string[];
  forbiddenWriterIds?: string[];
  expectedRejectedIds?: string[];
  expectedSavedIds?: string[];
  retrievalContext: MemoryReaderContext;
  expectedRetrievedIds: string[];
  reason: string;
}

export interface SageEndToEndCheck {
  stage: SageEndToEndFailureStage;
  message: string;
}

export interface SageEndToEndResult {
  id: string;
  group: string;
  verdict: SageEndToEndVerdict;
  checks: string[];
  stageChecks: SageEndToEndCheck[];
  observed: {
    writerCandidateIds: string[];
    rejectedIds: string[];
    savedIds: string[];
    retrievedIds: string[];
  };
}

export interface SageEndToEndSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  stageCounts: Record<SageEndToEndFailureStage, number>;
  results: SageEndToEndResult[];
}

export function runSageMemoryEndToEndEval(cases: SageEndToEndCase[]): SageEndToEndSummary {
  const results = cases.map(evaluateSageMemoryEndToEndCase);
  const passed = results.filter((result) => result.verdict === "passed").length;
  const stageCounts: Record<SageEndToEndFailureStage, number> = {
    writer: 0,
    guardian: 0,
    store: 0,
    reader: 0,
    fixture: 0,
  };

  for (const result of results) {
    for (const stage of new Set(result.stageChecks.map((check) => check.stage))) {
      stageCounts[stage] += 1;
    }
  }

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate: results.length === 0 ? 0 : passed / results.length,
    stageCounts,
    results,
  };
}

export function evaluateSageMemoryEndToEndCase(testCase: SageEndToEndCase): SageEndToEndResult {
  const stageChecks: SageEndToEndCheck[] = [];
  const writerCandidateIds = testCase.writerCandidates.map((candidate) => candidate.id);
  const duplicateWriterIds = writerCandidateIds.filter((id, index) => writerCandidateIds.indexOf(id) !== index);

  if (duplicateWriterIds.length > 0) {
    addCheck(stageChecks, "fixture", `fixture has duplicate writer candidate id(s): ${unique(duplicateWriterIds).join(", ")}`);
  }

  for (const id of testCase.expectedWriterIds || []) {
    if (!writerCandidateIds.includes(id)) {
      addCheck(stageChecks, "writer", `writer missing expected candidate "${id}"`);
    }
  }

  for (const id of testCase.forbiddenWriterIds || []) {
    if (writerCandidateIds.includes(id)) {
      addCheck(stageChecks, "writer", `writer produced forbidden candidate "${id}"`);
    }
  }

  const guardianResults = testCase.writerCandidates.map((candidate) => ({
    candidate,
    result: guardMemoryCandidate(candidate),
  }));
  const rejectedIds = guardianResults
    .filter(({ result }) => result.status === "reject")
    .map(({ candidate }) => candidate.id);

  for (const id of testCase.expectedRejectedIds || []) {
    if (!rejectedIds.includes(id)) {
      addCheck(stageChecks, "guardian", `guardian did not reject expected memory "${id}"`);
    }
  }

  const careCard = addAllowedMemoryCandidates(createEmptyCareCard(testCase.now), testCase.writerCandidates, testCase.now);
  const savedIds = careCard.memories.map((memory) => memory.id);

  for (const id of testCase.expectedSavedIds || []) {
    if (!savedIds.includes(id)) {
      addCheck(stageChecks, "store", `store missing expected memory "${id}"`);
    }
  }

  for (const id of testCase.expectedRejectedIds || []) {
    if (savedIds.includes(id)) {
      addCheck(stageChecks, "store", `store saved rejected memory "${id}"`);
    }
  }

  const retrievedIds = readCareFactsFromCard(careCard, testCase.retrievalContext, {
    now: testCase.now,
    limit: 5,
  }).map((memory) => memory.id);

  for (const id of testCase.expectedRetrievedIds) {
    if (!retrievedIds.includes(id)) {
      addCheck(stageChecks, "reader", `reader missing expected memory "${id}"`);
    }
  }

  return {
    id: testCase.id,
    group: testCase.group,
    verdict: stageChecks.length === 0 ? "passed" : "failed",
    checks: stageChecks.map((check) => `${check.stage}: ${check.message}`),
    stageChecks,
    observed: {
      writerCandidateIds,
      rejectedIds,
      savedIds,
      retrievedIds,
    },
  };
}

function addCheck(checks: SageEndToEndCheck[], stage: SageEndToEndFailureStage, message: string): void {
  checks.push({ stage, message });
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
