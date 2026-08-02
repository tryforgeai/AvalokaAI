import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMemoryReaderCases, runMemoryReaderBenchmark } from "./memory-reader-benchmark-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function analyzeRetrievalFailures(summary, options = {}) {
  const targets = {
    recallAt5: 1,
    noMatchPrecision: 1,
    unsafeRetrievalCount: 0,
    ndcgAt5: 0.95,
    ...options.targets,
  };
  const results = summary?.results || [];
  const failureCases = results.filter((result) => result.verdict === "failed").map(summarizeCase);
  const failureTaxonomy = buildFailureTaxonomy(results);
  const groupSummary = buildGroupSummary(results);
  const pressureSignals = buildPressureSignals(summary, targets, results);
  const status = failureCases.length > 0 || pressureSignals.length > 0 ? "investigate" : "pass_watch";

  return {
    version: "retrieval_failure_mining_v0",
    status,
    total: summary?.total || 0,
    passed: summary?.passed || 0,
    failed: summary?.failed || 0,
    aggregates: summary?.aggregates || {},
    failureCases,
    failureTaxonomy,
    groupSummary,
    pressureSignals,
    recommendations: buildRecommendations({ status, failureCases, pressureSignals }),
  };
}

export function formatFailureMiningReport(analysis, context = {}) {
  const date = context.date || new Date().toISOString().slice(0, 10);
  const benchmarkCommand = context.benchmarkCommand || "npm run eval:memory:reader";
  const aggregates = analysis.aggregates || {};
  const lines = [
    "# Retrieval Failure Mining V0 Report",
    "",
    `Date: ${date}`,
    "Status: Active R1 research artifact",
    "",
    "## Verdict",
    "",
    analysis.status === "pass_watch"
      ? "No current deterministic Memory Reader failure was found in the committed benchmark. Continue mining harder cases before adding embeddings or graph memory."
      : "Retrieval pressure was found. Investigate the listed cases before changing retrieval architecture.",
    "",
    "## Benchmark Command",
    "",
    "```bash",
    benchmarkCommand,
    "```",
    "",
    "## Aggregate Metrics",
    "",
    "```text",
    `total: ${analysis.total}`,
    `passed: ${analysis.passed}`,
    `failed: ${analysis.failed}`,
    `recall@3: ${formatNumber(aggregates.recallAt3)}`,
    `recall@5: ${formatNumber(aggregates.recallAt5)}`,
    `mrr: ${formatNumber(aggregates.mrr)}`,
    `ndcg@5: ${formatNumber(aggregates.ndcgAt5)}`,
    `no-match precision: ${formatNumber(aggregates.noMatchPrecision)}`,
    `unsafe retrieval count: ${aggregates.unsafeRetrievalCount || 0}`,
    `stale retrieval count: ${aggregates.staleRetrievalCount || 0}`,
    `deleted retrieval count: ${aggregates.deletedRetrievalCount || 0}`,
    `superseded retrieval count: ${aggregates.supersededRetrievalCount || 0}`,
    "```",
    "",
    "## Failure Taxonomy",
    "",
    ...formatTaxonomy(analysis.failureTaxonomy),
    "",
    "## Group Summary",
    "",
    ...formatGroups(analysis.groupSummary),
    "",
    "## Pressure Signals",
    "",
    ...formatPressureSignals(analysis.pressureSignals),
    "",
    "## Failure Cases",
    "",
    ...formatFailureCases(analysis.failureCases),
    "",
    "## Recommendations",
    "",
    ...analysis.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
  ];
  return `${lines.join("\n").trim()}\n`;
}

export function runRetrievalFailureMining({ casesPath, limit, output, json = false, date } = {}) {
  const resolvedCasesPath = resolve(repoRoot, casesPath || "evals/memory-reader-retrieval-cases.json");
  const cases = loadMemoryReaderCases(resolvedCasesPath);
  const summary = runMemoryReaderBenchmark({ cases, limit: Number.isFinite(limit) ? limit : cases.length });
  const analysis = analyzeRetrievalFailures(summary);
  const report = formatFailureMiningReport(analysis, {
    date,
    benchmarkCommand: "npm run eval:memory:reader",
  });

  if (output) writeFileSync(resolve(repoRoot, output), report);
  if (json) console.log(JSON.stringify({ analysis, summary }, null, 2));
  else console.log(report);

  return { analysis, summary, report };
}

function summarizeCase(result) {
  return {
    id: result.id,
    group: result.group,
    failureReason: result.failureReason,
    checks: result.checks || [],
    retrievedIds: result.observed?.retrievedIds || [],
    recallAt5: result.metrics?.recallAt5,
    ndcgAt5: result.metrics?.ndcgAt5,
    unsafeRetrievalCount: result.metrics?.unsafeRetrievalCount || 0,
  };
}

function buildFailureTaxonomy(results) {
  const taxonomy = {};
  for (const result of results) {
    const key = result.failureReason || "fixture_or_contract_error";
    taxonomy[key] ||= { count: 0, caseIds: [] };
    taxonomy[key].count += 1;
    if (result.verdict === "failed") taxonomy[key].caseIds.push(result.id);
  }
  return taxonomy;
}

function buildGroupSummary(results) {
  const groups = {};
  for (const result of results) {
    const group = result.group || "unknown";
    groups[group] ||= { total: 0, passed: 0, failed: 0 };
    groups[group].total += 1;
    if (result.verdict === "passed") groups[group].passed += 1;
    else groups[group].failed += 1;
  }
  return groups;
}

function buildPressureSignals(summary, targets, results) {
  const aggregates = summary?.aggregates || {};
  const signals = [];
  if ((aggregates.recallAt5 ?? 0) < targets.recallAt5) {
    signals.push({ kind: "recall_below_target", observed: aggregates.recallAt5, target: targets.recallAt5 });
  }
  if ((aggregates.ndcgAt5 ?? 0) < targets.ndcgAt5) {
    signals.push({ kind: "rank_quality_below_target", observed: aggregates.ndcgAt5, target: targets.ndcgAt5 });
  }
  if ((aggregates.noMatchPrecision ?? 0) < targets.noMatchPrecision) {
    signals.push({ kind: "no_match_precision_below_target", observed: aggregates.noMatchPrecision, target: targets.noMatchPrecision });
  }
  if ((aggregates.unsafeRetrievalCount || 0) > targets.unsafeRetrievalCount) {
    signals.push({ kind: "unsafe_retrieval_present", observed: aggregates.unsafeRetrievalCount, target: targets.unsafeRetrievalCount });
  }
  const lowRankPassed = results.filter((result) => result.verdict === "passed" && result.metrics?.ndcgAt5 < targets.ndcgAt5);
  if (lowRankPassed.length > 0) {
    signals.push({ kind: "passed_cases_with_low_rank_quality", observed: lowRankPassed.length, caseIds: lowRankPassed.map((result) => result.id) });
  }
  return signals;
}

function buildRecommendations({ status, failureCases, pressureSignals }) {
  if (status === "pass_watch") {
    return [
      "Mine harder cases before changing retrieval architecture.",
      "Do not add embeddings or graph memory yet; the committed benchmark does not show a deterministic-reader bottleneck.",
      "Add adversarial paraphrase, hard-negative, temporal-conflict, and user-control cases next.",
    ];
  }

  const reasons = new Set(failureCases.map((testCase) => testCase.failureReason));
  const signalKinds = new Set(pressureSignals.map((signal) => signal.kind));
  const recommendations = ["Do not add embeddings or graph memory yet; first classify the concrete retrieval failures and add targeted fixtures."];
  if (reasons.has("missing_tag_or_alias") || reasons.has("semantic_paraphrase_miss") || signalKinds.has("recall_below_target")) {
    recommendations.push("Prefer alias-map or fixture expansion before semantic/vector retrieval.");
  }
  if (reasons.has("stale_or_inactive_leak") || signalKinds.has("unsafe_retrieval_present")) {
    recommendations.push("Fix lifecycle and safety filtering before increasing recall breadth.");
  }
  if (signalKinds.has("rank_quality_below_target") || signalKinds.has("passed_cases_with_low_rank_quality")) {
    recommendations.push("Inspect ranking traces before adding a reranker; current candidates may only need deterministic scoring adjustments.");
  }
  return recommendations;
}

function formatTaxonomy(taxonomy) {
  const entries = Object.entries(taxonomy || {}).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return ["No taxonomy entries."];
  return entries.map(([reason, value]) => `- ${reason}: ${value.count}${value.caseIds.length ? ` (${value.caseIds.join(", ")})` : ""}`);
}

function formatGroups(groups) {
  const entries = Object.entries(groups || {}).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return ["No groups found."];
  return entries.map(([group, value]) => `- ${group}: ${value.passed}/${value.total} passed, ${value.failed} failed`);
}

function formatPressureSignals(signals) {
  if (!signals || signals.length === 0) return ["No pressure signals found in the committed benchmark."];
  return signals.map((signal) => `- ${signal.kind}: observed=${formatValue(signal.observed)}${signal.target === undefined ? "" : `, target=${formatValue(signal.target)}`}${signal.caseIds ? `, cases=${signal.caseIds.join(", ")}` : ""}`);
}

function formatFailureCases(cases) {
  if (!cases || cases.length === 0) return ["No failed cases in the committed benchmark."];
  return cases.flatMap((testCase) => [
    `### ${testCase.id}`,
    "",
    `- group: ${testCase.group}`,
    `- reason: ${testCase.failureReason}`,
    `- retrieved: ${testCase.retrievedIds.length ? testCase.retrievedIds.join(", ") : "none"}`,
    `- checks: ${testCase.checks.length ? testCase.checks.join("; ") : "none"}`,
    "",
  ]);
}

function formatNumber(value) {
  return Number(value || 0).toFixed(3);
}

function formatValue(value) {
  return typeof value === "number" ? formatNumber(value) : String(value);
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    if (key === "json") {
      parsed.json = true;
      continue;
    }
    const next = values[index + 1];
    parsed[key] = key === "limit" ? Number(next) : next;
    index += 1;
  }
  return parsed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRetrievalFailureMining(parseArgs(process.argv.slice(2)));
}
