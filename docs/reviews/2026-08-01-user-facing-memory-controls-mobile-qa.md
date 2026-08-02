# User-Facing Memory Controls Mobile-Width QA

Date: 2026-08-01 17:52 PDT
Target: `http://127.0.0.1:5173/`
Viewport: `390 x 844`
Scope: User-mode `照顾笔记` card after User-Facing Memory Controls V0 post-push review

## Verdict

Mobile-width QA passed.

The user-mode memory controls collapse into the single-column mobile layout without horizontal overflow. The `照顾笔记` card remains readable, the pause/resume/export controls are visible and usable, and care-note export continues to use plain user language without internal diagnostic vocabulary.

## Execution Notes

The browser tool could not directly resize its viewport, so the mobile pass used a temporary Playwright QA spec with a 390px-wide viewport.

The first Playwright attempt exposed only test-harness issues, not product issues:

1. `@playwright/test` was not installed in the app project.
2. Playwright browsers had not been downloaded on this machine.
3. The initial assertion for `Care notes` was too broad because the text appears both in the eyebrow and in the export textarea.

Resolution:

- used a temporary Playwright project under the OS temp directory;
- installed Playwright Chromium into the user cache;
- tightened the assertion to `.export-card .eyebrow`.

No app code change was required for mobile layout.

## Tested Flow

1. Start local Vite dev server:

   ```bash
   npm run dev
   ```

2. Run the mobile QA spec at viewport `390 x 844`.
3. Accept local consent.
4. Verify `照顾笔记` appears in user mode.
5. Verify initial status:

   ```text
   记忆已开启
   暂停记忆
   ```

6. Click `暂停记忆`.
7. Verify paused state:

   ```text
   记忆已暂停
   继续记住
   ```

8. Click `继续记住`.
9. Click `导出照顾笔记`.
10. Verify export panel:

    ```text
    Care notes
    照顾笔记导出
    These are the short care notes Avaloka uses on this device to remember what kind of support may feel helpful.
    ```

11. Assert the export surface does not contain:

    ```text
    internal IDs
    developer review data
    ```

12. Assert no horizontal overflow.
13. Assert no console warnings/errors and no page errors.

## Playwright Result

```text
mobile_memory_controls_browser_qa_passed
metrics:
  innerWidth: 390
  bodyScrollWidth: 390
  docScrollWidth: 390
  shellColumns: 390px
  careCardWidth: 350
1 passed
```

Console/page error checks:

```text
consoleMessages: []
pageErrors: []
```

## Visual Inspection

Screenshot reviewed:

```text
/var/folders/sz/nlnbbrjs559840bm8cm67lr40000gn/T/hermes-avaloka-mobile-memory-controls.png
```

Visual findings:

- no visible horizontal overflow;
- no clipped memory-control buttons;
- header toolbar remains visible;
- composer textarea and send button stack correctly;
- feedback/privacy/memory/export cards stack in a single column;
- `记忆已开启` status pill stays inside the `照顾笔记` card;
- pause/export/clear buttons wrap cleanly;
- export textarea is readable within the card;
- no memory IDs, evidence IDs, confidence scores, tags, review queue, guardian, retrieval trace, or claim-grounding internals are visible.

## Not Tested

- Non-empty saved care-note click-path in a real browser. Direct browser localStorage seeding remains blocked by the browser tool's unsafe web-storage guard.
- Multiple mobile widths beyond 390px.
- Physical device browser rendering.

## Recommendation

No mobile layout fix is needed for User-Facing Memory Controls V0.

Keep the next UI changes small. If single-note delete is later added, repeat this mobile pass and verify it does not expose raw memory IDs or internal handles.
