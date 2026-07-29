import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const ts = require(resolve(repoRoot, "app/node_modules/typescript"));
const { evaluateMemoryClaimGrounding } = loadTypeScriptModule(resolve(repoRoot, "app/src/lib/memoryClaimGrounding.ts"));

export function loadMemoryClaimGroundingCases(path = resolve(repoRoot, "evals/memory-claim-grounding-cases.json")) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function runMemoryClaimGroundingBenchmark({ cases, limit = cases.length } = {}) {
  const selectedCases = (cases || []).slice(0, limit);
  const validationErrors = validateMemoryClaimGroundingCases(selectedCases);
  if (validationErrors.length > 0) {
    return {
      total: selectedCases.length,
      passed: 0,
      failed: selectedCases.length,
      passRate: 0,
      validationErrors,
      verdictCounts: emptyVerdictCounts(),
      aggregates: emptyAggregates(),
      results: selectedCases.map((testCase) => ({
        id: testCase.id || "missing_id",
        group: testCase.group || "missing_group",
        verdict: "failed",
        checks: validationErrors,
        metrics: emptyCaseMetrics(),
        observed: { groundingVerdict: "warn", claimCount: 0 },
      })),
    };
  }

  const results = selectedCases.map(evaluateMemoryClaimGroundingCase);
  const passed = results.filter((result) => result.verdict === "passed").length;
  const verdictCounts = emptyVerdictCounts();
  for (const result of results) verdictCounts[result.observed.groundingVerdict] += 1;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    passRate: results.length === 0 ? 0 : passed / results.length,
    verdictCounts,
    aggregates: {
      unsupportedClaimCount: sum(results.map((result) => result.metrics.unsupportedClaimCount)),
      supportedClaimCount: sum(results.map((result) => result.metrics.supportedClaimCount)),
      rawLeakCount: sum(results.map((result) => result.metrics.rawLeakCount)),
      claimCount: sum(results.map((result) => result.metrics.claimCount)),
    },
    results,
  };
}

export function evaluateMemoryClaimGroundingCase(testCase) {
  const grounding = evaluateMemoryClaimGrounding({
    answerText: testCase.answerText,
    retrievedCareFacts: testCase.retrievedCareFacts,
  });
  const serialized = JSON.stringify(grounding);
  const rawLeakCount = (testCase.forbiddenRawText || []).filter((term) => serialized.includes(term)).length;
  const unsupportedClaimCount = grounding.claims.filter((claim) => claim.status === "unsupported").length;
  const supportedClaimCount = grounding.claims.filter((claim) => claim.status === "supported").length;
  const checks = [];

  if (grounding.verdict !== testCase.expectedVerdict) {
    checks.push(`expected verdict ${testCase.expectedVerdict}, got ${grounding.verdict}`);
  }
  if (unsupportedClaimCount !== testCase.expectedUnsupportedCount) {
    checks.push(`expected ${testCase.expectedUnsupportedCount} unsupported claims, got ${unsupportedClaimCount}`);
  }
  if (rawLeakCount > 0) checks.push(`grounding output leaked ${rawLeakCount} forbidden raw text sentinel(s)`);

  return {
    id: testCase.id,
    group: testCase.group,
    verdict: checks.length === 0 ? "passed" : "failed",
    checks,
    metrics: {
      claimCount: grounding.claims.length,
      supportedClaimCount,
      unsupportedClaimCount,
      rawLeakCount,
    },
    observed: {
      groundingVerdict: grounding.verdict,
      claimCount: grounding.claims.length,
      claims: grounding.claims,
    },
  };
}

export function validateMemoryClaimGroundingCases(cases) {
  const errors = [];
  const caseIds = new Set();
  for (const testCase of cases || []) {
    const id = testCase?.id || "missing_id";
    if (!testCase?.id) errors.push("Every memory claim grounding case must include id.");
    if (caseIds.has(testCase?.id)) errors.push(`Duplicate memory claim grounding case id: ${testCase.id}`);
    if (testCase?.id) caseIds.add(testCase.id);
    if (!testCase?.group) errors.push(`Memory claim grounding case ${id} must include group.`);
    if (!testCase?.answerText) errors.push(`Memory claim grounding case ${id} must include answerText.`);
    if (!Array.isArray(testCase?.retrievedCareFacts)) errors.push(`Memory claim grounding case ${id} must include retrievedCareFacts.`);
    if (!["pass", "warn"].includes(testCase?.expectedVerdict)) errors.push(`Memory claim grounding case ${id} must include expectedVerdict pass|warn.`);
    if (!Number.isFinite(testCase?.expectedUnsupportedCount)) errors.push(`Memory claim grounding case ${id} must include expectedUnsupportedCount.`);
    if (!Array.isArray(testCase?.forbiddenRawText)) errors.push(`Memory claim grounding case ${id} must include forbiddenRawText.`);
    if (!testCase?.reason) errors.push(`Memory claim grounding case ${id} must include reason.`);

    for (const fact of testCase?.retrievedCareFacts || []) {
      for (const field of ["memoryId", "kind", "text", "confidence", "tags"]) {
        if (fact[field] === undefined) errors.push(`Memory claim grounding case ${id} fact must include ${field}.`);
      }
      if (!Array.isArray(fact.tags)) errors.push(`Memory claim grounding case ${id} fact tags must be an array.`);
    }
  }
  return errors;
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

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

function emptyVerdictCounts() {
  return { pass: 0, warn: 0 };
}

function emptyCaseMetrics() {
  return { claimCount: 0, supportedClaimCount: 0, unsupportedClaimCount: 0, rawLeakCount: 0 };
}

function emptyAggregates() {
  return { claimCount: 0, supportedClaimCount: 0, unsupportedClaimCount: 0, rawLeakCount: 0 };
}
