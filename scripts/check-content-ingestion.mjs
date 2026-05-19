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
const baifaPromptPath = join(repoRoot, "prompt/baifa-mapper-v1.md");
const avalokiteshvaraCompassionOsPath = join(repoRoot, "docs/kb/derived/avalokiteshvara-compassion-os.zh.md");
const avalokaV2ResponsePromptPath = join(repoRoot, "prompt/avaloka-v2-orchestrator-response.md");
const avalokaV2CrisisPromptPath = join(repoRoot, "prompt/avaloka-v2-crisis-classifier.md");
const avalokaV2GuardianPromptPath = join(repoRoot, "prompt/avaloka-v2-guardian.md");
const compassionPlannerPromptPath = join(repoRoot, "prompt/avalokiteshvara-compassion-planner-v1.md");
const shadowServerPath = join(repoRoot, "server/llm-shadow-server.mjs");
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
assert(existsSync(baifaPromptPath), "Missing prompt/baifa-mapper-v1.md.");
assert(existsSync(avalokiteshvaraCompassionOsPath), "Missing docs/kb/derived/avalokiteshvara-compassion-os.zh.md.");
assert(existsSync(avalokaV2ResponsePromptPath), "Missing prompt/avaloka-v2-orchestrator-response.md.");
assert(existsSync(avalokaV2CrisisPromptPath), "Missing prompt/avaloka-v2-crisis-classifier.md.");
assert(existsSync(avalokaV2GuardianPromptPath), "Missing prompt/avaloka-v2-guardian.md.");
assert(existsSync(compassionPlannerPromptPath), "Missing prompt/avalokiteshvara-compassion-planner-v1.md.");

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
assert(shadowServer.includes("avalokiteshvaraCompassionPlannerPrompt"), "Shadow server must load the Compassion OS planner prompt.");

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
  `Content ingestion check passed: ${episodeFiles.length} episode notes, ${wisdomCases.length} wisdom eval cases, ${baifaCases.length} Baifa eval cases, ${baifaUnwholesomeCases.length} Baifa unwholesome cases, ${avalokaV2Cases.length} Avaloka V2 cases, ${avalokaV2GoldenCases.length} Avaloka V2 golden cases, ${avalokiteshvaraCases.length} Avalokiteshvara compassion cases.`,
);
