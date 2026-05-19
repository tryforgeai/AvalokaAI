import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { PayloadTooLargeError, readJson } from "./request-body.mjs";

function requestFromText(text, chunkSize = text.length) {
  const chunks = [];
  for (let index = 0; index < text.length; index += chunkSize) {
    chunks.push(Buffer.from(text.slice(index, index + chunkSize)));
  }
  return Readable.from(chunks);
}

describe("readJson", () => {
  it("parses a normal JSON body", async () => {
    const body = await readJson(requestFromText('{"userText":"hello"}'), { maxBytes: 64 });
    assert.deepEqual(body, { userText: "hello" });
  });

  it("rejects request bodies that exceed the configured byte limit", async () => {
    await assert.rejects(
      () => readJson(requestFromText('{"userText":"too long"}', 4), { maxBytes: 10 }),
      PayloadTooLargeError,
    );
  });

  it("preserves JSON parse errors for malformed request bodies", async () => {
    await assert.rejects(() => readJson(requestFromText('{"userText":')), SyntaxError);
  });
});
