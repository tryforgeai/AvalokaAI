# User-Facing Memory Controls Demo Runbook

Status: Active R1 demo runbook
Last updated: 2026-08-01

## Purpose

This runbook shows how to demo Avaloka's User-Facing Memory Controls V0 without exposing developer memory diagnostics.

The demo should make one point clear:

> Avaloka memory is a small local set of care notes, not a dossier about the user.

## Prerequisites

From `app/`:

```bash
npm install
npm run dev
```

Open normal user mode:

```text
http://127.0.0.1:5173/
```

Developer diagnostics, if needed for comparison only:

```text
http://127.0.0.1:5173/?dev=1
```

Do not demo developer mode as the ordinary memory-management surface.

## Normal User Demo Flow

1. Open user mode.
2. Accept the local consent screen.
3. Find the `照顾笔记` card in the right-side panel on desktop, or below the chat composer on mobile width.
4. Confirm the empty state:

   ```text
   记忆已开启
   现在还没有保存的照顾笔记
   暂停记忆
   导出照顾笔记
   清空照顾笔记
   ```

5. Click `暂停记忆`.
6. Confirm the status changes to:

   ```text
   记忆已暂停
   继续记住
   ```

7. Click `继续记住`.
8. Confirm the status returns to:

   ```text
   记忆已开启
   暂停记忆
   ```

9. Click `导出照顾笔记`.
10. Confirm the fallback export panel uses plain user language:

    ```text
    Care notes
    照顾笔记导出
    # Avaloka remembered care notes
    Memory status: on
    These are the short care notes Avaloka uses on this device to remember what kind of support may feel helpful.
    ```

11. Click `清空照顾笔记`.
12. Confirm there is no crash and the card remains in a safe empty state.

## What Must Not Appear In User Mode

The normal user surface must not display raw developer artifacts or developer vocabulary such as:

```text
memoryId
candidateId
evidenceIds
confidence
internal tags
lifecycleReviewQueue
retrieval_trace_v1
memory_claim_grounding_v0
guardian
hidden prompts
model/routing labels
internal IDs
scores
evidence
developer review data
```

Developer diagnostics may still expose these behind `?dev=1`, but ordinary user mode must not.

## Destructive Action Boundary

The `清空照顾笔记` action must use the memory-only clear path:

```text
clearCareMemories()
```

It must not call broad local data clear:

```text
clearAvalokaData()
```

Expected behavior:

- clears Care Card memory state;
- preserves messages;
- preserves feedback;
- preserves memory write status.

## Mobile-Width QA Checklist

Use a viewport around `390 x 844`.

Expected mobile behavior:

- layout collapses to one column;
- no horizontal overflow;
- chat composer and send button remain visible and usable;
- `照顾笔记` appears below the privacy card;
- status pill remains inside the card;
- pause/export/clear buttons wrap without clipping;
- care-note export panel remains readable;
- no console errors.

Known accepted limitation as of 2026-08-01:

- Browser QA has covered empty-state mobile interactions.
- Non-empty saved care-note rendering is covered by server-rendered UI tests, but direct browser localStorage seeding was blocked by browser safety settings.

## Verification Commands

Run from `app/` after changes to this surface:

```bash
npm run content:check
npx vitest run src/lib/userFacingMemory.test.ts src/lib/userFacingMemoryControlsUi.test.tsx src/lib/storage.test.ts src/lib/uiMode.test.ts
npm test
npm run coverage
npm run build
```

For verifier-compatible focused checks, create a temporary `hermes-verify-*` script under the OS temp directory and include marker checks for:

- `照顾笔记` user-mode UI;
- no-internal-vocabulary export assertions;
- README link to this runbook;
- mobile QA report markers if applicable.

## Related Documents

- `docs/research/user-facing-memory-controls-design.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-post-implementation-audit.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-browser-qa.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-post-push-review.md`
