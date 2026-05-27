import { describe, expect, it } from "vitest";
import { runSageMemoryEndToEndEval } from "./sageMemoryEndToEndEval";
import type { SageEndToEndCase } from "./sageMemoryEndToEndEval";
import cases from "../../../evals/sage-end-to-end-cases.json";

const sageEndToEndCases = cases as SageEndToEndCase[];

describe("SAGE memory end-to-end eval", () => {
  it("runs writer fixture candidates through guardian, store, and reader", () => {
    const summary = runSageMemoryEndToEndEval(sageEndToEndCases);

    expect(summary.total).toBe(sageEndToEndCases.length);
    expect(summary.failed).toBe(0);
    expect(summary.stageCounts).toMatchObject({
      writer: 0,
      guardian: 0,
      store: 0,
      reader: 0,
      fixture: 0,
    });
    expect(summary.results.map((result) => result.verdict)).toEqual(["passed", "passed"]);
  });

  it("attributes a failure to the reader when expected facts are not retrieved", () => {
    const summary = runSageMemoryEndToEndEval([
      {
        id: "reader_failure",
        group: "retrieval",
        now: "2026-05-26T10:00:00.000Z",
        writerCandidates: [
          {
            id: "tone-short-body",
            kind: "tone_preference",
            text: "User prefers short body-grounded responses.",
            confidence: 0.8,
            evidenceIds: ["feedback-1"],
            tags: ["tone"],
          },
        ],
        expectedSavedIds: ["tone-short-body"],
        retrievalContext: {
          userText: "我是不是报应？",
        },
        expectedRetrievedIds: ["tone-short-body"],
        reason: "The fixture intentionally asks for a tone memory from a self-blame turn.",
      },
    ]);

    expect(summary.failed).toBe(1);
    expect(summary.stageCounts.reader).toBe(1);
    expect(summary.results[0].checks[0]).toContain("reader missing expected memory");
  });
});
