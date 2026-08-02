# User-Facing Memory Controls Post-Implementation Audit

Date: 2026-08-01 17:24 PDT
Scope reviewed: User-facing Memory Controls Slice 4 plus completed Slices 1-3
Branch state during audit: local working tree after implementation, before commit

## Verdict

User-facing Memory Controls V0 is ready to commit.

The implementation adds a small user-mode "照顾笔记" surface without turning Avaloka into a memory dashboard. It uses the sanitized projection helper, keeps destructive memory-only clearing separate from broad local-data clearing, and keeps developer review queue internals behind explicit developer mode.

## What Is Now Implemented

Implementation status:

```text
Slice 1: sanitized projection helper — implemented
Slice 2: memory write pause setting — implemented
Slice 3: memory-only clear helper — implemented
Slice 4: small user-mode UI surface — implemented
```

User-mode UI now exposes:

- memory status: `记忆已开启` / `记忆已暂停`;
- sanitized remembered care notes;
- pause / resume memory writes;
- export user-safe care notes;
- clear care notes only.

It does not expose single-note delete yet. That remains intentionally deferred because user-mode single-note delete needs careful hidden-handle behavior to avoid leaking `memoryId`.

## Files Reviewed

- `app/src/App.tsx`
- `app/src/styles.css`
- `app/src/lib/userFacingMemoryControlsUi.test.tsx`
- `app/src/lib/userFacingMemory.ts`
- `app/src/lib/storage.ts`
- `docs/research/user-facing-memory-controls-design.md`

## User/Developer Boundary Review

### User Mode

The user-facing memory card is rendered outside the developer-mode branch and uses the sanitized note projection:

```text
toUserFacingCareNotes(loadCareCard())
```

The rendered user-mode fields are limited to:

- heading;
- display text;
- last-updated label;
- memory write status;
- safe action labels.

The user-mode controls call:

- `pauseMemoryWrites()`;
- `resumeMemoryWrites()`;
- `clearCareMemories()`;
- `exportUserFacingCareNotes(...)`.

### Developer Mode

Developer-only memory internals remain in the explicit developer-mode panel:

- Care Card inspector;
- memory IDs;
- confidence scores;
- evidence counts;
- internal tags;
- lifecycle review queue summaries;
- latest candidate IDs;
- retrieval / claim-grounding diagnostics.

These are still gated behind `?dev=1` or `?mode=dev`.

## Leak Check

The new focused UI test renders App in normal user mode and asserts that remembered care notes appear while internal artifacts do not appear.

Forbidden user-mode terms checked by the test include:

```text
memory-hidden-tone
feedback-hidden-1
confidence
body_grounding
lifecycleReviewQueue
memory_claim_grounding_v0
retrieval_trace_v1
guardian
```

The test also confirms the default user mode does not render:

```text
Developer testing only
review queue
```

## Destructive Action Scope

The user-facing clear action calls:

```text
clearCareMemories()
```

It does **not** call:

```text
clearAvalokaData()
```

Therefore `清空照顾笔记` clears Care Card memory state without clearing messages or feedback. This is consistent with the design spec and avoids misleading destructive copy.

The broader toolbar trash action still calls `clearAvalokaData()` and remains explicitly worded as clearing Avaloka conversation, feedback, and local memory records.

## Verification Evidence

Commands run from `app/`:

```bash
npm run content:check
npx vitest run src/lib/userFacingMemoryControlsUi.test.tsx src/lib/userFacingMemory.test.ts src/lib/storage.test.ts src/lib/uiMode.test.ts
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

## Remaining Risks

1. **No browser interaction test yet** — current UI verification uses server-rendered markup and unit tests. It proves rendered copy and no obvious internal string leaks, but it does not click buttons in a browser.
2. **Single-note delete deferred** — this is intentional. Adding it later should use hidden handles and no displayed `memoryId`.
3. **User-safe export is copied through browser clipboard when available** — if clipboard is unavailable, the fallback textarea displays the safe summary. The label still uses the existing export-card structure, so future polish may split JSON export and care-note export surfaces.
4. **No visual review by user yet** — styling is deliberately minimal and consistent with existing cards, but visual acceptance should happen before expanding UI complexity.

## Recommendation

Commit and push Slice 4 together with this audit.

After this, the next safe step is a short browser/manual QA pass of the memory controls surface, then decide whether to add a small post-push review or proceed to another research slice.
