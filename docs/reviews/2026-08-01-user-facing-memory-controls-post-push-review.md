# User-Facing Memory Controls V0 Post-Push Review

Date: 2026-08-01 17:43 PDT
Reviewed commit: `75037fc docs: clean browser qa whitespace`
Remote: `origin/main`

## Verdict

User-Facing Memory Controls V0 is healthy on `origin/main`.

The line now has design, implementation, browser QA, trust-boundary cleanup, and source-of-truth documentation updates. Ordinary user mode can inspect, pause, export, and clear remembered care notes without exposing developer memory diagnostics.

## Post-Push Sync Check

Repository state during review:

```text
## main...origin/main
HEAD:        75037fcf4207010886ec18977846723cf539b3ae
origin/main: 75037fcf4207010886ec18977846723cf539b3ae
```

Recent related commits:

```text
75037fc docs: clean browser qa whitespace
9118e0a docs: add user memory controls browser qa
8ce52cc feat: add user-facing memory controls
00f0f5d feat: add memory-only clear helper
3a10d1d feat: add memory write pause setting
579e833 feat: add user-facing memory projection
a1dccd9 docs: add user-facing memory controls design
```

## Scope Reviewed

Implementation and tests:

- `app/src/App.tsx`
- `app/src/styles.css`
- `app/src/lib/userFacingMemory.ts`
- `app/src/lib/userFacingMemory.test.ts`
- `app/src/lib/userFacingMemoryControlsUi.test.tsx`
- `app/src/lib/storage.ts`
- `app/src/lib/storage.test.ts`
- `app/src/lib/uiMode.test.ts`

Documentation and governance:

- `docs/research/user-facing-memory-controls-design.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-post-implementation-audit.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-browser-qa.md`
- `docs/decisions/decision-log.md`
- `docs/product/version-roadmap.md`

## What Shipped

Completed slices:

```text
Slice 1: sanitized projection helper — implemented
Slice 2: memory write pause setting — implemented
Slice 3: memory-only clear helper — implemented
Slice 4: small user-mode UI surface — implemented
```

User-mode capabilities:

- show sanitized remembered care notes;
- show memory write status;
- pause / resume future memory writes;
- export care notes as a plain user-safe summary;
- clear care notes without clearing messages or feedback.

Deferred intentionally:

- single-note delete;
- editable memories;
- graph memory UI;
- developer review queue UI in ordinary user mode;
- retrieval trace / claim-grounding UI in ordinary user mode.

## User/Developer Boundary Review

### User Mode

The user-facing card consumes:

```text
toUserFacingCareNotes(loadCareCard())
exportUserFacingCareNotes(...)
loadMemoryWriteStatus()
pauseMemoryWrites()
resumeMemoryWrites()
clearCareMemories()
```

The ordinary user surface shows only:

- care-note heading;
- care-note display text;
- last-updated label;
- memory status;
- safe action labels.

It does not render developer panels unless the explicit developer flag is present.

### Developer Mode

Developer-only panels still contain diagnostics such as memory IDs, confidence, evidence counts, tags, lifecycle review summaries, claim-grounding summaries, retrieval facts, candidate IDs, guardian results, and model/routing details. These remain behind developer mode.

## Trust-Boundary Findings

Browser QA found one low-risk copy issue:

```text
Care-note export copy mentioned internal IDs, scores, evidence, tags, or developer review data.
```

No raw values leaked, but naming hidden developer concepts in a user-facing export was still a trust-boundary flaw. It was fixed by changing the export copy to plain language:

```text
These are the short care notes Avaloka uses on this device to remember what kind of support may feel helpful.
```

Regression assertions now ensure the export text does not contain:

```text
internal IDs
scores
evidence
tags
developer review data
```

## Browser QA Evidence

Manual browser QA covered:

- initial user-mode memory card empty state;
- pause memory writes;
- resume memory writes;
- export care notes fallback panel;
- clear care notes in the empty state;
- console checks after navigation and interactions.

Console result:

```text
console_messages: []
js_errors: []
total_errors: 0
```

Known browser QA gap:

- non-empty care-note browser click-path was not manually seeded because browser-side unsafe web-storage evaluation was blocked. Non-empty rendering remains covered by server-rendered UI tests.

## Final Verification Evidence

Commands run from `app/` after the pushed line:

```bash
npm run content:check
npx vitest run src/lib/userFacingMemory.test.ts src/lib/userFacingMemoryControlsUi.test.tsx src/lib/storage.test.ts src/lib/uiMode.test.ts
npm test
npm run coverage
npm run build
```

Results:

```text
content:check passed
focused tests: 4 files passed, 13 tests passed
npm test: 23 files passed, 101 tests passed
coverage:
  statements: 97.9%
  branches: 85.81%
  functions: 99%
  lines: 97.9%
build: tsc + vite passed
vite build: 1598 modules transformed
```

A fresh focused ad-hoc verifier was also run after the browser-QA copy fix. It covered `App.tsx`, `userFacingMemory.ts`, and `userFacingMemory.test.ts`, then checked markers for the plain-language export copy and the no-internal-vocabulary regression assertions:

```text
fresh_browser_qa_copy_fix_markers_verified
SCRIPT_EXIT=0
```

## Source-of-Truth Updates

This post-push review also updates active governance docs:

- `docs/decisions/decision-log.md` adds the accepted `2026-08-01 — Add User-Facing Memory Controls V0` decision.
- `docs/product/version-roadmap.md` adds user-facing local memory controls to R1 scope and success criteria.

## Remaining Risks

1. **No mobile-width visual pass yet** — desktop user-mode layout is acceptable, but small viewport behavior should be checked before UI polish claims.
2. **No browser click-path with non-empty care notes yet** — tests cover non-empty rendering, but manual browser seeding was blocked by browser safety around localStorage evaluation.
3. **Single-note delete deferred** — this is correct for now; adding it later must avoid showing raw `memoryId`.
4. **Developer mode still intentionally exposes internals** — future changes must preserve the explicit developer/user branch.

## Recommendation

Mark User-Facing Memory Controls V0 as closed for R1.

Next safe choices:

1. short mobile-width browser QA pass for the `照顾笔记` card;
2. evaluate whether memory controls should be referenced from a product-facing README/demo runbook;
3. only after a measured memory failure appears, consider the next R1 research slice. Do not jump to Graph Memory, embeddings, vector DB, or reranking without evidence.
