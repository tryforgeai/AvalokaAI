# Secular Buddhism Podcast Ingestion Checklist

Use this checklist for every podcast episode added to this directory.

## Required

- [ ] The file does not contain the full transcript.
- [ ] The source URL is included.
- [ ] The core insight is translated into Avaloka product language.
- [ ] User pain patterns are identified.
- [ ] Response moves are listed.
- [ ] Unsafe or doctrinal user-facing phrases are listed under `Do Not Say`.
- [ ] At least one eval seed is included in the note.
- [ ] `evals/wisdom-response-cases.json` is updated.

## Runtime Promotion

Check these only if the episode changes demo behavior.

- [ ] Runtime mapper data is updated.
- [ ] Response logic is updated.
- [ ] Debug panel output is still meaningful.
- [ ] Exported message data includes the new internal signals.
- [ ] Mapper test is added or updated.
- [ ] Response test is added or updated.

## Verification

- [ ] `cd app && npm run content:check`
- [ ] `cd app && npm test`
- [ ] `cd app && npm run coverage` with all thresholds at 80% or higher
- [ ] `cd app && npm run build`
