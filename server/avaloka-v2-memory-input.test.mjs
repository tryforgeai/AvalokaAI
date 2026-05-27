import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

describe("Avaloka V2 memory injection contract", () => {
  it("passes retrieved care facts into the V2 response prompt payload", () => {
    const serverSource = readFileSync(join(repoRoot, "server/llm-shadow-server.mjs"), "utf8");

    assert.match(serverSource, /careFacts:\s*payload\.retrievedCareFacts\s*\|\|\s*\[\]/);
  });

  it("instructs the response prompt to use care facts privately", () => {
    const prompt = readFileSync(join(repoRoot, "prompt/avaloka-v2-orchestrator-response.md"), "utf8");

    assert.match(prompt, /care facts/i);
    assert.match(prompt, /Do not expose.*memory IDs/i);
  });
});
