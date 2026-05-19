import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
loadDotEnv(resolve(root, "server/.env"));

const prompt = readFileSync(resolve(root, "prompt/llm-shadow-response-generator-v1.md"), "utf8");
const baifaPrompt = readFileSync(resolve(root, "prompt/baifa-mapper-v1.md"), "utf8");
const avalokaV2ResponsePrompt = readFileSync(resolve(root, "prompt/avaloka-v2-orchestrator-response.md"), "utf8");
const avalokaV2CrisisPrompt = readFileSync(resolve(root, "prompt/avaloka-v2-crisis-classifier.md"), "utf8");
const avalokaV2GuardianPrompt = readFileSync(resolve(root, "prompt/avaloka-v2-guardian.md"), "utf8");
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_SHADOW_MODEL || "gpt-5.2";
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

async function readJson(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function buildInput(payload) {
  return [
    {
      role: "developer",
      content: prompt,
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userText: payload.userText,
          localText: payload.localText,
          dukkhaTypes: payload.dukkhaTypes || [],
          dukkhaPatterns: payload.dukkhaPatterns || [],
          responseMoves: payload.responseMoves || [],
        },
        null,
        2,
      ),
    },
  ];
}

function buildBaifaInput(payload) {
  return [
    {
      role: "developer",
      content: baifaPrompt,
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userText: payload.userText,
          dukkhaTypes: payload.dukkhaTypes || [],
          dukkhaPatterns: payload.dukkhaPatterns || [],
          responseMoves: payload.responseMoves || [],
        },
        null,
        2,
      ),
    },
  ];
}

function buildCrisisInput(payload) {
  return [
    {
      role: "developer",
      content: avalokaV2CrisisPrompt,
    },
    {
      role: "user",
      content: JSON.stringify({ userText: payload.userText }, null, 2),
    },
  ];
}

function buildAvalokaV2ResponseInput(payload) {
  return [
    {
      role: "developer",
      content: avalokaV2ResponsePrompt,
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userText: payload.userText,
          localText: payload.localText,
          crisis: payload.crisis,
          baifa: payload.baifa,
          dukkhaTypes: payload.dukkhaTypes || [],
          dukkhaPatterns: payload.dukkhaPatterns || [],
          responseMoves: payload.responseMoves || [],
          repairGuidance: payload.repairGuidance || "",
        },
        null,
        2,
      ),
    },
  ];
}

function buildGuardianInput(payload) {
  return [
    {
      role: "developer",
      content: avalokaV2GuardianPrompt,
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userText: payload.userText,
          candidateText: payload.candidateText,
          crisis: payload.crisis,
          baifa: payload.baifa,
        },
        null,
        2,
      ),
    },
  ];
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textParts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

async function callOpenAI(payload) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      status: 503,
      body: {
        error: "OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and run the server with that env loaded.",
      },
    };
  }

  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: buildInput(payload),
      max_output_tokens: 320,
      text: {
        verbosity: "low",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error: data?.error?.message || "OpenAI request failed.",
        model,
      },
    };
  }

  return {
    status: 200,
    body: {
      candidateText: extractOutputText(data),
      model,
      latencyMs: Date.now() - startedAt,
    },
  };
}

async function callOpenAIText({ input, maxOutputTokens = 320 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      status: 503,
      body: {
        error: "OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and run the server with that env loaded.",
      },
    };
  }

  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: maxOutputTokens,
      text: {
        verbosity: "low",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error: data?.error?.message || "OpenAI text request failed.",
        model,
      },
    };
  }

  return {
    status: 200,
    body: {
      text: extractOutputText(data),
      model,
      latencyMs: Date.now() - startedAt,
    },
  };
}

async function callOpenAIJson({ input, schema, name, maxOutputTokens = 520 }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      status: 503,
      body: {
        error: "OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and run the server with that env loaded.",
      },
    };
  }

  const startedAt = Date.now();
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: maxOutputTokens,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error: data?.error?.message || "OpenAI JSON request failed.",
        model,
      },
    };
  }

  try {
    return {
      status: 200,
      body: {
        json: JSON.parse(extractOutputText(data)),
        model,
        latencyMs: Date.now() - startedAt,
      },
    };
  } catch {
    return {
      status: 502,
      body: {
        error: "OpenAI JSON request returned invalid JSON.",
        model,
      },
    };
  }
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

async function callAvalokaV2ResponseFlow({ payload, crisis, baifa, startedAt }) {
  const responseResult = await callOpenAIText({
    input: buildAvalokaV2ResponseInput({
      ...payload,
      crisis,
      baifa,
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
      }),
      name: "avaloka_v2_guardian",
      schema: guardianSchema(),
      maxOutputTokens: 260,
    });
    if (guardianResult.status !== 200) return guardianResult;
    guardian = guardianResult.body.json;
  }

  if (!guardian.passed || guardian.severity === "block") {
    candidateText = payload.localText;
  }

  return {
    status: 200,
    body: {
      candidateText,
      responseSource: "llm_orchestrator_v2",
      crisis,
      baifa,
      guardian,
      repairAttempted,
      model,
      latencyMs: Date.now() - startedAt,
    },
  };
}

function buildHealthPayload() {
  return {
    status: "ok",
    service: "avaloka-llm-shadow",
    model,
    openaiKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    promptLoaded: Boolean(prompt.trim()),
    promptCharacters: prompt.length,
    baifaPromptLoaded: Boolean(baifaPrompt.trim()),
    baifaPromptCharacters: baifaPrompt.length,
    avalokaV2PromptsLoaded: Boolean(
      avalokaV2ResponsePrompt.trim() && avalokaV2CrisisPrompt.trim() && avalokaV2GuardianPrompt.trim(),
    ),
    endpoints: {
      health: "GET /api/llm-shadow/test",
      shadowTest: "GET /api/llm-shadow/test?run=1&userText=...&localText=...",
      shadowPost: "POST /api/llm-shadow",
      baifaMap: "POST /api/baifa-map",
      avalokaV2: "POST /api/avaloka-v2",
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
      const payload = await readJson(request);
      if (!payload.userText) {
        sendJson(response, 400, { error: "userText is required." });
        return;
      }

      const result = await callOpenAIBaifaMapper(payload);
      sendJson(response, result.status, result.body);
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error." });
    }
    return;
  }

  if (request.method === "POST" && request.url === "/api/avaloka-v2") {
    try {
      const payload = await readJson(request);
      if (!payload.userText || !payload.localText) {
        sendJson(response, 400, { error: "userText and localText are required." });
        return;
      }

      const result = await callAvalokaV2(payload);
      sendJson(response, result.status, result.body);
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error." });
    }
    return;
  }

  if (request.method !== "POST" || request.url !== "/api/llm-shadow") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const payload = await readJson(request);
    if (!payload.userText || !payload.localText) {
      sendJson(response, 400, { error: "userText and localText are required." });
      return;
    }

    const result = await callOpenAI(payload);
    sendJson(response, result.status, result.body);
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Avaloka LLM shadow server listening on http://127.0.0.1:${port}`);
});
