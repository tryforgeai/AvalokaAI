import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const podcastDir = join(repoRoot, "docs/kb/secular-buddhism");
const wisdomCasesPath = join(repoRoot, "evals/wisdom-response-cases.json");
const baifaCasesPath = join(repoRoot, "evals/baifa-mapper-cases.json");
const baifaUnwholesomeCasesPath = join(repoRoot, "evals/baifa-unwholesome-cases.json");
const avalokaV2CasesPath = join(repoRoot, "evals/avaloka-v2-orchestrator-cases.json");
const avalokaV2GoldenCasesPath = join(repoRoot, "evals/avaloka-v2-golden-cases.json");
const avalokiteshvaraCasesPath = join(repoRoot, "evals/avalokiteshvara-compassion-cases.json");
const sageMemoryCasesPath = join(repoRoot, "evals/sage-memory-cases.json");
const sageEndToEndCasesPath = join(repoRoot, "evals/sage-end-to-end-cases.json");
const memoryResponseCasesPath = join(repoRoot, "evals/memory-response-cases.json");
const promptRegistryPath = join(repoRoot, "prompt/registry.json");
const kbReadmePath = join(repoRoot, "docs/kb/README.md");
const sageResearchPlanPath = join(repoRoot, "docs/research/sage-memory-research-plan.md");
const memoryEnginePath = join(repoRoot, "docs/engineering/avaloka-memory-engine-v1.md");
const memoryEngineZhPath = join(repoRoot, "docs/engineering/avaloka-memory-engine-v1.zh.md");
const sageKbSourcePath = join(repoRoot, "docs/kb/ai-research/sage-self-evolving-graph-memory.md");
const sageKbSourceZhPath = join(repoRoot, "docs/kb/ai-research/sage-self-evolving-graph-memory.zh.md");
const sageKbDerivedPath = join(repoRoot, "docs/kb/derived/sage-memory-principles.md");
const sageKbDerivedZhPath = join(repoRoot, "docs/kb/derived/sage-memory-principles.zh.md");
const baifaPromptPath = join(repoRoot, "prompt/baifa-mapper-v1.md");
const avalokiteshvaraCompassionOsPath = join(repoRoot, "docs/kb/derived/avalokiteshvara-compassion-os.zh.md");
const avalokaV2ResponsePromptPath = join(repoRoot, "prompt/avaloka-v2-orchestrator-response.md");
const avalokaV2CrisisPromptPath = join(repoRoot, "prompt/avaloka-v2-crisis-classifier.md");
const avalokaV2GuardianPromptPath = join(repoRoot, "prompt/avaloka-v2-guardian.md");
const compassionPlannerPromptPath = join(repoRoot, "prompt/avalokiteshvara-compassion-planner-v1.md");
const shadowServerPath = join(repoRoot, "server/llm-shadow-server.mjs");
const sageMemoryWriterEvalRunnerPath = join(repoRoot, "scripts/sage-memory-writer-eval-runner.mjs");
const sageMemoryWriterEvalScriptPath = join(repoRoot, "scripts/run-sage-memory-writer-eval.mjs");
const memoryInspectorPath = join(repoRoot, "app/src/lib/memoryInspector.ts");
const memoryInspectorTestPath = join(repoRoot, "app/src/lib/memoryInspector.test.ts");
const dukkhaMapPath = join(repoRoot, "app/src/data/dukkhaMap.ts");
const dukkhaMapperTestPath = join(repoRoot, "app/src/lib/dukkhaMapper.test.ts");
const dukkhaResponseTestPath = join(repoRoot, "app/src/lib/dukkhaResponse.test.ts");

const errors = [];

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

assert(existsSync(podcastDir), "Missing docs/kb/secular-buddhism directory.");
assert(existsSync(wisdomCasesPath), "Missing evals/wisdom-response-cases.json.");
assert(existsSync(baifaCasesPath), "Missing evals/baifa-mapper-cases.json.");
assert(existsSync(baifaUnwholesomeCasesPath), "Missing evals/baifa-unwholesome-cases.json.");
assert(existsSync(avalokaV2CasesPath), "Missing evals/avaloka-v2-orchestrator-cases.json.");
assert(existsSync(avalokaV2GoldenCasesPath), "Missing evals/avaloka-v2-golden-cases.json.");
assert(existsSync(avalokiteshvaraCasesPath), "Missing evals/avalokiteshvara-compassion-cases.json.");
assert(existsSync(sageMemoryCasesPath), "Missing evals/sage-memory-cases.json.");
assert(existsSync(sageEndToEndCasesPath), "Missing evals/sage-end-to-end-cases.json.");
assert(existsSync(memoryResponseCasesPath), "Missing evals/memory-response-cases.json.");
assert(existsSync(promptRegistryPath), "Missing prompt/registry.json.");
assert(existsSync(kbReadmePath), "Missing docs/kb/README.md.");
assert(existsSync(sageResearchPlanPath), "Missing docs/research/sage-memory-research-plan.md.");
assert(existsSync(memoryEnginePath), "Missing docs/engineering/avaloka-memory-engine-v1.md.");
assert(existsSync(memoryEngineZhPath), "Missing docs/engineering/avaloka-memory-engine-v1.zh.md.");
assert(existsSync(sageKbSourcePath), "Missing docs/kb/ai-research/sage-self-evolving-graph-memory.md.");
assert(existsSync(sageKbSourceZhPath), "Missing docs/kb/ai-research/sage-self-evolving-graph-memory.zh.md.");
assert(existsSync(sageKbDerivedPath), "Missing docs/kb/derived/sage-memory-principles.md.");
assert(existsSync(sageKbDerivedZhPath), "Missing docs/kb/derived/sage-memory-principles.zh.md.");
assert(existsSync(baifaPromptPath), "Missing prompt/baifa-mapper-v1.md.");
assert(existsSync(avalokiteshvaraCompassionOsPath), "Missing docs/kb/derived/avalokiteshvara-compassion-os.zh.md.");
assert(existsSync(avalokaV2ResponsePromptPath), "Missing prompt/avaloka-v2-orchestrator-response.md.");
assert(existsSync(avalokaV2CrisisPromptPath), "Missing prompt/avaloka-v2-crisis-classifier.md.");
assert(existsSync(avalokaV2GuardianPromptPath), "Missing prompt/avaloka-v2-guardian.md.");
assert(existsSync(compassionPlannerPromptPath), "Missing prompt/avalokiteshvara-compassion-planner-v1.md.");
assert(existsSync(sageMemoryWriterEvalRunnerPath), "Missing scripts/sage-memory-writer-eval-runner.mjs.");
assert(existsSync(sageMemoryWriterEvalScriptPath), "Missing scripts/run-sage-memory-writer-eval.mjs.");
assert(existsSync(memoryInspectorPath), "Missing app/src/lib/memoryInspector.ts.");
assert(existsSync(memoryInspectorTestPath), "Missing app/src/lib/memoryInspector.test.ts.");

const episodeFiles = readdirSync(podcastDir)
  .filter((file) => /^episode-\d{3}-.+\.zh\.md$/.test(file))
  .sort();

assert(episodeFiles.length > 0, "No podcast episode notes found.");

const wisdomCases = JSON.parse(read(wisdomCasesPath));
assert(Array.isArray(wisdomCases), "wisdom-response-cases.json must be an array.");

const baifaPrompt = existsSync(baifaPromptPath) ? read(baifaPromptPath) : "";
const shadowServer = existsSync(shadowServerPath) ? read(shadowServerPath) : "";
const baifaCases = existsSync(baifaCasesPath) ? JSON.parse(read(baifaCasesPath)) : [];
const baifaUnwholesomeCases = existsSync(baifaUnwholesomeCasesPath) ? JSON.parse(read(baifaUnwholesomeCasesPath)) : [];
const avalokaV2Cases = existsSync(avalokaV2CasesPath) ? JSON.parse(read(avalokaV2CasesPath)) : [];
const avalokaV2GoldenCases = existsSync(avalokaV2GoldenCasesPath) ? JSON.parse(read(avalokaV2GoldenCasesPath)) : [];
const avalokiteshvaraCases = existsSync(avalokiteshvaraCasesPath) ? JSON.parse(read(avalokiteshvaraCasesPath)) : [];
const sageMemoryCases = existsSync(sageMemoryCasesPath) ? JSON.parse(read(sageMemoryCasesPath)) : [];
const sageEndToEndCases = existsSync(sageEndToEndCasesPath) ? JSON.parse(read(sageEndToEndCasesPath)) : [];
const memoryResponseCases = existsSync(memoryResponseCasesPath) ? JSON.parse(read(memoryResponseCasesPath)) : [];
const promptRegistry = existsSync(promptRegistryPath) ? JSON.parse(read(promptRegistryPath)) : { prompts: [] };
const sageResearchPlan = existsSync(sageResearchPlanPath) ? read(sageResearchPlanPath) : "";
const memoryEngine = existsSync(memoryEnginePath) ? read(memoryEnginePath) : "";
const memoryEngineZh = existsSync(memoryEngineZhPath) ? read(memoryEngineZhPath) : "";
const sageKbSource = existsSync(sageKbSourcePath) ? read(sageKbSourcePath) : "";
const sageKbSourceZh = existsSync(sageKbSourceZhPath) ? read(sageKbSourceZhPath) : "";
const sageKbDerived = existsSync(sageKbDerivedPath) ? read(sageKbDerivedPath) : "";
const sageKbDerivedZh = existsSync(sageKbDerivedZhPath) ? read(sageKbDerivedZhPath) : "";
assert(Array.isArray(baifaCases), "baifa-mapper-cases.json must be an array.");
assert(baifaCases.length >= 8, "baifa-mapper-cases.json must include at least 8 cases.");
assert(Array.isArray(baifaUnwholesomeCases), "baifa-unwholesome-cases.json must be an array.");
assert(baifaUnwholesomeCases.length >= 20, "baifa-unwholesome-cases.json must include at least 20 cases.");
assert(Array.isArray(avalokaV2Cases), "avaloka-v2-orchestrator-cases.json must be an array.");
assert(avalokaV2Cases.length >= 8, "avaloka-v2-orchestrator-cases.json must include at least 8 cases.");
assert(Array.isArray(avalokaV2GoldenCases), "avaloka-v2-golden-cases.json must be an array.");
assert(avalokaV2GoldenCases.length >= 20, "avaloka-v2-golden-cases.json must include at least 20 cases.");
assert(Array.isArray(avalokiteshvaraCases), "avalokiteshvara-compassion-cases.json must be an array.");
assert(avalokiteshvaraCases.length >= 8, "avalokiteshvara-compassion-cases.json must include at least 8 cases.");
assert(Array.isArray(sageMemoryCases), "sage-memory-cases.json must be an array.");
assert(sageMemoryCases.length >= 5, "sage-memory-cases.json must include at least 5 cases.");
assert(Array.isArray(sageEndToEndCases), "sage-end-to-end-cases.json must be an array.");
assert(sageEndToEndCases.length >= 2, "sage-end-to-end-cases.json must include at least 2 cases.");
assert(Array.isArray(memoryResponseCases), "memory-response-cases.json must be an array.");
assert(memoryResponseCases.length >= 6, "memory-response-cases.json must include at least 6 cases.");
assert(Array.isArray(promptRegistry.prompts), "prompt/registry.json must include a prompts array.");

for (const term of ["SAGE Lite", "Memory Writer", "Memory Guardian", "Memory Reader", "eval"]) {
  assert(sageResearchPlan.includes(term), `sage-memory-research-plan.md must include "${term}".`);
  assert(memoryEngine.includes(term), `avaloka-memory-engine-v1.md must include "${term}".`);
  assert(sageKbSource.includes(term), `sage-self-evolving-graph-memory.md must include "${term}".`);
  assert(sageKbDerived.includes(term), `sage-memory-principles.md must include "${term}".`);
  assert(sageKbSourceZh.includes(term), `sage-self-evolving-graph-memory.zh.md must include "${term}".`);
  assert(sageKbDerivedZh.includes(term), `sage-memory-principles.zh.md must include "${term}".`);
}
for (const term of ["SAGE Lite", "Memory Writer", "Memory Guardian", "Memory Reader", "eval"]) {
  assert(memoryEngineZh.includes(term), `avaloka-memory-engine-v1.zh.md must include "${term}".`);
}

const allMindStates = [
  "作意",
  "触",
  "受",
  "想",
  "思",
  "欲",
  "胜解",
  "念",
  "定",
  "慧",
  "信",
  "精进",
  "惭",
  "愧",
  "无贪",
  "无瞋",
  "无痴",
  "轻安",
  "不放逸",
  "行舍",
  "不害",
  "贪",
  "瞋",
  "慢",
  "无明",
  "疑",
  "不正见",
  "忿",
  "恨",
  "恼",
  "覆",
  "诳",
  "谄",
  "憍",
  "害",
  "嫉",
  "悭",
  "无惭",
  "无愧",
  "不信",
  "懈怠",
  "放逸",
  "昏沉",
  "掉举",
  "失念",
  "不正知",
  "散乱",
  "睡眠",
  "恶作",
  "寻",
  "伺",
];
const wholesomeMindStates = ["信", "精进", "惭", "愧", "无贪", "无瞋", "无痴", "轻安", "不放逸", "行舍", "不害"];
const rootAfflictions = ["贪", "瞋", "慢", "无明", "疑", "不正见"];
const coreSecondaryAfflictions = [
  "忿",
  "恨",
  "恼",
  "覆",
  "诳",
  "谄",
  "害",
  "嫉",
  "悭",
  "无惭",
  "无愧",
  "不信",
  "懈怠",
  "放逸",
  "昏沉",
  "掉举",
  "失念",
  "不正知",
  "散乱",
];
const indeterminateMindStates = ["睡眠", "恶作", "寻", "伺"];

const requiredBaifaPromptTerms = [
  "遍行五",
  "别境五",
  "善十一",
  "烦恼六",
  "随烦恼二十",
  "不定四",
  "不正见 has five",
  "Do not use Five Precepts or Ten Wholesome Actions as the classification taxonomy",
];

for (const term of requiredBaifaPromptTerms) {
  assert(baifaPrompt.includes(term), `baifa-mapper-v1.md must include "${term}".`);
}

const avalokaV2PromptBundle = [
  existsSync(avalokaV2ResponsePromptPath) ? read(avalokaV2ResponsePromptPath) : "",
  existsSync(avalokaV2CrisisPromptPath) ? read(avalokaV2CrisisPromptPath) : "",
  existsSync(avalokaV2GuardianPromptPath) ? read(avalokaV2GuardianPromptPath) : "",
].join("\n");
for (const term of ["karma", "crisis", "guardian", "Baifa", "JSON"]) {
  assert(avalokaV2PromptBundle.includes(term), `Avaloka V2 prompts must include "${term}".`);
}

const avalokiteshvaraCompassionOs = existsSync(avalokiteshvaraCompassionOsPath) ? read(avalokiteshvaraCompassionOsPath) : "";
for (const term of ["闻声救苦", "施无畏", "随类应化", "Do not role-play Guanyin", "Crisis Response Guidance"]) {
  assert(avalokiteshvaraCompassionOs.includes(term), `avalokiteshvara-compassion-os.zh.md must include "${term}".`);
}

const compassionPlannerPrompt = existsSync(compassionPlannerPromptPath) ? read(compassionPlannerPromptPath) : "";
const compassionMoveIds = [
  "hear_the_cry_first",
  "give_fearlessness_first",
  "adapt_to_capacity",
  "do_not_abandon",
  "compassion_with_boundary",
  "not_whole_self",
  "return_from_story_to_step",
  "protect_before_practice",
];
for (const move of compassionMoveIds) {
  assert(compassionPlannerPrompt.includes(move), `Compassion planner prompt must include move "${move}".`);
  assert(shadowServer.includes(`"${move}"`), `Compassion planner JSON schema must constrain move enum with "${move}".`);
}
for (const term of ["Do not role-play Guanyin", "Return JSON only", "Do not invent new move ids"]) {
  assert(compassionPlannerPrompt.includes(term), `Compassion planner prompt must include "${term}".`);
}
assert(shadowServer.includes("createPromptRuntime"), "Shadow server must use the prompt runtime.");
assert(shadowServer.includes("avalokiteshvara-compassion-planner-v1"), "Shadow server must reference the Compassion OS planner prompt id.");

const promptIds = new Set();
for (const record of promptRegistry.prompts) {
  assert(record.id, "Every prompt registry record must include id.");
  assert(!promptIds.has(record.id), `Duplicate prompt registry id: ${record.id}`);
  promptIds.add(record.id);
  assert(record.file, `Prompt registry record ${record.id} must include file.`);
  assert(["active", "draft", "archived"].includes(record.status), `Prompt registry record ${record.id} has invalid status.`);
  assert(record.purpose, `Prompt registry record ${record.id} must include purpose.`);
  assert(record.version, `Prompt registry record ${record.id} must include version.`);
  assert(record.rollback, `Prompt registry record ${record.id} must include rollback.`);
  assert(Array.isArray(record.usedBy), `Prompt registry record ${record.id} must include usedBy.`);
  assert(Array.isArray(record.evals), `Prompt registry record ${record.id} must include evals.`);
  assert(
    record.knowledgeSources === undefined || Array.isArray(record.knowledgeSources),
    `Prompt registry record ${record.id} knowledgeSources must be an array when present.`,
  );
  assert(existsSync(join(repoRoot, record.file)), `Prompt registry record ${record.id} points to missing file ${record.file}.`);
  for (const evalPath of record.evals) {
    assert(existsSync(join(repoRoot, evalPath)), `Prompt registry record ${record.id} points to missing eval ${evalPath}.`);
  }
  for (const sourcePath of record.knowledgeSources || []) {
    assert(
      existsSync(join(repoRoot, sourcePath)),
      `Prompt registry record ${record.id} points to missing knowledge source ${sourcePath}.`,
    );
  }
  if (record.status === "active") {
    assert(record.usedBy.length > 0, `Active prompt ${record.id} must include at least one usedBy entry.`);
    assert(record.evals.length > 0, `Active prompt ${record.id} must include at least one eval.`);
    assert(shadowServer.includes(record.id), `Active prompt ${record.id} must be referenced by the shadow server runtime.`);
  }
}

for (const id of [
  "llm-shadow-response-generator-v1",
  "baifa-mapper-v1",
  "avaloka-v2-crisis-classifier",
  "avalokiteshvara-compassion-planner-v1",
  "avaloka-v2-orchestrator-response",
  "avaloka-v2-guardian",
]) {
  assert(promptIds.has(id), `prompt/registry.json must include prompt id "${id}".`);
}

for (const mindState of allMindStates) {
  assert(shadowServer.includes(`"${mindState}"`), `Baifa JSON schema must constrain mindState enum with "${mindState}".`);
}
for (const mindState of wholesomeMindStates) {
  assert(
    shadowServer.includes(`"${mindState}"`),
    `Baifa JSON schema must constrain wholesomeAntidotes enum with "${mindState}".`,
  );
}

const caseIds = new Set();
for (const testCase of wisdomCases) {
  assert(testCase.id, "Every wisdom eval case must have an id.");
  assert(!caseIds.has(testCase.id), `Duplicate wisdom eval case id: ${testCase.id}`);
  caseIds.add(testCase.id);
  assert(testCase.user_input, `Wisdom eval case ${testCase.id} is missing user_input.`);
  assert(Array.isArray(testCase.expected_principles), `Wisdom eval case ${testCase.id} must include expected_principles.`);
  assert(Array.isArray(testCase.must_do), `Wisdom eval case ${testCase.id} must include must_do.`);
  assert(Array.isArray(testCase.must_not), `Wisdom eval case ${testCase.id} must include must_not.`);
}

const baifaCaseIds = new Set();
for (const testCase of baifaCases) {
  assert(testCase.id, "Every Baifa eval case must have an id.");
  assert(!baifaCaseIds.has(testCase.id), `Duplicate Baifa eval case id: ${testCase.id}`);
  baifaCaseIds.add(testCase.id);
  assert(testCase.user_input, `Baifa eval case ${testCase.id} is missing user_input.`);
  assert(
    Array.isArray(testCase.expected_primary_mind_states),
    `Baifa eval case ${testCase.id} must include expected_primary_mind_states.`,
  );
  assert(
    Array.isArray(testCase.expected_secondary_or_indeterminate),
    `Baifa eval case ${testCase.id} must include expected_secondary_or_indeterminate.`,
  );
  assert(Array.isArray(testCase.expected_antidotes), `Baifa eval case ${testCase.id} must include expected_antidotes.`);
  assert(Array.isArray(testCase.must_do), `Baifa eval case ${testCase.id} must include must_do.`);
  assert(Array.isArray(testCase.must_not), `Baifa eval case ${testCase.id} must include must_not.`);
}

const unwholesomeCoverageTags = new Set();
for (const testCase of baifaUnwholesomeCases) {
  assert(testCase.id, "Every Baifa unwholesome eval case must have an id.");
  assert(testCase.user_input, `Baifa unwholesome eval case ${testCase.id} is missing user_input.`);
  assert(
    Array.isArray(testCase.expected_mind_states),
    `Baifa unwholesome eval case ${testCase.id} must include expected_mind_states.`,
  );
  assert(
    Array.isArray(testCase.expected_antidotes),
    `Baifa unwholesome eval case ${testCase.id} must include expected_antidotes.`,
  );
  assert(Array.isArray(testCase.coverage_tags), `Baifa unwholesome eval case ${testCase.id} must include coverage_tags.`);
  for (const mindState of testCase.expected_mind_states) {
    assert(allMindStates.includes(mindState), `Baifa unwholesome case ${testCase.id} uses unknown mind state "${mindState}".`);
  }
  for (const antidote of testCase.expected_antidotes) {
    assert(
      wholesomeMindStates.includes(antidote),
      `Baifa unwholesome case ${testCase.id} uses non-wholesome antidote "${antidote}".`,
    );
  }
  for (const tag of testCase.coverage_tags) {
    unwholesomeCoverageTags.add(tag);
  }
}

for (const state of rootAfflictions) {
  assert(unwholesomeCoverageTags.has(`烦恼六:${state}`), `Baifa unwholesome evals must cover root affliction "${state}".`);
}
for (const state of coreSecondaryAfflictions) {
  assert(
    unwholesomeCoverageTags.has(`随烦恼二十:${state}`),
    `Baifa unwholesome evals must cover core secondary affliction "${state}".`,
  );
}
for (const state of indeterminateMindStates) {
  assert(unwholesomeCoverageTags.has(`不定四:${state}`), `Baifa unwholesome evals must cover indeterminate state "${state}".`);
}

const v2ExpectedStatuses = new Set();
for (const testCase of avalokaV2Cases) {
  assert(testCase.id, "Every Avaloka V2 eval case must have an id.");
  assert(testCase.user_input, `Avaloka V2 eval case ${testCase.id} is missing user_input.`);
  assert(["safe", "ambiguous", "crisis"].includes(testCase.expected_crisis), `Avaloka V2 case ${testCase.id} has invalid expected_crisis.`);
  assert(Array.isArray(testCase.expected_mind_states), `Avaloka V2 case ${testCase.id} must include expected_mind_states.`);
  assert(Array.isArray(testCase.must_do), `Avaloka V2 case ${testCase.id} must include must_do.`);
  assert(Array.isArray(testCase.must_not), `Avaloka V2 case ${testCase.id} must include must_not.`);
  for (const mindState of testCase.expected_mind_states) {
    assert(allMindStates.includes(mindState), `Avaloka V2 case ${testCase.id} uses unknown mind state "${mindState}".`);
  }
  v2ExpectedStatuses.add(testCase.expected_crisis);
}
for (const status of ["safe", "ambiguous", "crisis"]) {
  assert(v2ExpectedStatuses.has(status), `Avaloka V2 evals must include expected_crisis "${status}".`);
}

const severityOrder = ["pass", "warn", "revise", "block"];
const goldenExpectedStatuses = new Set();
const goldenMoveCoverage = new Set();
const goldenCaseIds = new Set();
for (const testCase of avalokaV2GoldenCases) {
  assert(testCase.id, "Every Avaloka V2 golden case must have an id.");
  assert(!goldenCaseIds.has(testCase.id), `Duplicate Avaloka V2 golden case id: ${testCase.id}`);
  goldenCaseIds.add(testCase.id);
  assert(testCase.user_input, `Avaloka V2 golden case ${testCase.id} is missing user_input.`);
  assert(
    ["safe", "ambiguous", "crisis"].includes(testCase.expected_crisis),
    `Avaloka V2 golden case ${testCase.id} has invalid expected_crisis.`,
  );
  assert(Array.isArray(testCase.expected_mind_states), `Avaloka V2 golden case ${testCase.id} must include expected_mind_states.`);
  assert(
    Array.isArray(testCase.expected_compassion_moves),
    `Avaloka V2 golden case ${testCase.id} must include expected_compassion_moves.`,
  );
  assert(Array.isArray(testCase.forbidden_terms), `Avaloka V2 golden case ${testCase.id} must include forbidden_terms.`);
  assert(
    severityOrder.includes(testCase.max_guardian_severity),
    `Avaloka V2 golden case ${testCase.id} has invalid max_guardian_severity.`,
  );
  for (const mindState of testCase.expected_mind_states) {
    assert(allMindStates.includes(mindState), `Avaloka V2 golden case ${testCase.id} uses unknown mind state "${mindState}".`);
  }
  for (const move of testCase.expected_compassion_moves) {
    assert(compassionMoveIds.includes(move), `Avaloka V2 golden case ${testCase.id} uses unknown compassion move "${move}".`);
    goldenMoveCoverage.add(move);
  }
  goldenExpectedStatuses.add(testCase.expected_crisis);
}
for (const status of ["safe", "ambiguous", "crisis"]) {
  assert(goldenExpectedStatuses.has(status), `Avaloka V2 golden cases must include expected_crisis "${status}".`);
}
for (const move of ["give_fearlessness_first", "compassion_with_boundary", "protect_before_practice", "not_whole_self"]) {
  assert(goldenMoveCoverage.has(move), `Avaloka V2 golden cases must cover compassion move "${move}".`);
}

const avalokiteshvaraMoveCoverage = new Set();
for (const testCase of avalokiteshvaraCases) {
  assert(testCase.id, "Every Avalokiteshvara compassion eval case must have an id.");
  assert(testCase.user_input, `Avalokiteshvara compassion case ${testCase.id} is missing user_input.`);
  assert(Array.isArray(testCase.expected_moves), `Avalokiteshvara compassion case ${testCase.id} must include expected_moves.`);
  assert(Array.isArray(testCase.must_do), `Avalokiteshvara compassion case ${testCase.id} must include must_do.`);
  assert(Array.isArray(testCase.must_not), `Avalokiteshvara compassion case ${testCase.id} must include must_not.`);
  for (const move of testCase.expected_moves) {
    avalokiteshvaraMoveCoverage.add(move);
  }
}
for (const move of ["hear_the_cry_first", "give_fearlessness_first", "compassion_with_boundary", "protect_before_practice"]) {
  assert(avalokiteshvaraMoveCoverage.has(move), `Avalokiteshvara compassion evals must cover "${move}".`);
}

const sageMemoryGroups = new Set();
const sageMemoryExpected = new Set();
const sageMemoryCaseIds = new Set();
for (const testCase of sageMemoryCases) {
  assert(testCase.id, "Every SAGE memory eval case must have an id.");
  assert(!sageMemoryCaseIds.has(testCase.id), `Duplicate SAGE memory eval case id: ${testCase.id}`);
  sageMemoryCaseIds.add(testCase.id);
  assert(testCase.group, `SAGE memory eval case ${testCase.id} must include group.`);
  assert(testCase.input, `SAGE memory eval case ${testCase.id} must include input.`);
  assert(testCase.reason, `SAGE memory eval case ${testCase.id} must include reason.`);
  sageMemoryGroups.add(testCase.group);
  if (testCase.expected) sageMemoryExpected.add(testCase.expected);
  if (testCase.expected === "allow") {
    assert(testCase.expectedKind, `SAGE memory allow case ${testCase.id} must include expectedKind.`);
    assert(
      Array.isArray(testCase.expectedTerms) && testCase.expectedTerms.length > 0,
      `SAGE memory allow case ${testCase.id} must include expectedTerms.`,
    );
  }
  if (testCase.expected === "reject") {
    assert(
      Array.isArray(testCase.forbiddenTerms) && testCase.forbiddenTerms.length > 0,
      `SAGE memory reject case ${testCase.id} must include forbiddenTerms.`,
    );
  }
  if (testCase.expectedFacts) {
    assert(Array.isArray(testCase.expectedFacts), `SAGE memory eval case ${testCase.id} expectedFacts must be an array.`);
  }
}
for (const group of ["extraction", "rejection", "retrieval"]) {
  assert(sageMemoryGroups.has(group), `SAGE memory evals must include group "${group}".`);
}
for (const expected of ["allow", "reject"]) {
  assert(sageMemoryExpected.has(expected), `SAGE memory evals must include expected "${expected}".`);
}

const sageEndToEndGroups = new Set();
const sageEndToEndCaseIds = new Set();
let sageEndToEndHasRejection = false;
let sageEndToEndHasStoreExpectation = false;
for (const testCase of sageEndToEndCases) {
  assert(testCase.id, "Every SAGE end-to-end eval case must have an id.");
  assert(!sageEndToEndCaseIds.has(testCase.id), `Duplicate SAGE end-to-end eval case id: ${testCase.id}`);
  sageEndToEndCaseIds.add(testCase.id);
  assert(testCase.group, `SAGE end-to-end eval case ${testCase.id} must include group.`);
  assert(testCase.now, `SAGE end-to-end eval case ${testCase.id} must include now.`);
  assert(
    Array.isArray(testCase.writerCandidates),
    `SAGE end-to-end eval case ${testCase.id} must include writerCandidates.`,
  );
  assert(testCase.retrievalContext, `SAGE end-to-end eval case ${testCase.id} must include retrievalContext.`);
  assert(
    Array.isArray(testCase.expectedRetrievedIds),
    `SAGE end-to-end eval case ${testCase.id} must include expectedRetrievedIds.`,
  );
  assert(testCase.reason, `SAGE end-to-end eval case ${testCase.id} must include reason.`);
  if (testCase.expectedRejectedIds) {
    assert(
      Array.isArray(testCase.expectedRejectedIds),
      `SAGE end-to-end eval case ${testCase.id} expectedRejectedIds must be an array.`,
    );
    sageEndToEndHasRejection ||= testCase.expectedRejectedIds.length > 0;
  }
  if (testCase.expectedSavedIds) {
    assert(
      Array.isArray(testCase.expectedSavedIds),
      `SAGE end-to-end eval case ${testCase.id} expectedSavedIds must be an array.`,
    );
    sageEndToEndHasStoreExpectation ||= testCase.expectedSavedIds.length > 0;
  }
  sageEndToEndGroups.add(testCase.group);
}
for (const group of ["self_blame", "illness_fear"]) {
  assert(sageEndToEndGroups.has(group), `SAGE end-to-end evals must include group "${group}".`);
}
assert(sageEndToEndHasRejection, "SAGE end-to-end evals must verify at least one rejected writer candidate.");
assert(sageEndToEndHasStoreExpectation, "SAGE end-to-end evals must verify at least one saved writer candidate.");

const memoryResponseGroups = new Set();
const memoryResponseUses = new Set();
const memoryResponseCaseIds = new Set();
for (const testCase of memoryResponseCases) {
  assert(testCase.id, "Every memory response eval case must have an id.");
  assert(!memoryResponseCaseIds.has(testCase.id), `Duplicate memory response eval case id: ${testCase.id}`);
  memoryResponseCaseIds.add(testCase.id);
  assert(testCase.group, `Memory response eval case ${testCase.id} must include group.`);
  assert(testCase.user_input, `Memory response eval case ${testCase.id} must include user_input.`);
  assert(Array.isArray(testCase.retrievedCareFacts), `Memory response eval case ${testCase.id} must include retrievedCareFacts.`);
  assert(["use", "ignore"].includes(testCase.expected_use), `Memory response eval case ${testCase.id} must include expected_use.`);
  assert(Array.isArray(testCase.expected_with_terms), `Memory response eval case ${testCase.id} must include expected_with_terms.`);
  assert(Array.isArray(testCase.forbidden_terms), `Memory response eval case ${testCase.id} must include forbidden_terms.`);
  assert(testCase.reason, `Memory response eval case ${testCase.id} must include reason.`);
  memoryResponseGroups.add(testCase.group);
  memoryResponseUses.add(testCase.expected_use);
}
for (const group of ["self_blame", "illness_fear", "aging_fear", "tone_preference", "no_match", "stale_memory"]) {
  assert(memoryResponseGroups.has(group), `Memory response evals must include group "${group}".`);
}
for (const expectedUse of ["use", "ignore"]) {
  assert(memoryResponseUses.has(expectedUse), `Memory response evals must include expected_use "${expectedUse}".`);
}

const dukkhaMap = existsSync(dukkhaMapPath) ? read(dukkhaMapPath) : "";
const mapperTest = existsSync(dukkhaMapperTestPath) ? read(dukkhaMapperTestPath) : "";
const responseTest = existsSync(dukkhaResponseTestPath) ? read(dukkhaResponseTestPath) : "";
const runtimeText = `${dukkhaMap}\n${mapperTest}\n${responseTest}`;

for (const file of episodeFiles) {
  const path = join(podcastDir, file);
  const content = read(path);
  const episodeMatch = file.match(/^episode-(\d{3})-/);
  const episodeNumber = episodeMatch?.[1];
  const lowerContent = content.toLowerCase();

  assert(content.includes("来源") || content.includes("Source"), `${file} must include a source reference.`);
  assert(content.includes("Core Insight") || content.includes("核心洞见"), `${file} must include Core Insight.`);
  assert(content.includes("Avaloka Translation") || content.includes("Avaloka 用户侧") || content.includes("产品化"), `${file} must include Avaloka translation.`);
  assert(content.includes("Response Moves") || content.includes("回应策略"), `${file} must include response moves or strategy.`);
  assert(content.includes("Do Not Say") || content.includes("不应该") || content.includes("禁止"), `${file} must include unsafe language guidance.`);
  assert(content.includes("Eval Seed") || content.includes("Eval") || content.includes("测试"), `${file} must include eval seeds or test guidance.`);
  assert(
    !lowerContent.includes("## full transcript") && !lowerContent.includes("# full transcript"),
    `${file} should not store full transcript content.`,
  );

  const moveMatches = [...content.matchAll(/\|\s*([a-z][a-z0-9_]+)\s*\|/g)]
    .map((match) => match[1])
    .filter((move) => !["move"].includes(move));

  const promotedMoveSection = content.match(/Runtime Promoted Moves:\s*([^\n]+)/i);
  if (promotedMoveSection) {
    const promotedMoves = promotedMoveSection[1]
      .split(",")
      .map((move) => move.trim())
      .filter(Boolean);

    for (const move of promotedMoves) {
      assert(moveMatches.includes(move) || content.includes(move), `${file} marks unknown promoted move "${move}".`);
      assert(runtimeText.includes(move), `${file} promotes "${move}" but runtime/tests do not include it.`);
    }
  }

  if (episodeNumber && Number(episodeNumber) >= 3) {
    const hasNearbyWisdomCase = [...caseIds].some((id) => id.includes(`_${Number(episodeNumber).toString().padStart(3, "0")}_`));
    const hasAnyCaseAfterBaseline = wisdomCases.length >= episodeFiles.length;
    assert(
      hasNearbyWisdomCase || hasAnyCaseAfterBaseline,
      `${file} appears to lack a corresponding wisdom eval case.`,
    );
  }
}

if (errors.length > 0) {
  console.error("Content ingestion check failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Content ingestion check passed: ${episodeFiles.length} episode notes, ${wisdomCases.length} wisdom eval cases, ${baifaCases.length} Baifa eval cases, ${baifaUnwholesomeCases.length} Baifa unwholesome cases, ${avalokaV2Cases.length} Avaloka V2 cases, ${avalokaV2GoldenCases.length} Avaloka V2 golden cases, ${avalokiteshvaraCases.length} Avalokiteshvara compassion cases, ${sageMemoryCases.length} SAGE memory cases, ${sageEndToEndCases.length} SAGE end-to-end cases, ${memoryResponseCases.length} memory response cases.`,
);
