# SAGE Memory Principles For Avaloka

Processing Status: Runtime promoted for R1 SAGE Lite memory experiments.

This derived note translates the SAGE paper into Avaloka's local memory rules.

## Principle 1: Memory Is Not Transcript

Avaloka must not use long-term memory as a place to store raw emotional transcripts.

Good memory:

- "User prefers short body-grounded responses."
- "When illness fear appears, avoid punishment or debt framing."

Bad memory:

- a full pasted conversation
- specific private details
- diagnosis-like conclusions

## Principle 2: Writer And Reader Are Separate

The Memory Writer decides what might be worth saving.

The Memory Reader decides what is relevant now.

Do not collapse these into one vague LLM prompt. Separate modules make the system easier to test, debug, and improve.

## Principle 3: Every Memory Needs Evidence

A memory candidate without source evidence must be rejected.

Allowed evidence:

- turn IDs
- feedback IDs
- explicit user feedback
- repeated confirmed patterns

Not allowed:

- model intuition
- personality speculation
- inferred spiritual meaning

## Principle 4: Sparse Memory Beats Large Memory

If a memory does not improve future care, safety, or retrieval, do not save it.

Avaloka should prefer 3 useful care facts over 300 lines of history.

## Principle 5: Guardian Before Storage

Memory is dangerous if it preserves the wrong thing.

Memory Guardian must reject:

- medical claims
- crisis means
- revenge plans
- karma-blame
- identity details
- raw transcripts
- unsupported personality labels

## Principle 6: Retrieval Must Be Small

Runtime prompt injection should use only 3-5 care facts.

Never inject:

- raw transcripts
- source IDs
- private logs
- hidden scores
- speculative claims
- full memory graphs

## Principle 7: Feedback Becomes Learning Signal

User feedback should improve:

- what gets saved
- what gets rejected
- which facts are retrieved
- which response moves are selected

Feedback should not become invasive profiling.

## Current Runtime Translation

R1 starts with:

- `MemoryCandidate`
- `guardMemoryCandidate`
- `selectCareFacts`
- `evals/sage-memory-cases.json`

This is SAGE Lite, not full SAGE reproduction.
