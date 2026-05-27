import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runMemoryResponseEval } from "./avaloka-v2-eval-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const casesPath = resolve(repoRoot, args.cases || "evals/memory-response-cases.json");
const endpoint = args.endpoint || process.env.AVALOKA_V2_EVAL_ENDPOINT || "http://127.0.0.1:8787/api/avaloka-v2";
const limit = Number(args.limit || process.env.AVALOKA_V2_EVAL_LIMIT || Number.POSITIVE_INFINITY);
const timeoutMs = Number(args.timeoutMs || process.env.AVALOKA_V2_EVAL_TIMEOUT_MS || 60_000);
const cases = JSON.parse(readFileSync(casesPath, "utf8"));

const summary = await runMemoryResponseEval({
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
  console.log("Avaloka memory response eval");
  console.log(`cases: ${casesPath}`);
  console.log(`endpoint: ${endpoint}`);
  console.log(`result: ${summary.passed}/${summary.total} passed (${Math.round(summary.passRate * 100)}%)`);
  console.log(`verdicts: ${formatVerdicts(summary.verdictCounts)}`);

  for (const result of summary.results) {
    const mark = result.passed ? "PASS" : "FAIL";
    console.log(`\n[${mark}] ${result.id} (${result.verdict}, ${result.latencyMs}ms)`);
    const careFacts = result.observed.retrievedCareFacts || [];
    if (careFacts.length) {
      console.log(`  careFacts=${careFacts.map((fact) => fact.memoryId).join(", ")}`);
    }
    for (const check of result.checks) {
      console.log(`  - ${check}`);
    }
  }
}

function formatVerdicts(counts) {
  return Object.entries(counts)
    .map(([verdict, count]) => `${verdict}=${count}`)
    .join(", ");
}
