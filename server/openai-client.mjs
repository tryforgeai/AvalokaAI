const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_RETRIES = 1;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 3;
const DEFAULT_MAX_REQUESTS_PER_MINUTE = 120;
const TRANSIENT_STATUSES = new Set([408, 409, 429, 500, 502, 503, 504]);

export function createOpenAIClient({
  apiKey,
  model,
  fetchImpl = fetch,
  timeoutMs = Number(process.env.OPENAI_REQUEST_TIMEOUT_MS || DEFAULT_TIMEOUT_MS),
  maxRetries = Number(process.env.OPENAI_MAX_RETRIES || DEFAULT_MAX_RETRIES),
  maxConcurrentRequests = Number(process.env.OPENAI_MAX_CONCURRENT_REQUESTS || DEFAULT_MAX_CONCURRENT_REQUESTS),
  maxRequestsPerMinute = Number(process.env.OPENAI_MAX_REQUESTS_PER_MINUTE || DEFAULT_MAX_REQUESTS_PER_MINUTE),
  now = () => Date.now(),
} = {}) {
  let inFlight = 0;
  const recentRequestTimestamps = [];

  async function requestResponses({ input, maxOutputTokens = 320, text, errorLabel }) {
    if (!apiKey) {
      return {
        status: 503,
        body: {
          error: "OPENAI_API_KEY is not set. Copy server/.env.example to server/.env and run the server with that env loaded.",
        },
      };
    }

    if (inFlight >= maxConcurrentRequests) {
      return {
        status: 429,
        body: {
          error: "OpenAI request concurrency limit reached.",
          model,
        },
      };
    }

    pruneOldRequestTimestamps(recentRequestTimestamps, now());
    if (recentRequestTimestamps.length >= maxRequestsPerMinute) {
      return {
        status: 429,
        body: {
          error: "OpenAI request rate limit reached.",
          model,
        },
      };
    }

    recentRequestTimestamps.push(now());
    inFlight += 1;
    try {
      return await fetchWithRetry({
        fetchImpl,
        apiKey,
        model,
        input,
        maxOutputTokens,
        text,
        timeoutMs,
        maxRetries,
        errorLabel,
      });
    } finally {
      inFlight -= 1;
    }
  }

  async function requestText({ input, maxOutputTokens = 320, errorLabel }) {
    const result = await requestResponses({
      input,
      maxOutputTokens,
      text: { verbosity: "low" },
      errorLabel,
    });

    if (result.status !== 200) return result;
    return {
      status: 200,
      body: {
        text: extractOutputText(result.body.data),
        model,
        latencyMs: result.body.latencyMs,
        attempts: result.body.attempts,
      },
    };
  }

  async function requestJson({ input, schema, name, maxOutputTokens = 520, errorLabel }) {
    const result = await requestResponses({
      input,
      maxOutputTokens,
      text: {
        verbosity: "low",
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
      errorLabel,
    });

    if (result.status !== 200) return result;

    try {
      return {
        status: 200,
        body: {
          json: JSON.parse(extractOutputText(result.body.data)),
          model,
          latencyMs: result.body.latencyMs,
          attempts: result.body.attempts,
        },
      };
    } catch {
      return {
        status: 502,
        body: {
          error: "OpenAI JSON request returned invalid JSON.",
          model,
          attempts: result.body.attempts,
        },
      };
    }
  }

  return { requestResponses, requestText, requestJson };
}

function pruneOldRequestTimestamps(timestamps, currentTime) {
  const windowStart = currentTime - 60_000;
  while (timestamps.length > 0 && timestamps[0] <= windowStart) {
    timestamps.shift();
  }
}

async function fetchWithRetry({
  fetchImpl,
  apiKey,
  model,
  input,
  maxOutputTokens,
  text,
  timeoutMs,
  maxRetries,
  errorLabel,
}) {
  const startedAt = Date.now();
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          input,
          max_output_tokens: maxOutputTokens,
          text,
        }),
      });
      clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return {
          status: 200,
          body: {
            data,
            model,
            latencyMs: Date.now() - startedAt,
            attempts: attempt + 1,
          },
        };
      }

      lastError = {
        status: response.status,
        error: data?.error?.message || errorLabel,
      };

      if (!TRANSIENT_STATUSES.has(response.status) || attempt === maxRetries) {
        return {
          status: response.status,
          body: {
            error: lastError.error,
            model,
            attempts: attempt + 1,
          },
        };
      }
    } catch (error) {
      clearTimeout(timeout);
      lastError = normalizeFetchError(error);

      if (attempt === maxRetries) {
        return {
          status: lastError.status,
          body: {
            error: lastError.error,
            model,
            attempts: attempt + 1,
          },
        };
      }
    }
  }

  return {
    status: lastError?.status || 502,
    body: {
      error: lastError?.error || errorLabel,
      model,
      attempts: maxRetries + 1,
    },
  };
}

function normalizeFetchError(error) {
  if (error?.name === "AbortError") {
    return {
      status: 504,
      error: "OpenAI request timed out.",
    };
  }

  return {
    status: 502,
    error: error instanceof Error ? error.message : "OpenAI request failed.",
  };
}

export function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const textParts = [];
  for (const item of data?.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") {
        textParts.push(content.text);
      }
    }
  }

  return textParts.join("\n").trim();
}
