import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require(resolve(repoRoot, "app/node_modules/typescript"));
const defaultStaleAfterDays = 180;

const { readCareFactsFromCardWithTrace } = loadTypeScriptModule(resolve(repoRoot, "app/src/lib/sageMemory.ts"));
const { computeRetrievalEvalResult } = loadTypeScriptModule(resolve(repoRoot, "app/src/lib/retrievalMetrics.ts"));

export function loadMemoryReaderCases(path = resolve(repoRoot, "evals/memory-reader-retrieval-cases.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function runMemoryReaderBenchmark({ cases, limit = cases.length, reader = readCareFactsFromCardWithTrace, readerOptions = {} } = {}) {
  const selectedCases = (cases || []).slice(0, limit);
  const validationErrors = validateMemoryReaderCases(selectedCases);
  if (validationErrors.length > 0) {
    return {
      total: selectedCases.length,
      passed: 0,
      failed: selectedCases.length,
      validationErrors,
      aggregates: emptyAggregates(),
      failureTaxonomy: emptyFailureTaxonomy({ fixture_or_contract_error: selectedCases.length }),
      results: selectedCases.map((testCase) => ({
        id: testCase.id || "missing_id",
        group: testCase.group || "missing_group",
        verdict: "failed",
        failureReason: "fixture_or_contract_error",
        checks: validationErrors,
        metrics: emptyCaseMetrics(),
        observed: { retrievedIds: [] },
      })),
    };
  }

  const results = selectedCases.map((testCase) => evaluateMemoryReaderCase(testCase, { reader, readerOptions }));
  return summarizeBenchmarkResults(results);
}

export function evaluateMemoryReaderCase(testCase, { reader = readCareFactsFromCardWithTrace, readerOptions = {} } = {}) {
  const startedAt = performanceNow();
  const readerOutput = reader(testCase.careCard, testCase.readerContext, {
    now: testCase.now,
    limit: 5,
    staleAfterDays: defaultStaleAfterDays,
    ...readerOptions,
  });
  const retrieved = Array.isArray(readerOutput) ? readerOutput : readerOutput.facts;
  const trace = Array.isArray(readerOutput) ? undefined : readerOutput.trace;
  const latencyMs = performanceNow() - startedAt;
  const retrievedIds = retrieved.map((memory) => memory.id);
  const staleMemoryIds = staleIds(testCase);
  const deletedMemoryIds = deletedIds(testCase);
  const supersededMemoryIds = supersededIds(testCase);

  const metricsAt3 = computeRetrievalEvalResult({
    retrievedIds,
    relevance: testCase.relevance || {},
    k: 3,
    forbiddenMemoryIds: testCase.forbiddenMemoryIds || [],
    staleMemoryIds,
    deletedMemoryIds,
    supersededMemoryIds,
    latencyMs,
  });
  const metricsAt5 = computeRetrievalEvalResult({
    retrievedIds,
    relevance: testCase.relevance || {},
    k: 5,
    forbiddenMemoryIds: testCase.forbiddenMemoryIds || [],
    staleMemoryIds,
    deletedMemoryIds,
    supersededMemoryIds,
    latencyMs,
  });
  const metrics = {
    precisionAt3: metricsAt3.precisionAtK,
    precisionAt5: metricsAt5.precisionAtK,
    recallAt3: metricsAt3.recallAtK,
    recallAt5: metricsAt5.recallAtK,
    reciprocalRank: metricsAt5.reciprocalRank,
    ndcgAt5: metricsAt5.ndcgAtK,
    noMatchCorrect: metricsAt5.noMatchCorrect,
    unsafeRetrievalCount: metricsAt5.unsafeRetrievalCount,
    staleRetrievalCount: metricsAt5.staleRetrievalCount,
    deletedRetrievalCount: metricsAt5.deletedRetrievalCount,
    supersededRetrievalCount: metricsAt5.supersededRetrievalCount,
    latencyMs: metricsAt5.latencyMs,
  };

  const checks = [];
  for (const memoryId of positiveRelevanceIds(testCase)) {
    if (!retrievedIds.includes(memoryId)) checks.push(`missing expected memory "${memoryId}"`);
  }
  for (const memoryId of testCase.forbiddenMemoryIds || []) {
    if (retrievedIds.includes(memoryId)) checks.push(`retrieved forbidden memory "${memoryId}"`);
  }
  if (testCase.expectedNoMatch && retrievedIds.length > 0) {
    checks.push(`expected no match, got ${retrievedIds.join(", ")}`);
  }

  const failureReason = classifyFailure({ testCase, metrics, checks, retrievedIds });
  return {
    id: testCase.id,
    group: testCase.group,
    verdict: checks.length === 0 ? "passed" : "failed",
    failureReason,
    checks,
    metrics,
    observed: {
      retrievedIds,
      expectedRelevance: testCase.relevance || {},
    },
    trace: trace ? summarizeTrace(trace) : undefined,
  };
}

export function validateMemoryReaderCases(cases) {
  const errors = [];
  const caseIds = new Set();
  for (const testCase of cases || []) {
    const id = testCase?.id || "missing_id";
    if (!testCase?.id) errors.push("Memory reader retrieval case must include id.");
    if (caseIds.has(testCase?.id)) errors.push(`Duplicate memory reader retrieval case id: ${testCase.id}`);
    if (testCase?.id) caseIds.add(testCase.id);
    if (!testCase?.group) errors.push(`Memory reader retrieval case ${id} must include group.`);
    if (!testCase?.description) errors.push(`Memory reader retrieval case ${id} must include description.`);
    if (!testCase?.readerContext) errors.push(`Memory reader retrieval case ${id} must include readerContext.`);
    if (typeof testCase?.expectedNoMatch !== "boolean") errors.push(`Memory reader retrieval case ${id} must include expectedNoMatch boolean.`);
    if (!testCase?.now || Number.isNaN(Date.parse(testCase.now))) errors.push(`Memory reader retrieval case ${id} has invalid now.`);

    const careCard = testCase?.careCard;
    if (careCard?.version !== "care_card_v1") errors.push(`Memory reader retrieval case ${id} must include care_card_v1.`);
    if (!Array.isArray(careCard?.memories)) errors.push(`Memory reader retrieval case ${id} careCard.memories must be an array.`);

    const memoryById = new Map();
    for (const memory of careCard?.memories || []) {
      if (!memory.id) errors.push(`Memory reader retrieval case ${id} has a memory without id.`);
      if (memoryById.has(memory.id)) errors.push(`Memory reader retrieval case ${id} has duplicate memory id ${memory.id}.`);
      memoryById.set(memory.id, memory);
      for (const field of ["kind", "text", "createdAt", "updatedAt", "lastSeenAt"]) {
        if (!memory[field]) errors.push(`Memory reader retrieval case ${id} memory ${memory.id} must include ${field}.`);
      }
      if (!Number.isFinite(memory.confidence)) errors.push(`Memory reader retrieval case ${id} memory ${memory.id} must include confidence.`);
      if (!Number.isFinite(memory.occurrences)) errors.push(`Memory reader retrieval case ${id} memory ${memory.id} must include occurrences.`);
      if (!Array.isArray(memory.evidenceIds) || memory.evidenceIds.length === 0) {
        const intentionallyForbidden = (testCase?.forbiddenMemoryIds || []).includes(memory.id);
        if (!intentionallyForbidden) errors.push(`Memory reader retrieval case ${id} memory ${memory.id} is missing evidence IDs.`);
      }
      if (!Array.isArray(memory.tags)) errors.push(`Memory reader retrieval case ${id} memory ${memory.id} must include tags.`);
    }

    const relevance = testCase?.relevance || {};
    if (!relevance || typeof relevance !== "object" || Array.isArray(relevance)) {
      errors.push(`Memory reader retrieval case ${id} must include relevance object.`);
    }
    const positiveRelevanceEntries = Object.entries(relevance).filter(([, grade]) => grade > 0);
    if (testCase?.expectedNoMatch && positiveRelevanceEntries.length > 0) {
      errors.push(`No-match memory reader case ${id} must not include positive relevance.`);
    }
    for (const [memoryId, grade] of Object.entries(relevance)) {
      if (![0, 1, 2].includes(grade)) errors.push(`Memory reader retrieval case ${id} has invalid relevance grade for ${memoryId}.`);
      if (!memoryById.has(memoryId)) errors.push(`Memory reader retrieval case ${id} relevance points to missing memory ${memoryId}.`);
    }

    const deletedMemoryIds = new Set(deletedIds(testCase));
    for (const memoryId of testCase?.forbiddenMemoryIds || []) {
      const memory = memoryById.get(memoryId);
      if (!memory && !deletedMemoryIds.has(memoryId)) errors.push(`Memory reader retrieval case ${id} forbids missing memory ${memoryId}.`);
    }
  }
  return errors;
}

function summarizeBenchmarkResults(results) {
  const passed = results.filter((result) => result.verdict === "passed").length;
  const failed = results.length - passed;
  const aggregates = aggregateMetrics(results);
  const failureTaxonomy = emptyFailureTaxonomy();
  for (const result of results) {
    failureTaxonomy[result.failureReason] = (failureTaxonomy[result.failureReason] || 0) + 1;
  }
  return { total: results.length, passed, failed, passRate: results.length === 0 ? 0 : passed / results.length, aggregates, failureTaxonomy, results };
}

function aggregateMetrics(results) {
  if (results.length === 0) return emptyAggregates();
  const noMatchResults = results.filter((result) => result.observed && Object.values(result.observed.expectedRelevance).every((grade) => grade <= 0));
  return {
    recallAt3: average(results.map((result) => result.metrics.recallAt3)),
    recallAt5: average(results.map((result) => result.metrics.recallAt5)),
    mrr: average(results.map((result) => result.metrics.reciprocalRank)),
    ndcgAt5: average(results.map((result) => result.metrics.ndcgAt5)),
    noMatchPrecision: noMatchResults.length === 0 ? 1 : average(noMatchResults.map((result) => result.metrics.noMatchCorrect ? 1 : 0)),
    unsafeRetrievalCount: sum(results.map((result) => result.metrics.unsafeRetrievalCount)),
    staleRetrievalCount: sum(results.map((result) => result.metrics.staleRetrievalCount)),
    deletedRetrievalCount: sum(results.map((result) => result.metrics.deletedRetrievalCount)),
    supersededRetrievalCount: sum(results.map((result) => result.metrics.supersededRetrievalCount)),
    p50LatencyMs: percentile(results.map((result) => result.metrics.latencyMs), 0.5),
    p95LatencyMs: percentile(results.map((result) => result.metrics.latencyMs), 0.95),
  };
}

function classifyFailure({ testCase, metrics, checks, retrievedIds }) {
  if (checks.length === 0) return "none";
  if (metrics.staleRetrievalCount > 0 || metrics.deletedRetrievalCount > 0 || metrics.supersededRetrievalCount > 0) return "stale_or_inactive_leak";
  if (testCase.expectedNoMatch && retrievedIds.length > 0) return "no_match_false_positive";
  if (testCase.group === "semantic_paraphrase") return "semantic_paraphrase_miss";
  if (testCase.group === "hard_negative") return "hard_negative_false_hit";
  if (testCase.group === "safety_priority") return "safety_priority_failure";
  if (positiveRelevanceIds(testCase).length > 0 && metrics.recallAt5 < 1) return "missing_tag_or_alias";
  if (metrics.ndcgAt5 < 1) return "correct_candidate_ranked_low";
  return "fixture_or_contract_error";
}

function summarizeTrace(trace) {
  return {
    version: trace.version,
    readerVersion: trace.readerVersion,
    policyVersion: trace.policyVersion,
    inputHash: trace.inputHash,
    activeTags: trace.activeTags,
    requestedLimit: trace.requestedLimit,
    minConfidence: trace.minConfidence,
    staleAfterDays: trace.staleAfterDays,
    selectedMemoryIds: trace.selectedMemoryIds,
    rejected: trace.rejected,
    candidates: trace.candidates.map((candidate) => ({
      memoryId: candidate.memoryId,
      kind: candidate.kind,
      status: candidate.status,
      tags: candidate.tags,
      matchedTags: candidate.matchedTags,
      score: candidate.score,
      decision: candidate.decision,
      reasons: candidate.reasons,
    })),
    latencyMs: trace.latencyMs,
  };
}

function positiveRelevanceIds(testCase) {
  return Object.entries(testCase.relevance || {}).filter(([, grade]) => grade > 0).map(([memoryId]) => memoryId);
}

function staleIds(testCase) {
  return (testCase.careCard?.memories || []).filter((memory) => isStaleFixtureMemory(memory, testCase.now)).map((memory) => memory.id);
}

function deletedIds(testCase) {
  return (testCase.careCard?.lifecycleEvents || []).filter((event) => event.type === "delete").map((event) => event.memoryId);
}

function supersededIds(testCase) {
  return (testCase.careCard?.memories || []).filter((memory) => memory.status === "superseded").map((memory) => memory.id);
}

function isStaleFixtureMemory(memory, now, staleAfterDays = defaultStaleAfterDays) {
  const nowMs = Date.parse(now || "");
  const lastSeenMs = Date.parse(memory?.lastSeenAt || memory?.updatedAt || memory?.createdAt || "");
  if (!Number.isFinite(nowMs) || !Number.isFinite(lastSeenMs)) return false;
  return nowMs - lastSeenMs > staleAfterDays * 24 * 60 * 60 * 1000;
}

function loadTypeScriptModule(path) {
  const source = readFileSync(path, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier === "../types") return {};
    throw new Error(`Unsupported TypeScript module import ${specifier} from ${path}`);
  };
  const fn = new Function("exports", "module", "require", js);
  fn(module.exports, module, localRequire);
  return module.exports;
}

function performanceNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function average(values) {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function percentile(values, quantile) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * quantile) - 1);
  return sorted[index];
}

function emptyCaseMetrics() {
  return { precisionAt3: 0, precisionAt5: 0, recallAt3: 0, recallAt5: 0, reciprocalRank: 0, ndcgAt5: 0, noMatchCorrect: false, unsafeRetrievalCount: 0, staleRetrievalCount: 0, deletedRetrievalCount: 0, supersededRetrievalCount: 0, latencyMs: 0 };
}

function emptyAggregates() {
  return { recallAt3: 0, recallAt5: 0, mrr: 0, ndcgAt5: 0, noMatchPrecision: 0, unsafeRetrievalCount: 0, staleRetrievalCount: 0, deletedRetrievalCount: 0, supersededRetrievalCount: 0, p50LatencyMs: 0, p95LatencyMs: 0 };
}

function emptyFailureTaxonomy(overrides = {}) {
  return { none: 0, missing_tag_or_alias: 0, semantic_paraphrase_miss: 0, hard_negative_false_hit: 0, correct_candidate_ranked_low: 0, no_match_false_positive: 0, stale_or_inactive_leak: 0, safety_priority_failure: 0, fixture_or_contract_error: 0, ...overrides };
}
