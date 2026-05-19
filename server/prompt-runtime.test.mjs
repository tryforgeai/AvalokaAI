import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { createPromptRuntime } from "./prompt-runtime.mjs";

function makeTempRepo() {
  const root = mkdtempSync(join(tmpdir(), "avaloka-prompt-runtime-"));
  mkdirSync(join(root, "prompt"), { recursive: true });
  mkdirSync(join(root, "evals"), { recursive: true });
  writeFileSync(join(root, "prompt/test-prompt.md"), "# Test prompt\n\nReturn JSON only.");
  writeFileSync(join(root, "evals/test-cases.json"), "[]");
  writeFileSync(
    join(root, "prompt/registry.json"),
    JSON.stringify(
      {
        prompts: [
          {
            id: "test-prompt-v1",
            file: "prompt/test-prompt.md",
            status: "active",
            purpose: "Test prompt runtime.",
            usedBy: ["server/test"],
            evals: ["evals/test-cases.json"],
            rollback: "restore previous committed prompt/test-prompt.md",
            version: "v1",
          },
        ],
      },
      null,
      2,
    ),
  );
  return root;
}

describe("createPromptRuntime", () => {
  it("loads active prompt records from registry", () => {
    const runtime = createPromptRuntime({ root: makeTempRepo() });
    const record = runtime.getPromptRecord("test-prompt-v1");

    assert.equal(record.id, "test-prompt-v1");
    assert.equal(record.status, "active");
    assert.equal(record.version, "v1");
  });

  it("builds a standardized OpenAI input with developer prompt and structured payload", () => {
    const runtime = createPromptRuntime({ root: makeTempRepo() });
    const input = runtime.buildPromptInput("test-prompt-v1", {
      userText: "hello",
      omitted: undefined,
    });

    assert.equal(input[0].role, "developer");
    assert.match(input[0].content, /Return JSON only/);
    assert.equal(input[1].role, "user");
    assert.deepEqual(JSON.parse(input[1].content), { userText: "hello" });
  });

  it("throws when an active prompt has no eval binding", () => {
    const root = makeTempRepo();
    writeFileSync(
      join(root, "prompt/registry.json"),
      JSON.stringify({
        prompts: [
          {
            id: "broken-prompt",
            file: "prompt/test-prompt.md",
            status: "active",
            purpose: "Broken.",
            usedBy: ["server/test"],
            evals: [],
            rollback: "restore previous committed version",
            version: "v1",
          },
        ],
      }),
    );

    assert.throws(() => createPromptRuntime({ root }), /active prompt "broken-prompt" must declare evals/);
  });
});
