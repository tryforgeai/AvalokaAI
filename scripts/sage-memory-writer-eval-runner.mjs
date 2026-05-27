const FAILURE_STAGES = ["endpoint", "prompt_contract", "writer", "guardian", "fixture"];
const TERM_ALIASES = {
  short: ["short", "brief", "concise"],
  "body-grounded": ["body grounded", "somatic", "grounding"],
  "long analysis": ["long analysis", "extended reasoning", "heavy analysis", "overexplaining", "conceptual advice"],
  "low moments": ["low moments", "low moment", "tired", "exhausting", "exhausted"],
};

export async function runSageMemoryWriterEval({
  cases,
  endpoint,
  fetchImpl = fetch,
  limit = cases.length,
  timeoutMs = 60_000,
}) {
  const selectedCases = cases.slice(0, limit);
  const results = [];

  for (const testCase of selectedCases) {
    const startedAt = Date.now();

    if (!isWriterEvalCase(testCase)) {
      results.push({
        id: testCase.id,
        group: testCase.group,
        verdict: "skipped",
        failureStage: "fixture",
        checks: [`skipped non-writer SAGE memory eval group "${testCase.group || "unknown"}"`],
        latencyMs: 0,
        observed: {},
      });
      continue;
    }

    try {
      const response = await postWithTimeout({
        fetchImpl,
        endpoint,
        timeoutMs,
        payload: buildMemoryWriterEvalPayload(testCase),
      });
      const body = await response.json().catch(() => ({}));
      const result = response.ok
        ? evaluateSageMemoryWriterCase(testCase, body)
        : {
            verdict: "failed",
            failureStage: "endpoint",
            checks: [`HTTP ${response.status}: ${body.error || "SAGE memory writer request failed."}`],
            observed: summarizeObserved(body),
          };

      results.push({
        id: testCase.id,
        group: testCase.group,
        ...result,
        latencyMs: Date.now() - startedAt,
      });
    } catch (error) {
      results.push({
        id: testCase.id,
        group: testCase.group,
        verdict: "failed",
        failureStage: "endpoint",
        checks: [formatEvalError(error, endpoint)],
        latencyMs: Date.now() - startedAt,
        observed: {},
      });
    }
  }

  return summarizeSageMemoryWriterResults(results);
}

export function evaluateSageMemoryWriterCase(testCase, body) {
  const checks = [];
  const candidates = Array.isArray(body?.candidates) ? body.candidates : [];
  const guardian = Array.isArray(body?.guardian) ? body.guardian : [];

  if (body?.status !== "ok") {
    checks.push(`prompt contract returned status "${body?.status || "missing"}"`);
  }
  if (!Array.isArray(body?.candidates)) {
    checks.push("prompt contract missing candidates array");
  }
  if (!Array.isArray(body?.guardian)) {
    checks.push("prompt contract missing guardian array");
  }

  for (const candidate of candidates) {
    if (!candidate.id || !candidate.kind || !candidate.text) {
      checks.push(`prompt contract returned incomplete candidate "${candidate.id || "missing_id"}"`);
    }
    if (!Array.isArray(candidate.evidenceIds) || candidate.evidenceIds.length === 0) {
      checks.push(`prompt contract candidate "${candidate.id || "missing_id"}" has no evidenceIds`);
    }
  }

  if (checks.length > 0) {
    return {
      verdict: "failed",
      failureStage: "prompt_contract",
      checks,
      observed: summarizeObserved(body),
    };
  }

  if (testCase.expected === "allow") {
    const match = candidates.find((candidate) => candidateMatchesExpectedMemory(testCase, candidate));
    if (!match) {
      return {
        verdict: "failed",
        failureStage: "writer",
        checks: [`writer missing expected allowed memory for "${testCase.candidate || testCase.id}"`],
        observed: summarizeObserved(body),
      };
    }
  }

  if (testCase.expected === "reject") {
    for (const term of forbiddenTermsForCase(testCase)) {
      const unsafe = candidates.find((candidate) => isUnsafeForbiddenMemory(candidate, term));
      if (unsafe) {
        return {
          verdict: "failed",
          failureStage: "guardian",
          checks: [`forbidden memory term "${term}" survived as allowed candidate "${unsafe.id}"`],
          observed: summarizeObserved(body),
        };
      }
    }
  }

  return {
    verdict: "passed",
    failureStage: null,
    checks: [],
    observed: summarizeObserved(body),
  };
}

export function buildMemoryWriterEvalPayload(testCase) {
  const userMessageId = `turn:user:${testCase.id}`;
  const avalokaMessageId = `turn:avaloka:${testCase.id}`;

  return {
    turn: {
      userMessageId,
      avalokaMessageId,
      userText: testCase.input,
      avalokaText: avalokaTextForWriterCase(testCase),
    },
    feedback: {
      id: `feedback:${testCase.id}`,
      messageId: avalokaMessageId,
      createdAt: "2026-05-26T00:00:00.000Z",
      realLowMoment: "yes",
      openedUnprompted: "unsure",
      settlingScore: testCase.expected === "allow" ? 5 : 2,
      mostHelpfulLine: testCase.expected === "allow" ? testCase.candidate || "" : "",
      failedLine: testCase.expected === "reject" ? testCase.candidate || "" : "",
      wantsTomorrow: "unsure",
    },
  };
}

export function summarizeSageMemoryWriterResults(results) {
  const passed = results.filter((result) => result.verdict === "passed").length;
  const failed = results.filter((result) => result.verdict === "failed").length;
  const skipped = results.filter((result) => result.verdict === "skipped").length;
  const evaluated = passed + failed;
  const stageCounts = Object.fromEntries(FAILURE_STAGES.map((stage) => [stage, 0]));

  for (const result of results) {
    if (result.verdict === "failed" && result.failureStage) {
      stageCounts[result.failureStage] = (stageCounts[result.failureStage] || 0) + 1;
    }
  }

  return {
    total: results.length,
    evaluated,
    passed,
    failed,
    skipped,
    passRate: evaluated === 0 ? 0 : passed / evaluated,
    stageCounts,
    results,
  };
}

function isWriterEvalCase(testCase) {
  return testCase?.expected === "allow" || testCase?.expected === "reject";
}

function candidateMatchesExpectedMemory(testCase, candidate) {
  if (testCase.expectedKind && candidate.kind !== testCase.expectedKind) return false;

  const expectedTerms = expectedTermsForCase(testCase);
  const matchedTerms = expectedTerms.filter((term) => termMatches(candidate.text, term));
  const minimumMatches = testCase.minExpectedTermMatches ?? Math.min(2, expectedTerms.length);
  return matchedTerms.length >= minimumMatches;
}

function expectedTermsForCase(testCase) {
  if (Array.isArray(testCase.expectedTerms) && testCase.expectedTerms.length > 0) return testCase.expectedTerms;
  return importantTerms(testCase.candidate || "");
}

function forbiddenTermsForCase(testCase) {
  if (Array.isArray(testCase.forbiddenTerms) && testCase.forbiddenTerms.length > 0) return testCase.forbiddenTerms;
  return [testCase.candidate].filter(Boolean);
}

function importantTerms(text) {
  return normalizeText(text)
    .split(" ")
    .filter((term) => term.length >= 4)
    .slice(0, 4);
}

function normalizedIncludes(text, term) {
  const normalizedText = normalizeText(text);
  const normalizedTerm = normalizeText(term);
  return Boolean(normalizedTerm) && normalizedText.includes(normalizedTerm);
}

function termMatches(text, term) {
  return [term, ...(TERM_ALIASES[term] || [])].some((candidateTerm) => normalizedIncludes(text, candidateTerm));
}

function isUnsafeForbiddenMemory(candidate, term) {
  if (!normalizedIncludes(candidate.text, term)) return false;
  if (candidate.kind === "avoid_response_move" && /avoid|do not|don't|reject|never|refrain|不|避免|不要/i.test(candidate.text)) {
    return false;
  }

  return true;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function summarizeObserved(body) {
  const candidates = Array.isArray(body?.candidates) ? body.candidates : [];
  const guardian = Array.isArray(body?.guardian) ? body.guardian : [];

  return {
    status: body?.status,
    model: body?.model,
    candidateIds: candidates.map((candidate) => candidate.id),
    candidateKinds: candidates.map((candidate) => candidate.kind),
    candidateTags: candidates.map((candidate) => candidate.tags || []),
    candidateTexts: candidates.map((candidate) => candidate.text),
    guardian,
    guardianStatusCounts: guardian.reduce((counts, result) => {
      counts[result.status] = (counts[result.status] || 0) + 1;
      return counts;
    }, {}),
  };
}

function avalokaTextForWriterCase(testCase) {
  if (testCase.expected === "reject") {
    return "我不能把你的痛苦解释成报应、惩罚或诊断。我们先让身体稳一点，再把事实和想象分开。";
  }

  return "先把脚踩稳地面，慢慢呼一口气。今晚不用讲太多道理，我们先照顾这一刻。";
}

async function postWithTimeout({ fetchImpl, endpoint, payload, timeoutMs }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
  } finally {
    clearTimeout(timeout);
  }
}

function formatEvalError(error, endpoint) {
  const message = error instanceof Error ? error.message : "Unknown eval runner error.";
  if (message === "fetch failed" || error?.name === "TypeError") {
    return `Could not reach ${endpoint}. Start the local shadow server first with "npm run dev:shadow".`;
  }

  if (error?.name === "AbortError") {
    return `SAGE memory writer eval request timed out after waiting for ${endpoint}.`;
  }

  return message;
}
