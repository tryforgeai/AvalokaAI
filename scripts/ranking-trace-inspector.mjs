import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMemoryReaderCases, runMemoryReaderBenchmark } from "./memory-reader-benchmark-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function analyzeRankingTracePressure(summary, options = {}) {
  const ndcgThreshold = options.ndcgThreshold ?? 0.95;
  const results = summary?.results || [];
  const findings = results
    .filter((result) => result.verdict === "passed")
    .filter((result) => (result.metrics?.ndcgAt5 ?? 1) < ndcgThreshold)
    .map((result) => inspectCase(result, { ndcgThreshold }))
    .filter(Boolean);

  return {
    version: "ranking_trace_inspection_v0",
    status: findings.length > 0 ? "investigate" : "pass_watch",
    totalCases: summary?.total || 0,
    inspectedCases: findings.length,
    ndcgThreshold,
    findings,
    classSummary: summarizeClasses(findings),
    recommendations: recommendationsFor(findings),
  };
}

export function formatRankingTraceInspectionReport(analysis, context = {}) {
  const date = context.date || new Date().toISOString().slice(0, 10);
  const command = context.command || "npm run eval:memory:reader:ranking";
  const lines = [
    "# Ranking Trace Inspection V0 Report",
    "",
    `Date: ${date}`,
    "Status: Active R1 research artifact",
    "",
    "## Verdict",
    "",
    analysis.status === "pass_watch"
      ? "No low-rank-quality passed cases were found at the configured threshold. Keep mining harder fixtures before changing retrieval architecture."
      : "Low-rank-quality passed cases are explainable from deterministic trace evidence. Inspect these root causes before adding a reranker, embeddings, or graph memory.",
    "",
    "## Command",
    "",
    "```bash",
    command,
    "```",
    "",
    "## Summary",
    "",
    "```text",
    `total cases: ${analysis.totalCases}`,
    `inspected low-rank cases: ${analysis.inspectedCases}`,
    `ndcg threshold: ${formatNumber(analysis.ndcgThreshold)}`,
    "```",
    "",
    "## Root-Cause Classes",
    "",
    ...formatClassSummary(analysis.classSummary),
    "",
    "## Findings",
    "",
    ...formatFindings(analysis.findings),
    "",
    "## Recommendations",
    "",
    ...analysis.recommendations.map((recommendation) => `- ${recommendation}`),
    "",
  ];
  return `${lines.join("\n").trim()}\n`;
}

export function runRankingTraceInspection({ casesPath, limit, output, json = false, date, ndcgThreshold } = {}) {
  const resolvedCasesPath = resolve(repoRoot, casesPath || "evals/memory-reader-retrieval-cases.json");
  const cases = loadMemoryReaderCases(resolvedCasesPath);
  const summary = runMemoryReaderBenchmark({ cases, limit: Number.isFinite(limit) ? limit : cases.length });
  const analysis = analyzeRankingTracePressure(summary, { ndcgThreshold: Number.isFinite(ndcgThreshold) ? ndcgThreshold : undefined });
  const report = formatRankingTraceInspectionReport(analysis, { date, command: "npm run eval:memory:reader:ranking" });

  if (output) writeFileSync(resolve(repoRoot, output), report);
  if (json) console.log(JSON.stringify({ analysis, summary }, null, 2));
  else console.log(report);
  return { analysis, summary, report };
}

function inspectCase(result) {
  const candidates = result.trace?.candidates || [];
  const selectedIds = result.observed?.retrievedIds || result.trace?.selectedMemoryIds || [];
  const relevance = result.observed?.expectedRelevance || {};
  const selectedCandidates = selectedIds.map((id) => candidates.find((candidate) => candidate.memoryId === id)).filter(Boolean);
  if (selectedCandidates.length === 0) return undefined;

  const selectedWithRelevance = selectedCandidates.map((candidate, index) => ({
    ...candidate,
    rank: index + 1,
    expectedGrade: relevance[candidate.memoryId] || 0,
  }));
  const top = selectedWithRelevance[0];
  const bestExpected = [...selectedWithRelevance].sort((left, right) => right.expectedGrade - left.expectedGrade || right.score - left.score)[0];
  const topHasDuplicateMatchedTags = hasDuplicates(top.matchedTags || []);
  const bestHasDuplicateMatchedTags = hasDuplicates(bestExpected.matchedTags || []);

  return {
    caseId: result.id,
    group: result.group,
    ndcgAt5: result.metrics?.ndcgAt5,
    retrievedIds: selectedIds,
    topSelectedMemoryId: top.memoryId,
    topSelectedGrade: top.expectedGrade,
    topSelectedScore: top.score,
    topSelectedKind: top.kind,
    topSelectedReasons: top.reasons || [],
    topSelectedMatchedTags: top.matchedTags || [],
    bestExpectedMemoryId: bestExpected.memoryId,
    bestExpectedGrade: bestExpected.expectedGrade,
    bestExpectedScore: bestExpected.score,
    bestExpectedKind: bestExpected.kind,
    bestExpectedReasons: bestExpected.reasons || [],
    bestExpectedMatchedTags: bestExpected.matchedTags || [],
    scoreGap: top.score - bestExpected.score,
    classification: classifyRankingCause({ top, bestExpected, topHasDuplicateMatchedTags, bestHasDuplicateMatchedTags }),
  };
}

function classifyRankingCause({ top, bestExpected, topHasDuplicateMatchedTags, bestHasDuplicateMatchedTags }) {
  if (top.expectedGrade >= bestExpected.expectedGrade) return "fixture_grade_accepts_reader_order";
  if (topHasDuplicateMatchedTags || bestHasDuplicateMatchedTags) return "duplicate_tag_inflates_score";
  if ((top.reasons || []).includes("risk_kind_boost")) return "risk_kind_boost_overrides_fixture_relevance";
  if ((top.matchedTags || []).length > (bestExpected.matchedTags || []).length) return "tag_overlap_count_overrides_fixture_relevance";
  if (top.score > bestExpected.score) return "score_formula_overrides_fixture_relevance";
  return "unknown_ranking_pressure";
}

function summarizeClasses(findings) {
  const summary = {};
  for (const finding of findings) {
    summary[finding.classification] ||= { count: 0, caseIds: [] };
    summary[finding.classification].count += 1;
    summary[finding.classification].caseIds.push(finding.caseId);
  }
  return summary;
}

function recommendationsFor(findings) {
  if (findings.length === 0) {
    return [
      "Mine harder ranking fixtures before changing retrieval architecture.",
      "Do not add reranking, embeddings, or graph memory without a concrete low-rank or missed-recall failure class.",
    ];
  }
  const classes = new Set(findings.map((finding) => finding.classification));
  const recommendations = ["Do not add reranking, embeddings, or graph memory yet; the current pressure is explainable by deterministic trace features."];
  if (classes.has("duplicate_tag_inflates_score")) {
    recommendations.push("Normalize duplicate memory tags or fixture tags before changing the scoring model.");
  }
  if (classes.has("risk_kind_boost_overrides_fixture_relevance")) {
    recommendations.push("Decide whether risk-kind boost is intended to outrank fixture relevance; if yes, update fixture relevance grades before changing code.");
  }
  if (classes.has("tag_overlap_count_overrides_fixture_relevance")) {
    recommendations.push("Inspect tag-overlap weighting before adding semantic retrieval.");
  }
  return recommendations;
}

function formatClassSummary(summary) {
  const entries = Object.entries(summary || {}).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) return ["No root-cause classes found."];
  return entries.map(([classification, value]) => `- ${classification}: ${value.count} (${value.caseIds.join(", ")})`);
}

function formatFindings(findings) {
  if (!findings || findings.length === 0) return ["No low-rank-quality passed cases found."];
  return findings.flatMap((finding) => [
    `### ${finding.caseId}`,
    "",
    `- group: ${finding.group}`,
    `- ndcg@5: ${formatNumber(finding.ndcgAt5)}`,
    `- class: ${finding.classification}`,
    `- retrieved order: ${finding.retrievedIds.join(", ")}`,
    `- top selected: ${finding.topSelectedMemoryId} (${finding.topSelectedKind}, grade=${finding.topSelectedGrade}, score=${formatNumber(finding.topSelectedScore)}, matched=${formatList(finding.topSelectedMatchedTags)}, reasons=${formatList(finding.topSelectedReasons)})`,
    `- best expected: ${finding.bestExpectedMemoryId} (${finding.bestExpectedKind}, grade=${finding.bestExpectedGrade}, score=${formatNumber(finding.bestExpectedScore)}, matched=${formatList(finding.bestExpectedMatchedTags)}, reasons=${formatList(finding.bestExpectedReasons)})`,
    `- score gap: ${formatNumber(finding.scoreGap)}`,
    "",
  ]);
}

function hasDuplicates(values) {
  return new Set(values).size !== values.length;
}

function formatList(values) {
  return values && values.length ? values.join("|") : "none";
}

function formatNumber(value) {
  return Number(value || 0).toFixed(3);
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
    parsed[key] = key === "limit" || key === "ndcg-threshold" ? Number(next) : next;
    if (key === "ndcg-threshold") parsed.ndcgThreshold = Number(next);
    index += 1;
  }
  return parsed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRankingTraceInspection(parseArgs(process.argv.slice(2)));
}
