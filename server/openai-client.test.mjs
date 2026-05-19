import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createOpenAIClient } from "./openai-client.mjs";

function jsonResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

describe("createOpenAIClient", () => {
  it("aborts a slow OpenAI request and returns a timeout response", async () => {
    const client = createOpenAIClient({
      apiKey: "test-key",
      model: "gpt-test",
      timeoutMs: 5,
      maxRetries: 0,
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            reject(Object.assign(new Error("aborted"), { name: "AbortError" }));
          });
        }),
    });

    const result = await client.requestJson({
      input: [],
      schema: { type: "object", additionalProperties: false, properties: {}, required: [] },
      name: "test_schema",
      errorLabel: "OpenAI JSON request failed.",
    });

    assert.equal(result.status, 504);
    assert.equal(result.body.error, "OpenAI request timed out.");
    assert.equal(result.body.model, "gpt-test");
  });

  it("retries transient OpenAI failures before returning a successful response", async () => {
    let attempts = 0;
    const client = createOpenAIClient({
      apiKey: "test-key",
      model: "gpt-test",
      timeoutMs: 100,
      maxRetries: 1,
      fetchImpl: async () => {
        attempts += 1;
        if (attempts === 1) {
          return jsonResponse(503, { error: { message: "temporarily overloaded" } });
        }

        return jsonResponse(200, { output_text: "hello" });
      },
    });

    const result = await client.requestText({
      input: [],
      errorLabel: "OpenAI text request failed.",
    });

    assert.equal(attempts, 2);
    assert.equal(result.status, 200);
    assert.equal(result.body.text, "hello");
    assert.equal(result.body.attempts, 2);
  });

  it("returns 429 immediately when the outbound concurrency limit is full", async () => {
    let releaseFirstRequest;
    const client = createOpenAIClient({
      apiKey: "test-key",
      model: "gpt-test",
      timeoutMs: 100,
      maxRetries: 0,
      maxConcurrentRequests: 1,
      fetchImpl: async () =>
        new Promise((resolve) => {
          releaseFirstRequest = () => resolve(jsonResponse(200, { output_text: "first" }));
        }),
    });

    const first = client.requestText({
      input: [],
      errorLabel: "OpenAI text request failed.",
    });
    const second = await client.requestText({
      input: [],
      errorLabel: "OpenAI text request failed.",
    });

    assert.equal(second.status, 429);
    assert.equal(second.body.error, "OpenAI request concurrency limit reached.");

    releaseFirstRequest();
    assert.equal((await first).status, 200);
  });

  it("returns 429 when the per-minute OpenAI request budget is exhausted", async () => {
    const client = createOpenAIClient({
      apiKey: "test-key",
      model: "gpt-test",
      timeoutMs: 100,
      maxRetries: 0,
      maxRequestsPerMinute: 1,
      fetchImpl: async () => jsonResponse(200, { output_text: "ok" }),
    });

    const first = await client.requestText({
      input: [],
      errorLabel: "OpenAI text request failed.",
    });
    const second = await client.requestText({
      input: [],
      errorLabel: "OpenAI text request failed.",
    });

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
    assert.equal(second.body.error, "OpenAI request rate limit reached.");
  });
});
