import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMemoryClaimGroundingCases, runMemoryClaimGroundingBenchmark } from "./memory-claim-grounding-runner.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = parseArgs(process.argv.slice(2));
const casesPath = resolve(repoRoot, args.cases || "evals/memory-claim-grounding-cases.json");
const limit = Number(args.limit || Number.POSITIVE_INFINITY);
const cases = loadMemoryClaimGroundingCases(casesPath);
const summary = runMemoryClaimGroundingBenchmark({ cases, limit: Number.isFinite(limit) ? limit : cases.length });

if (args.output) {
  writeFileSync(resolve(repoRoot, args.output), JSON.stringify(summary, null, 2));
}

if (args.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  printHumanSummary(summary, { casesPath });
}

if (summary.failed > 0) process.exit(1);

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

function printHumanSummary(summary, { casesPath }) {
  console.log("Avaloka memory claim grounding eval");
  console.log(`cases: ${casesPath}`);
  console.log(`result: ${summary.passed}/${summary.total} passed (${Math.round(summary.passRate * 100)}%)`);
  console.log(`verdicts: pass=${summary.verdictCounts.pass}, warn=${summary.verdictCounts.warn}`);
  console.log(
    `claims: total=${summary.aggregates.claimCount}, supported=${summary.aggregates.supportedClaimCount}, unsupported=${summary.aggregates.unsupportedClaimCount}, rawLeaks=${summary.aggregates.rawLeakCount}`,
  );
  for (const result of summary.results) {
    const mark = result.verdict === "passed" ? "PASS" : "FAIL";
    console.log(`\n[${mark}] ${result.id} (${result.group}, ${result.observed.groundingVerdict})`);
    for (const check of result.checks) console.log(`  - ${check}`);
  }
}
