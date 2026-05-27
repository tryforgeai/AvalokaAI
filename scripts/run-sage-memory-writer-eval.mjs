import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runSageMemoryWriterEval } from "./sage-memory-writer-eval-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const casesPath = resolve(repoRoot, args.cases || "evals/sage-memory-cases.json");
const endpoint = args.endpoint || process.env.SAGE_MEMORY_WRITER_EVAL_ENDPOINT || "http://127.0.0.1:8787/api/sage-memory-writer";
const limit = Number(args.limit || process.env.SAGE_MEMORY_WRITER_EVAL_LIMIT || Number.POSITIVE_INFINITY);
const timeoutMs = Number(args.timeoutMs || process.env.SAGE_MEMORY_WRITER_EVAL_TIMEOUT_MS || 60_000);
const cases = JSON.parse(readFileSync(casesPath, "utf8"));

const summary = await runSageMemoryWriterEval({
  cases,
  endpoint,
  limit: Number.isFinite(limit) ? limit : cases.length,
  timeoutMs,
});

if (args.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary, { casesPath, endpoint });
}

if (summary.failed > 0) {
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

function printHumanSummary(summary, { casesPath, endpoint }) {
  console.log("SAGE memory writer live eval");
  console.log(`cases: ${casesPath}`);
  console.log(`endpoint: ${endpoint}`);
  console.log(`result: ${summary.passed}/${summary.evaluated} evaluated passed (${Math.round(summary.passRate * 100)}%)`);
  if (summary.skipped > 0) console.log(`skipped: ${summary.skipped}`);
  console.log(`failure stages: ${formatCounts(summary.stageCounts)}`);

  for (const result of summary.results) {
    const mark = result.verdict === "passed" ? "PASS" : result.verdict === "skipped" ? "SKIP" : "FAIL";
    console.log(`\n[${mark}] ${result.id} (${result.group || "ungrouped"}, ${result.latencyMs}ms)`);
    const candidateIds = result.observed?.candidateIds || [];
    if (candidateIds.length) {
      console.log(`  candidates=${candidateIds.join(", ")}`);
    }
    for (const check of result.checks) {
      console.log(`  - ${check}`);
    }
  }
}

function formatCounts(counts) {
  return Object.entries(counts)
    .map(([stage, count]) => `${stage}=${count}`)
    .join(", ");
}
