# Avaloka AI Version Roadmap

Status: Active source of truth

## Version Authority

If documents conflict, follow this order:

1. Latest accepted decision in `docs/decisions/decision-log.md`
2. Current active version in this file
3. Final vision in `docs/product/product-vision.md`
4. Research plans, engineering docs, runbooks, specs, and eval plans
5. Archived documents only when explicitly requested

## Current Active Version

| Field | Value |
|---|---|
| Version | R1 |
| Name | SAGE Memory Research Prototype |
| Stage | Research-first local prototype |
| Goal | Turn SAGE-style long-term memory into a runnable Avaloka experiment |
| Primary scenario | Long-term compassionate companion memory for emotionally vulnerable low moments |
| Primary artifact | Local SAGE Lite pipeline with Memory Writer, Memory Guardian, Graph/Care Memory Store, Memory Reader, response injection, and evals |
| Research plan | `docs/research/sage-memory-research-plan.md` |
| Memory design | `docs/engineering/avaloka-memory-engine-v1.md` / `docs/engineering/avaloka-memory-engine-v1.zh.md` |
| Active execution plan | `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md` |

### R1 Entry Context

R1 starts because the founder changed Avaloka's purpose from commercial MVP validation to foundational AI research and implementation practice.

The prior V0/V1 work remains useful because it supplies:

- a hard emotional companion test scenario
- validated examples of low-moment user pain
- a local app and LLM orchestration surface
- existing safety gates, Baifa Mapper, Compassion OS, Guardian, and eval patterns
- real response failures that can become memory and retrieval test cases

### R1 In Scope

- SAGE-style architecture research
- SAGE Lite implementation plan
- Memory Writer candidate extraction
- Memory Guardian rejection rules
- Care Card and graph-memory schema experiments
- deterministic Memory Reader prototype
- formal Memory Reader retrieval baseline with Recall@k, MRR, NDCG@k, no-match, privacy, stale-memory, and latency measures
- Retrieval Failure Mining V0 over the deterministic Memory Reader benchmark before heavier graph/vector/reranker retrieval work
- Ranking Trace Inspection V0 for low-rank-quality passing cases before changing reader scoring or fixture relevance
- duplicate tag normalization before Memory Reader scoring so repeated memory tags do not inflate relevance
- risk-kind fixture policy alignment so matching avoid-response memories outrank generic helpful moves in risk contexts without changing reader scoring
- harder retrieval fixture expansion for adversarial paraphrase, surface-overlap hard negatives, temporal conflicts, and user-control lifecycle cases
- separate cross-lingual / no-tag recall-gap probe showing measured deterministic misses before embedding work
- gated semantic recall spike, off by default, proving no-tag probe recovery without committing to production embeddings or vector DB
- semantic recall false-positive and reranking guard fixtures proving no-match precision and highest-weight-first ordering under the semantic spike
- semantic recall lifecycle stress fixtures proving low-confidence, superseded, deleted, and missing-evidence semantic matches remain blocked
- semantic recall promotion readiness review keeping semantic recall default-off and rejecting production promotion until privacy, lifecycle, export/delete, and response-quality gates are proven
- eval-only semantic candidate lane spike comparing a second gated semantic matcher against current tag expansion without production vectors, graph memory, or user-facing retrieval
- versioned, redacted retrieval traces for developer diagnosis
- optional LLM Memory Writer shadow test
- response injection with 3-5 care facts
- claim-level evidence grounding in shadow mode before reversible enforcement
- fallback enforcement for unsupported personal-memory claims before any safer rewrite policy
- extraction, rejection, retrieval, response, and privacy evals
- developer-mode diagnostics for memory experiments
- developer-mode durable Memory Lifecycle Review Queue V0 for allowed/rejected/superseded/deleted decisions
- user-facing local memory controls for sanitized care notes, pause/resume, user-safe export, and memory-only clear
- local-first data storage and export/clear support
- preserving current safety and response-quality gates

### R1 Out Of Scope

- payment test
- commercial launch
- account system
- community
- broad user acquisition
- full RAG over large wisdom corpora
- production graph database unless simple JSON/SQLite proves insufficient
- graph neural network reader
- GRPO training loop
- fine-tuning
- production privacy policy or compliance program
- medical, therapy, or crisis-service positioning

### R1 Success Criteria

R1 passes if:

- a local SAGE Lite pipeline can extract, reject, store, retrieve, and inject memory candidates in developer mode
- every saved memory is sparse, evidence-backed, exportable, and clearable
- Memory Guardian rejects private, medical, crisis, revenge, karma-blame, and speculative memory candidates
- retrieval can select relevant care facts for a future turn
- the deterministic reader has a reproducible gold-set baseline and returns zero private, deleted, superseded, or stale memories
- retrieval failure mining can report failed cases, pressure signals, group pass/fail counts, and conservative next-step recommendations before heavier retrieval architecture is proposed
- ranking trace inspection can explain low-NDCG passing cases with trace evidence before reranking, embeddings, graph memory, or scoring changes are proposed
- duplicate memory tags do not inflate reader score, matched tag count, or redacted trace matchedTags
- risk-kind fixture relevance agrees with the safety policy that concrete avoid-response hazards can outrank generic helpful moves in active risk contexts
- the deterministic Memory Reader benchmark includes at least 48 cases and harder fixture classes before heavier retrieval architecture is proposed
- the cross-lingual / no-tag probe remains separate from the committed benchmark gate and records current `1/6` probe recall as evidence for a bounded embedding recall spike
- semantic recall spike mode improves the no-tag probe from `1/6` to `6/6` while the committed benchmark remains `48/48`
- semantic recall guard benchmark passes `6/6`, keeps no-match precision at `1.000`, and asserts grade-2/highest-weight memories rank first
- semantic recall lifecycle stress benchmark passes `4/4` and verifies lifecycle-blocked semantic matches retrieve nothing
- semantic recall promotion readiness review rejects production promotion and limits the next step to an eval-only candidate-lane spike
- semantic candidate lane spike improves its separate probe from `2/4` to `4/4` while committed, no-tag, guard, and lifecycle gates remain green
- personal-memory and health/safety claims can be checked against permitted evidence without treating ordinary compassion as a factual claim
- unsupported personal-memory claims cannot reach user-visible output without fallback or an approved rewrite policy
- memory lifecycle decisions are reviewable in developer exports/diagnostics before any user-facing memory surface
- response evals show memory improves personalization without creepiness
- existing crisis, guardian, prompt-injection, and response-quality gates still pass
- no user-facing UI exposes hidden memory logic, scores, prompts, or private logs
- ordinary users can inspect, pause, export, and clear remembered care notes without exposing developer diagnostics

## Previous Active Product Versions

These versions are historical product-validation context, not the current roadmap.

| Version | Stage | Result | Notes |
|---|---|---|---|
| V0 | User discovery + 7-day free validation | Passed first validation round | Report: `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md` |
| V1 | Local MVP preparation after V0 validation | Paused as commercial product track | Local app remains the research demo surface |

### V0 Result Summary

- 5/5 users recruited
- 4/5 users used Avaloka for at least 4 days
- 3/5 users opened Avaloka during real low moments without prompting
- 3/5 users wanted to continue after Day 7
- 2/5 users were willing to recommend Avaloka to a similar person
- 0 serious safety or positioning incidents

### V1 Artifacts Kept For Research

- local chat UI with user/developer modes
- LLM Orchestrator V2
- Baifa Mapper
- Compassion OS
- Guardian checks
- V1 response library
- feedback export format
- prompt registry
- eval gates

## Future Research Versions

| Version | Hypothesis | Do Not Start Until |
|---|---|---|
| R2 | Graph Memory Prototype improves retrieval over flat Care Card memory | R1 proves extraction/rejection/retrieval/response evals locally |
| R3 | Reader/Writer feedback loop improves memory sparsity and usefulness | R2 has enough memory failure cases |
| R4 | Learned or model-assisted reader improves multi-hop retrieval | Deterministic reader limits are clearly measured |
| R5 | Transferable memory/safety harness can support other AI projects | Avaloka memory harness is stable and documented |

## Deferred Product Ideas

These are not active commitments:

- paid subscription
- mobile app
- voice companion
- guided audio
- community
- multi-user accounts
- AI-to-human referral network
- launch or growth funnel

## Deferred Research Ideas

These are not active commitments until earlier phases justify them:

- full SAGE paper reproduction
- graph neural network retrieval
- GRPO or RL training
- fine-tuning
- production graph database
- full RAG over large wisdom corpora
- large-scale private user memory
