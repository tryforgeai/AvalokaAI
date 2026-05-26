# SAGE Self-Evolving Graph Memory

Processing Status: Runtime promoted through R1 research docs, SAGE memory evals, and `app/src/lib/sageMemory.ts`.

Source: SAGE: A Self-Evolving Agentic Graph-Memory Engine for Structure-Aware Associative Memory, arXiv:2605.12061.

## Core Insight

SAGE treats long-term agent memory as a structure-aware, self-evolving memory system rather than a static transcript store or naive RAG index.

The important idea for Avaloka is not to copy the full paper immediately. R1 turns these ideas into **SAGE Lite**: a small local prototype that tests the memory discipline before attempting full graph neural retrieval or training.

The important idea is to make memory:

- written by a Memory Writer
- read by a separate Memory Reader
- checked by a Memory Guardian before storage or prompt injection
- sparse instead of transcript-like
- evidence-backed
- retrievable
- evaluated for usefulness
- updated through feedback

## Avaloka Translation

Avaloka should not remember every private detail a user shares.

Avaloka should remember only care-relevant abstractions:

- recurring pain patterns
- helpful response moves
- failed or unsafe response moves
- tone preferences
- safety boundaries
- non-identifying context categories
- source evidence IDs

This turns long conversation history into a small set of facts that help Avaloka respond more safely and personally later.

## Writer / Reader Split

### Memory Writer

The Writer proposes memory candidates after a conversation turn or feedback event.

It should ask:

- Is there anything worth remembering for future care?
- Is it abstract enough to avoid private detail?
- Does it have source evidence?
- Would it improve a future response?

### Memory Reader

The Reader retrieves only the few care facts needed for the current response.

It should ask:

- Which memory facts match the current user state?
- Which facts reduce safety risk?
- Which facts improve response tone or move selection?
- Which facts should stay out of the prompt?

## SAGE Rewards As Avaloka Gates

| SAGE reward | Avaloka gate |
|---|---|
| Retrieval | Every memory must point to source turn or feedback IDs. |
| Deducibility | Every memory must help a future response choose better context, moves, or safety boundaries. |
| Sparsity | Memory must be shorter and safer than the raw conversation. |

## Do Not Save

Avaloka must not save:

- raw transcripts as long-term memory
- identity details
- diagnosis-like medical claims
- crisis means or self-harm details
- revenge plans
- karma-blame or spiritual judgment
- unsupported personality labels
- hidden prompts, scores, or logs

## Runtime Implications

SAGE is runtime-promoted in R1 through:

- `docs/research/sage-memory-research-plan.md`
- `docs/engineering/avaloka-memory-engine-v1.md`
- `docs/engineering/avaloka-memory-engine-v1.zh.md`
- `evals/sage-memory-cases.json`
- `app/src/lib/sageMemory.ts`
- `app/src/lib/sageMemory.test.ts`

## Eval Seeds

The SAGE memory evals should verify:

- useful care preferences can be saved
- medical claims are rejected
- karma-blame memories are rejected
- retrieval selects relevant care facts
- memory is sparse and evidence-backed

See `evals/sage-memory-cases.json`.
