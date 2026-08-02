import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App";
import { pauseMemoryWrites, resumeMemoryWrites, saveConsent, saveMemoryCandidates } from "./storage";

function installWindow(search = "") {
  let store: Record<string, string> = {};
  Object.defineProperty(globalThis, "window", {
    value: {
      location: { search },
      localStorage: {
        clear: () => {
          store = {};
        },
        getItem: (key: string) => store[key] || null,
        removeItem: (key: string) => {
          delete store[key];
        },
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
      },
      confirm: () => true,
    },
    writable: true,
  });
}

describe("user-facing memory controls UI", () => {
  beforeEach(() => {
    installWindow("");
    window.localStorage.clear();
  });

  it("renders safe remembered care notes in user mode without developer memory internals", () => {
    saveConsent();
    saveMemoryCandidates(
      [
        {
          id: "memory-hidden-tone",
          kind: "tone_preference",
          text: "User prefers short body-grounded responses.",
          confidence: 0.82,
          evidenceIds: ["feedback-hidden-1"],
          tags: ["tone", "body_grounding"],
        },
      ],
      "2026-05-26T10:00:00.000Z",
    );
    pauseMemoryWrites();

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("照顾笔记");
    expect(html).toContain("记忆已暂停");
    expect(html).toContain("Tone and length");
    expect(html).toContain("User prefers short body-grounded responses.");
    expect(html).toContain("继续记住");
    expect(html).toContain("清空照顾笔记");
    expect(html).toContain("导出照顾笔记");
    expect(html).not.toContain("memory-hidden-tone");
    expect(html).not.toContain("feedback-hidden-1");
    expect(html).not.toContain("confidence");
    expect(html).not.toContain("body_grounding");
    expect(html).not.toContain("lifecycleReviewQueue");
    expect(html).not.toContain("memory_claim_grounding_v0");
    expect(html).not.toContain("retrieval_trace_v1");
    expect(html).not.toContain("guardian");
  });

  it("renders an on-state empty memory surface without developer panels in user mode", () => {
    saveConsent();
    resumeMemoryWrites();

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("记忆已开启");
    expect(html).toContain("现在还没有保存的照顾笔记");
    expect(html).toContain("暂停记忆");
    expect(html).not.toContain("Developer testing only");
    expect(html).not.toContain("review queue");
  });
});
