import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createOpenAIClient, extractOutputText } from "./openai-client.mjs";
import { createPromptRuntime } from "./prompt-runtime.mjs";
import { DEFAULT_MAX_JSON_BODY_BYTES, PayloadTooLargeError, readJson } from "./request-body.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadDotEnv(resolve(root, "server/.env"));

const promptRuntime = createPromptRuntime({ root });
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_SHADOW_MODEL || "gpt-5.2";
const openAIRequestTimeoutMs = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || 20_000);
const openAIMaxRetries = Number(process.env.OPENAI_MAX_RETRIES || 1);
const openAIMaxConcurrentRequests = Number(process.env.OPENAI_MAX_CONCURRENT_REQUESTS || 3);
const openAIMaxRequestsPerMinute = Number(process.env.OPENAI_MAX_REQUESTS_PER_MINUTE || 120);
const maxJsonBodyBytes = Number(process.env.AVALOKA_MAX_JSON_BODY_BYTES || DEFAULT_MAX_JSON_BODY_BYTES);
const openAIClient = createOpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
  model,
  timeoutMs: openAIRequestTimeoutMs,
  maxRetries: openAIMaxRetries,
  maxConcurrentRequests: openAIMaxConcurrentRequests,
  maxRequestsPerMinute: openAIMaxRequestsPerMinute,
});
const baifaCategories = ["遍行心所", "别境心所", "善心所", "烦恼心所", "随烦恼心所", "不定心所"];
const baifaMindStates = [
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
const memoryCandidateKinds = [
  "recurring_pain_pattern",
  "helpful_response_move",
  "avoid_response_move",
  "tone_preference",
  "safety_note",
  "context_category",
];
const memoryGuardianRules = [
  {
    reason: "raw_or_private_detail",
    patterns: [
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/,
      /\b1[3-9]\d{9}\b/,
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
      /\b\d{3}-\d{2}-\d{4}\b/,
      /\b(?:wechat|weixin|微信|身份证|护照|passport|ssn)\b/i,
      /\b\d{1,6}\s+[A-Z][A-Za-z0-9'.-]*(?:\s+[A-Z][A-Za-z0-9'.-]*){0,4}\s+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd)\b/i,
      /住在.{0,24}(街|路|号|弄|栋|单元|室|apartment|公寓)/i,
    ],
  },
  {
    reason: "medical_or_spiritual_claim",
    patterns: [
      /\b(?:user|she|he|they) (?:has|is diagnosed with|suffers from) (?:cancer|depression|ptsd|bipolar|ocd|adhd|anxiety disorder)\b/i,
      /\b(?:diagnosed|medical diagnosis|clinical diagnosis|terminal illness)\b/i,
      /\b(?:karmically guilty|karmic debt|spiritual debt|divine punishment)\b/i,
      /(确诊|诊断为|患有).{0,18}(癌|抑郁症|双相|精神病|焦虑症|创伤后)/,
      /(?:是|属于|证明|代表|说明|因为).{0,12}(?:业力|业障|报应|还债|惩罚|罪业|因果报应)|(?:业力|业障|报应|还债|惩罚|罪业|因果报应).{0,12}(?:导致|造成|惩罚|活该)/,
    ],
  },
  {
    reason: "harm_or_crisis_detail",
    patterns: [
      /\b(?:suicide plan|self-harm means|method to self-harm|revenge plan|weapon details)\b/i,
      /\b(?:overdose|hang herself|hang himself|jump from|cut wrists)\b/i,
      /(自杀计划|自残方式|自杀方法|报复计划|伤害.{0,8}方法|跳楼|割腕|上吊|吞药)/,
    ],
  },
];

function loadDotEnv(path) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  response.end(JSON.stringify(payload));
}

function buildInput(payload) {
  return promptRuntime.buildPromptInput("llm-shadow-response-generator-v1", {
    userText: payload.userText,
    localText: payload.localText,
    dukkhaTypes: payload.dukkhaTypes || [],
    dukkhaPatterns: payload.dukkhaPatterns || [],
    responseMoves: payload.responseMoves || [],
  });
}

function buildBaifaInput(payload) {
  return promptRuntime.buildPromptInput("baifa-mapper-v1", {
    userText: payload.userText,
    dukkhaTypes: payload.dukkhaTypes || [],
    dukkhaPatterns: payload.dukkhaPatterns || [],
    responseMoves: payload.responseMoves || [],
  });
}

function buildCrisisInput(payload) {
  return promptRuntime.buildPromptInput("avaloka-v2-crisis-classifier", {
    userText: payload.userText,
  });
}

function buildAvalokaV2ResponseInput(payload) {
  return promptRuntime.buildPromptInput("avaloka-v2-orchestrator-response", {
    userText: payload.userText,
    localText: payload.localText,
    crisis: payload.crisis,
    baifa: payload.baifa,
    compassionPlan: payload.compassionPlan,
    dukkhaTypes: payload.dukkhaTypes || [],
    dukkhaPatterns: payload.dukkhaPatterns || [],
    responseMoves: payload.responseMoves || [],
    repairGuidance: payload.repairGuidance || "",
  });
}

function buildGuardianInput(payload) {
  return promptRuntime.buildPromptInput("avaloka-v2-guardian", {
    userText: payload.userText,
    candidateText: payload.candidateText,
    crisis: payload.crisis,
    baifa: payload.baifa,
    compassionPlan: payload.compassionPlan,
  });
}

function buildCompassionPlanInput(payload) {
  return promptRuntime.buildPromptInput("avalokiteshvara-compassion-planner-v1", {
    userText: payload.userText,
    crisis: payload.crisis,
    baifa: payload.baifa,
    dukkhaTypes: payload.dukkhaTypes || [],
    dukkhaPatterns: payload.dukkhaPatterns || [],
    responseMoves: payload.responseMoves || [],
  });
}

function buildMemoryWriterInput(payload) {
  return promptRuntime.buildPromptInput("sage-memory-writer-v1", {
    turn: payload.turn,
    feedback: payload.feedback || null,
  });
}

async function callOpenAI(payload) {
  const result = await openAIClient.requestResponses({
    input: buildInput(payload),
    maxOutputTokens: 320,
    text: { verbosity: "low" },
    errorLabel: "OpenAI request failed.",
  });
  if (result.status !== 200) return result;

  return {
    status: 200,
    body: {
      candidateText: extractOutputText(result.body.data),
      model: result.body.model,
      latencyMs: result.body.latencyMs,
      attempts: result.body.attempts,
    },
  };
}

async function callOpenAIText({ input, maxOutputTokens = 320 }) {
  return openAIClient.requestText({
    input,
    maxOutputTokens,
    errorLabel: "OpenAI text request failed.",
  });
}

async function callOpenAIJson({ input, schema, name, maxOutputTokens = 520 }) {
  return openAIClient.requestJson({
    input,
    schema,
    name,
    maxOutputTokens,
    errorLabel: "OpenAI JSON request failed.",
  });
}

function baifaSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      primaryMindStates: {
        type: "array",
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            baifaCategory: { type: "string", enum: baifaCategories },
            mindState: { type: "string", enum: baifaMindStates },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            evidence: { type: "string" },
          },
          required: ["baifaCategory", "mindState", "confidence", "evidence"],
        },
      },
      wholesomeAntidotes: {
        type: "array",
        maxItems: 4,
        items: { type: "string", enum: wholesomeMindStates },
      },
      recommendedResponseMoves: {
        type: "array",
        maxItems: 5,
        items: { type: "string" },
      },
      doNotDo: {
        type: "array",
        maxItems: 5,
        items: { type: "string" },
      },
    },
    required: ["primaryMindStates", "wholesomeAntidotes", "recommendedResponseMoves", "doNotDo"],
  };
}

function crisisSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["safe", "ambiguous", "crisis"] },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reason: { type: "string" },
    },
    required: ["status", "confidence", "reason"],
  };
}

function guardianSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      passed: { type: "boolean" },
      severity: { type: "string", enum: ["pass", "warn", "revise", "block"] },
      violations: {
        type: "array",
        maxItems: 6,
        items: { type: "string" },
      },
      notes: { type: "string" },
    },
    required: ["passed", "severity", "violations", "notes"],
  };
}

function compassionPlanSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["ready"] },
      moves: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string", enum: compassionMoveIds },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reason: { type: "string" },
          },
          required: ["id", "confidence", "reason"],
        },
      },
      stance: { type: "string" },
      avoid: {
        type: "array",
        minItems: 1,
        maxItems: 6,
        items: { type: "string" },
      },
      responseHint: { type: "string" },
      crisisMode: { type: "boolean" },
    },
    required: ["status", "moves", "stance", "avoid", "responseHint", "crisisMode"],
  };
}

function memoryWriterSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      status: { type: "string", enum: ["ok"] },
      candidates: {
        type: "array",
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string", minLength: 1, maxLength: 80 },
            kind: { type: "string", enum: memoryCandidateKinds },
            text: { type: "string", minLength: 1, maxLength: 280 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            evidenceIds: {
              type: "array",
              maxItems: 6,
              items: { type: "string", minLength: 1, maxLength: 120 },
            },
            tags: {
              type: "array",
              maxItems: 5,
              items: { type: "string", minLength: 1, maxLength: 48 },
            },
          },
          required: ["id", "kind", "text", "confidence", "evidenceIds", "tags"],
        },
      },
    },
    required: ["status", "candidates"],
  };
}

function defaultCompassionPlan({ crisis, error = "" }) {
  const crisisMode = crisis?.status === "crisis" || crisis?.status === "ambiguous";
  return {
    status: error ? "error" : "ready",
    moves: [
      {
        id: crisisMode ? "protect_before_practice" : "hear_the_cry_first",
        confidence: 0.5,
        reason: error || "Default safe Compassion OS plan.",
      },
    ],
    stance: crisisMode ? "crisis_safety_first" : "plain_presence",
    avoid: ["karma_blame", "doctrine", "medical_claim", "dependency"],
    responseHint: crisisMode ? "Preserve safety before reflection." : "Use warm, plain, safe support.",
    crisisMode,
    model,
  };
}

async function callOpenAIBaifaMapper(payload) {
  const result = await callOpenAIJson({
    input: buildBaifaInput(payload),
    name: "baifa_map",
    schema: baifaSchema(),
  });

  if (result.status !== 200) return result;
  return {
    status: 200,
    body: {
      baifa: result.body.json,
      model: result.body.model,
      latencyMs: result.body.latencyMs,
    },
  };
}

async function callCompassionPlanner(payload) {
  const result = await callOpenAIJson({
    input: buildCompassionPlanInput(payload),
    name: "avalokiteshvara_compassion_plan",
    schema: compassionPlanSchema(),
    maxOutputTokens: 520,
  });

  if (result.status !== 200) {
    return {
      status: 200,
      body: {
        compassionPlan: {
          ...defaultCompassionPlan({
            crisis: payload.crisis,
            error: result.body.error || "Compassion planner unavailable.",
          }),
          latencyMs: result.body.latencyMs,
        },
      },
    };
  }

  return {
    status: 200,
    body: {
      compassionPlan: {
        ...result.body.json,
        model: result.body.model,
        latencyMs: result.body.latencyMs,
      },
    },
  };
}

async function callAvalokaV2(payload) {
  const startedAt = Date.now();
  let crisis = {
    status: "crisis",
    confidence: 1,
    reason: "Local crisis gate triggered before LLM classification.",
  };

  if (!payload.localCrisis) {
    const crisisResult = await callOpenAIJson({
      input: buildCrisisInput(payload),
      name: "avaloka_v2_crisis",
      schema: crisisSchema(),
      maxOutputTokens: 160,
    });
    if (crisisResult.status !== 200) return crisisResult;

    crisis = crisisResult.body.json;
  }

  if (crisis.status === "crisis") {
    return callAvalokaV2ResponseFlow({
      payload,
      crisis,
      baifa: null,
      startedAt,
    });
  }

  const baifaResult = await callOpenAIBaifaMapper(payload);
  if (baifaResult.status !== 200) return baifaResult;

  return callAvalokaV2ResponseFlow({
    payload,
    crisis,
    baifa: baifaResult.body.baifa,
    startedAt,
  });
}

async function callMemoryWriter(payload) {
  const startedAt = Date.now();
  const result = await callOpenAIJson({
    input: buildMemoryWriterInput(payload),
    name: "sage_memory_writer",
    schema: memoryWriterSchema(),
    maxOutputTokens: 720,
  });

  if (result.status !== 200) {
    return {
      status: result.status,
      body: buildMemoryWriterError({
        error: result.body.error || "Memory writer unavailable.",
        latencyMs: Date.now() - startedAt,
      }),
    };
  }

  const { candidates, guardian } = applyMemoryGuardian(
    result.body.json.candidates || [],
    collectAllowedEvidenceIds(payload),
  );

  return {
    status: 200,
    body: {
      status: "ok",
      model: result.body.model,
      latencyMs: Date.now() - startedAt,
      candidates,
      guardian,
    },
  };
}

async function callAvalokaV2ResponseFlow({ payload, crisis, baifa, startedAt }) {
  const compassionResult = await callCompassionPlanner({
    ...payload,
    crisis,
    baifa,
  });
  if (compassionResult.status !== 200) return compassionResult;
  const compassionPlan = compassionResult.body.compassionPlan;

  const responseResult = await callOpenAIText({
    input: buildAvalokaV2ResponseInput({
      ...payload,
      crisis,
      baifa,
      compassionPlan,
    }),
    maxOutputTokens: 320,
  });
  if (responseResult.status !== 200) return responseResult;

  let candidateText = responseResult.body.text;
  let guardianResult = await callOpenAIJson({
    input: buildGuardianInput({
      ...payload,
      candidateText,
      crisis,
      baifa,
      compassionPlan,
    }),
    name: "avaloka_v2_guardian",
    schema: guardianSchema(),
    maxOutputTokens: 260,
  });
  if (guardianResult.status !== 200) return guardianResult;

  let guardian = guardianResult.body.json;
  let repairAttempted = false;

  if (!guardian.passed || guardian.severity === "revise" || guardian.severity === "block") {
    repairAttempted = true;
    const repairResult = await callOpenAIText({
      input: buildAvalokaV2ResponseInput({
        ...payload,
        crisis,
        baifa,
        compassionPlan,
        repairGuidance: guardian.notes,
      }),
      maxOutputTokens: 320,
    });
    if (repairResult.status !== 200) return repairResult;

    candidateText = repairResult.body.text;
    guardianResult = await callOpenAIJson({
      input: buildGuardianInput({
        ...payload,
        candidateText,
        crisis,
        baifa,
        compassionPlan,
      }),
      name: "avaloka_v2_guardian",
      schema: guardianSchema(),
      maxOutputTokens: 260,
    });
    if (guardianResult.status !== 200) return guardianResult;
    guardian = guardianResult.body.json;
  }

  if (!guardian.passed || guardian.severity === "block") {
    candidateText = buildSafeFallbackText({ payload, crisis });
  }

  return {
    status: 200,
    body: {
      candidateText,
      responseSource: "llm_orchestrator_v2",
      crisis,
      baifa,
      compassionPlan,
      guardian,
      repairAttempted,
      model,
      latencyMs: Date.now() - startedAt,
    },
  };
}

function buildSafeFallbackText({ payload, crisis }) {
  if (crisis?.status === "crisis") {
    return [
      "我在。先不要一个人扛。",
      "请现在把可能伤害自己的东西放远一点，联系一个你信任的人来陪你；如果你觉得自己可能马上伤害自己，请立刻联系当地紧急服务。在美国可以拨打 911 或 988。",
      "你不用解释完整，先回我一个字：“在”。",
    ].join("\n\n");
  }

  const text = String(payload.userText || "");
  if (/胸口|心口|呼吸|疼|痛|指标|检查|癌|复查|生病|病/.test(text)) {
    return [
      "我听见你现在很怕，尤其是身体不舒服时，一个人越查越容易被最坏的可能拖走。",
      "我不能替医生判断结果；如果胸口闷得厉害、呼吸困难、疼痛加重，先联系医生、急诊咨询线或当地紧急服务。若暂时能等到天亮，先把搜索关掉，记下症状出现的时间和感觉。",
      "现在先把脚踩稳，慢慢呼一口气。今晚先不让网页替你下结论。",
    ].join("\n\n");
  }

  return [
    "我听见了，这一刻对你很重。",
    "先不急着解释完整，也不急着审判自己。我们先让身体稳一点。",
    "把脚踩在地上，慢慢呼一口气。今晚先从这一小步开始。",
  ].join("\n\n");
}

function applyMemoryGuardian(rawCandidates, allowedEvidenceIds) {
  const guardian = [];
  const candidates = [];

  for (const [index, rawCandidate] of rawCandidates.entries()) {
    const candidate = normalizeMemoryCandidate(rawCandidate, index);
    const reasons = getMemoryGuardianReasons(candidate, allowedEvidenceIds);
    const status = reasons.length > 0 ? "reject" : "allow";

    guardian.push({
      candidateId: candidate.id,
      status,
      reasons,
    });

    if (status === "allow") {
      candidates.push(candidate);
    }
  }

  return { candidates, guardian };
}

function normalizeMemoryCandidate(candidate, index) {
  const fallbackId = `candidate_${index + 1}`;
  return {
    id: cleanIdentifier(candidate?.id) || fallbackId,
    kind: String(candidate?.kind || ""),
    text: String(candidate?.text || "").trim(),
    confidence: Number(candidate?.confidence),
    evidenceIds: normalizeStringArray(candidate?.evidenceIds),
    tags: normalizeStringArray(candidate?.tags).map(cleanTag).filter(Boolean),
  };
}

function getMemoryGuardianReasons(candidate, allowedEvidenceIds) {
  const reasons = [];

  if (!memoryCandidateKinds.includes(candidate.kind)) reasons.push("invalid_kind");
  if (!candidate.text) reasons.push("empty_text");
  if (!Number.isFinite(candidate.confidence) || candidate.confidence < 0.55) reasons.push("low_confidence");
  if (candidate.evidenceIds.length === 0) reasons.push("missing_evidence");
  if (candidate.evidenceIds.some((evidenceId) => !allowedEvidenceIds.has(evidenceId))) {
    reasons.push("unsupported_evidence");
  }

  for (const rule of memoryGuardianRules) {
    if (rule.patterns.some((pattern) => pattern.test(candidate.text))) {
      reasons.push(rule.reason);
    }
  }

  return [...new Set(reasons)];
}

function collectAllowedEvidenceIds(payload) {
  const ids = new Set();
  for (const value of [payload?.turn?.userMessageId, payload?.turn?.avalokaMessageId]) {
    const id = String(value || "").trim();
    if (id) ids.add(id);
  }

  const feedback = payload?.feedback;
  if (feedback && typeof feedback === "object") {
    for (const field of ["id", "feedbackId", "messageId"]) {
      const id = String(feedback[field] || "").trim();
      if (id) ids.add(id);
    }
  }

  return ids;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value
        .map((item) => String(item || "").trim())
        .filter(Boolean),
    ),
  ];
}

function cleanIdentifier(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function cleanTag(value) {
  return cleanIdentifier(value).slice(0, 48);
}

function validateMemoryWriterPayload(payload) {
  const turn = payload?.turn;
  if (!turn || typeof turn !== "object") {
    return "turn is required.";
  }

  for (const field of ["userMessageId", "avalokaMessageId", "userText", "avalokaText"]) {
    if (!String(turn[field] || "").trim()) {
      return `turn.${field} is required.`;
    }
  }

  return "";
}

function buildMemoryWriterError({ error, latencyMs = 0 }) {
  return {
    status: "error",
    model,
    latencyMs,
    candidates: [],
    guardian: [],
    error,
  };
}

function buildHealthPayload() {
  return {
    status: "ok",
    service: "avaloka-llm-shadow",
    model,
    openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    openaiRuntime: {
      requestTimeoutMs: openAIRequestTimeoutMs,
      maxRetries: openAIMaxRetries,
      maxConcurrentRequests: openAIMaxConcurrentRequests,
      maxRequestsPerMinute: openAIMaxRequestsPerMinute,
    },
    requestLimits: {
      maxJsonBodyBytes,
    },
    promptRegistry: {
      schemaVersion: promptRuntime.registry.schemaVersion,
      activePromptIds: promptRuntime.getActivePromptRecords().map((record) => record.id),
    },
    endpoints: {
      health: "GET /api/llm-shadow/test",
      shadowTest: "GET /api/llm-shadow/test?run=1&userText=...&localText=...",
      shadowPost: "POST /api/llm-shadow",
      baifaMap: "POST /api/baifa-map",
      avalokaV2: "POST /api/avaloka-v2",
      sageMemoryWriter: "POST /api/sage-memory-writer",
    },
    timestamp: new Date().toISOString(),
  };
}

async function handleGetShadowTest(request, response) {
  const url = new URL(request.url || "", `http://${request.headers.host || "127.0.0.1"}`);
  if (url.searchParams.get("run") !== "1") {
    sendJson(response, 200, buildHealthPayload());
    return;
  }

  const userText = url.searchParams.get("userText")?.trim();
  const localText = url.searchParams.get("localText")?.trim();
  if (!userText || !localText) {
    sendJson(response, 400, {
      error: "GET shadow test requires run=1, userText, and localText.",
      example: "/api/llm-shadow/test?run=1&userText=我现在很乱&localText=把脚踩在地上，慢慢呼一口气。",
    });
    return;
  }

  const result = await callOpenAI({
    userText,
    localText,
    dukkhaTypes: splitCsvParam(url.searchParams.get("dukkhaTypes")),
    dukkhaPatterns: splitCsvParam(url.searchParams.get("dukkhaPatterns")),
    responseMoves: splitCsvParam(url.searchParams.get("responseMoves")),
  });
  sendJson(response, result.status, {
    ...result.body,
    testMode: "get",
  });
}

function splitCsvParam(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "GET" && request.url?.startsWith("/api/llm-shadow/test")) {
    try {
      await handleGetShadowTest(request, response);
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error." });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/baifa-map") {
    try {
      const payload = await readJson(request, { maxBytes: maxJsonBodyBytes });
      if (!payload.userText) {
        sendJson(response, 400, { error: "userText is required." });
        return;
      }

      const result = await callOpenAIBaifaMapper(payload);
      sendJson(response, result.status, result.body);
    } catch (error) {
      sendRequestError(response, error);
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/avaloka-v2") {
    try {
      const payload = await readJson(request, { maxBytes: maxJsonBodyBytes });
      if (!payload.userText || !payload.localText) {
        sendJson(response, 400, { error: "userText and localText are required." });
        return;
      }

      const result = await callAvalokaV2(payload);
      sendJson(response, result.status, result.body);
    } catch (error) {
      sendRequestError(response, error);
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/sage-memory-writer") {
    try {
      const payload = await readJson(request, { maxBytes: maxJsonBodyBytes });
      const validationError = validateMemoryWriterPayload(payload);
      if (validationError) {
        sendJson(response, 400, buildMemoryWriterError({ error: validationError }));
        return;
      }

      const result = await callMemoryWriter(payload);
      sendJson(response, result.status, result.body);
    } catch (error) {
      sendRequestError(response, error);
    }
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/llm-shadow") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const payload = await readJson(request, { maxBytes: maxJsonBodyBytes });
    if (!payload.userText || !payload.localText) {
      sendJson(response, 400, { error: "userText and localText are required." });
      return;
    }

    const result = await callOpenAI(payload);
    sendJson(response, result.status, result.body);
  } catch (error) {
    sendRequestError(response, error);
  }
});

function sendRequestError(response, error) {
  if (error instanceof PayloadTooLargeError) {
    sendJson(response, error.statusCode, { error: error.message, maxJsonBodyBytes });
    return;
  }

  if (error instanceof SyntaxError) {
    sendJson(response, 400, { error: "Request body must be valid JSON." });
    return;
  }

  sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error." });
}

server.listen(port, "127.0.0.1", () => {
  console.log(`Avaloka LLM shadow server listening on http://127.0.0.1:${port}`);
});
