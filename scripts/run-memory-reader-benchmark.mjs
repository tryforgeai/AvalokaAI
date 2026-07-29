import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMemoryReaderCases, runMemoryReaderBenchmark } from "./memory-reader-benchmark-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const casesPath = resolve(repoRoot, args.cases || "evals/memory-reader-retrieval-cases.json");
const limit = Number(args.limit || Number.POSITIVE_INFINITY);
const cases = loadMemoryReaderCases(casesPath);

const summary = runMemoryReaderBenchmark({
  cases,
  limit: Number.isFinite(limit) ? limit : cases.length,
});

if (args.output) {
  writeFileSync(resolve(repoRoot, args.output), JSON.stringify(summary, null, 2));
}

if (args.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary, { casesPath, output: args.output });
}

if (summary.validationErrors?.length || summary.failed > 0) {
  process.exit(1);
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

    parsed[key] = values[index + 1];
    index += 1;
  }
  return parsed;
}

function printHumanSummary(summary, { casesPath, output }) {
  console.log("Avaloka memory reader benchmark");
  console.log(`cases: ${casesPath}`);
  if (output) console.log(`output: ${output}`);
  if (summary.validationErrors?.length) {
    console.log("validation errors:");
    for (const error of summary.validationErrors) console.log(`  - ${error}`);
  }

  console.log(`result: ${summary.passed}/${summary.total} passed (${Math.round(summary.passRate * 100)}%)`);
  console.log(
    `aggregate: recall@3=${format(summary.aggregates.recallAt3)}, recall@5=${format(summary.aggregates.recallAt5)}, mrr=${format(summary.aggregates.mrr)}, ndcg@5=${format(summary.aggregates.ndcgAt5)}, no-match=${format(summary.aggregates.noMatchPrecision)}`,
  );
  console.log(
    `leaks: unsafe=${summary.aggregates.unsafeRetrievalCount}, stale=${summary.aggregates.staleRetrievalCount}, deleted=${summary.aggregates.deletedRetrievalCount}, superseded=${summary.aggregates.supersededRetrievalCount}`,
  );
  console.log(
    `latency: p50=${summary.aggregates.p50LatencyMs.toFixed(3)}ms, p95=${summary.aggregates.p95LatencyMs.toFixed(3)}ms`,
  );
  console.log(`failure taxonomy: ${formatCounts(summary.failureTaxonomy)}`);

  for (const result of summary.results) {
    const mark = result.verdict === "passed" ? "PASS" : "FAIL";
    console.log(`\n[${mark}] ${result.id} (${result.group}, ${result.failureReason}, ${result.metrics.latencyMs.toFixed(3)}ms)`);
    console.log(`  retrieved=${result.observed.retrievedIds.length ? result.observed.retrievedIds.join(", ") : "none"}`);
    console.log(
      `  recall@3=${format(result.metrics.recallAt3)}, recall@5=${format(result.metrics.recallAt5)}, rr=${format(result.metrics.reciprocalRank)}, ndcg@5=${format(result.metrics.ndcgAt5)}`,
    );
    for (const check of result.checks) console.log(`  - ${check}`);
  }
}

function format(value) {
  return Number(value).toFixed(3);
}

function formatCounts(counts) {
  return Object.entries(counts)
    .map(([key, count]) => `${key}=${count}`)
    .join(", ");
}
