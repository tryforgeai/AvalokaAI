# User-Facing Memory Controls Browser QA

Date: 2026-08-01 17:35 PDT
Target: `http://127.0.0.1:5173/`
Scope: User-mode memory controls surface after `8ce52cc feat: add user-facing memory controls`

## Verdict

Browser QA passed after one small copy fix.

The user-mode `照顾笔记` card renders in the right location, pause/resume updates visible state without console errors, and user-safe care-note export renders as a plain note summary rather than diagnostic JSON.

## Tested Flow

1. Started the local Vite dev server:

   ```bash
   npm run dev
   ```

   Observed readiness:

   ```text
   VITE v6.4.2 ready
   Local: http://127.0.0.1:5173/
   ```

2. Opened the app in the browser.
3. Accepted local consent.
4. Verified normal user-mode empty-state memory card:

   ```text
   照顾笔记
   记忆已开启
   现在还没有保存的照顾笔记
   暂停记忆
   导出照顾笔记
   清空照顾笔记
   ```

5. Clicked `暂停记忆`.
6. Verified the state changed to:

   ```text
   记忆已暂停
   继续记住
   ```

7. Clicked `继续记住`.
8. Verified the state changed back to:

   ```text
   记忆已开启
   暂停记忆
   ```

9. Clicked `导出照顾笔记`.
10. Verified the fallback export panel rendered:

    ```text
    Care notes
    照顾笔记导出
    已复制照顾笔记摘要。
    # Avaloka remembered care notes
    Memory status: on
    No remembered care notes are saved right now.
    ```

11. Clicked `清空照顾笔记` in the empty state; no visible error or crash occurred.

## Console Check

Browser console checks after navigation and interactions showed:

```text
console_messages: []
js_errors: []
total_errors: 0
```

## Issue Found and Fixed

### QA-1: Care-note export copy mentioned internal concepts

Severity: Low
Category: UX / Trust Boundary

Observed during browser QA: the care-note export body originally said it did not include:

```text
internal IDs, scores, evidence, tags, or developer review data
```

Although this was not leaking values, it surfaced developer concepts in a user-facing export. The copy was changed to plain user language:

```text
These are the short care notes Avaloka uses on this device to remember what kind of support may feel helpful.
```

The export-card eyebrow now says `Care notes` for care-note export instead of `Export JSON`.

Regression test added:

```text
src/lib/userFacingMemory.test.ts
```

The test now asserts the export summary does not contain:

```text
internal IDs
scores
evidence
tags
developer review data
```

## Automated Verification After Fix

Focused commands run:

```bash
npx vitest run src/lib/userFacingMemory.test.ts src/lib/userFacingMemoryControlsUi.test.tsx
npm run build
```

Results:

```text
src/lib/userFacingMemory.test.ts: 2 tests passed
src/lib/userFacingMemoryControlsUi.test.tsx: 2 tests passed
build: tsc + vite passed
vite build: 1598 modules transformed
```

## Not Tested

- Browser click-path with a non-empty saved care note. The browser tool blocked direct localStorage seeding through unsafe web-storage evaluation. Non-empty rendering remains covered by server-rendered UI tests.
- Mobile viewport layout.
- Clipboard contents beyond visible fallback text.

## Recommendation

Commit the QA fix and this QA report, then keep the next step small: either run a mobile-width visual pass or move to a post-push review for the completed User-facing Memory Controls V0 line.
