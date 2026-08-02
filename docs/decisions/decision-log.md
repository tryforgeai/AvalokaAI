# Avaloka AI Decision Log

Status: Active source of truth

If active documents conflict, follow the newest accepted decision here, then update affected docs.

## 2026-08-01 — Add Ranking Trace Inspection V0 For Reader Pressure Cases

Status: Accepted

### Context

Retrieval Failure Mining V0 found no failed deterministic Memory Reader cases and
no unsafe, stale, deleted, or superseded retrieval leaks. It did find four
passing cases with lower rank quality (`ndcg@5 = 0.797`), so the next step is to
inspect trace evidence rather than add a reranker, embeddings, graph memory, or
vector storage.

### Decision

Add Ranking Trace Inspection V0 as a lightweight analysis layer over the existing
memory-reader benchmark trace output.

The inspector reports:

- low-NDCG passing cases;
- retrieved order versus expected relevance grades;
- top selected memory versus best expected memory;
- matched tags, score, kind, and retrieval reasons;
- root-cause classes for ranking pressure.

### Rationale

Trace evidence shows current ranking pressure is explainable without heavier
retrieval architecture. Two cases are duplicate-tag score inflation, and two
cases are risk-kind boost outranking fixture relevance. These are deterministic
scoring/fixture questions, not evidence that semantic retrieval or graph memory
is required.

### Consequences

- `npm run eval:memory:reader:ranking` becomes the diagnostic command for
  ranking-pressure cases.
- Duplicate memory tags should be normalized or fixture tags corrected before
  changing the reader scoring model.
- Risk-kind boost should be treated as a policy decision: either accept it and
  update fixture relevance, or change deterministic scoring with a targeted RED
  test.
- Do not add reranking, embeddings, vector DB, or graph memory for the current
  pressure signal.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/research/ranking-trace-inspection-v0-report.md`

## 2026-08-01 — Add Retrieval Failure Mining V0 Before Heavier Memory Retrieval

Status: Accepted

### Context

R1 now has a deterministic Memory Reader benchmark, RetrievalTraceV1, Claim
Grounding V0, lifecycle review, and user-facing memory controls. The reader
baseline is strong, so moving directly to embeddings, vector storage, graph
memory, reranking, or a complex memory dashboard would add architecture before a
measured failure demands it.

### Decision

Add Retrieval Failure Mining V0 as a lightweight benchmark analysis layer over
the existing memory-reader benchmark.

The miner reports:

- aggregate retrieval metrics;
- failed cases and failure taxonomy;
- group-level pass/fail counts;
- pressure signals, including low-rank-quality passed cases;
- conservative next-step recommendations.

### Rationale

R1 should first learn where deterministic retrieval actually bends. A failing or
pressure-case fixture is better evidence than an assumed need for graph/vector
retrieval. If the committed benchmark still passes with no unsafe or stale leaks,
the next slice should mine harder fixtures and inspect ranking traces before
adding retrieval architecture.

### Consequences

- `npm run eval:memory:reader:failures` becomes the first diagnostic command
  before proposing embeddings, graph memory, vector DB, reranking, or dashboard
  work.
- Embedding or graph spikes should require a concrete retrieval-failure class,
  not just architectural appeal.
- Current pressure is ranking quality in four passing cases, not recall, safety,
  stale, deleted, or superseded retrieval failure.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/retrieval-failure-mining-v0-report.md`

## 2026-08-01 — Add User-Facing Memory Controls V0

Status: Accepted

### Context

R1 now has a developer-mode Memory Lifecycle Review Queue V0, sanitized memory
projection helpers, memory write pause semantics, and memory-only clear support.
The remaining trust gap is that ordinary users need a small local surface to see
and control care notes without seeing developer memory diagnostics.

### Decision

Add User-Facing Memory Controls V0 as a small local user-mode surface for
remembered care notes.

The surface exposes only:

- user-safe care note headings and display text
- memory write status (`on` / `paused`)
- pause / resume memory writes
- export user-safe care notes
- clear care notes only

It does not expose single-note delete yet. Single-note delete remains deferred
until the UI can support hidden handles without displaying raw memory IDs.

### Rationale

Avaloka memory should feel like a small local note about what kind of care helps,
not a dossier about the user's life. A user-facing surface must therefore use the
sanitized projection/export contract and avoid developer vocabulary as well as
raw developer values.

### Consequences

- User mode must not expose memory IDs, evidence IDs, confidence scores,
  internal tags, review queues, retrieval traces, claim-grounding internals,
  guardian reasons, hidden prompts, or model/routing labels.
- Care-note export must use plain user language and avoid naming hidden
  diagnostic concepts as user-facing disclaimers.
- `清空照顾笔记` must call the memory-only clear path, not broad local data clear.
- Developer diagnostics may keep raw review and grounding details behind explicit
  developer mode.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/user-facing-memory-controls-design.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-post-implementation-audit.md`
- `docs/reviews/2026-08-01-user-facing-memory-controls-browser-qa.md`

## 2026-07-28 — Add Developer-Mode Durable Memory Lifecycle Review Queue V0

Status: Accepted

### Context

R1 has a local Care Card Store V0, deterministic Memory Reader benchmark,
RetrievalTraceV1, Claim Grounding V0, and fallback enforcement for unsupported
personal-memory claims. The remaining governance gap is that allowed, rejected,
superseded, and deleted memory decisions are not yet visible as one durable review
trail beyond raw Care Card state and lifecycle events.

### Decision

Add a local, developer-mode Memory Lifecycle Review Queue V0 to the Care Card
export/diagnostic contract.

The queue records review items for:

- allowed writer candidates
- rejected writer candidates
- superseded memories
- deleted memories

Each item records candidate/memory identifiers, action, status, timestamps,
memory kind, redaction-aware memory text for developer inspection, guardian or
developer action reasons, evidence count, and tags. It remains local and
developer-oriented.

### Rationale

Memory governance should become observable before adding graph or embedding
retrieval complexity. A durable review queue lets R1 inspect how memories enter,
leave, or change state without exposing hidden review internals to user mode.

### Consequences

- Export summaries include lifecycle review counts.
- Developer memory reports include lifecycle review queue counts and recent items.
- Existing delete/supersede lifecycle events remain for backward compatibility.
- The queue is not a user-facing memory-management surface.
- User mode must still not expose memory IDs, evidence IDs, scores, tags, or
  hidden lifecycle review logic.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/r1-memory-gap-report.md`
- `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

## 2026-07-26 — Fall Back On Unsupported Personal-Memory Claims

Status: Accepted

### Context

R1 now has deterministic Memory Reader metrics, a privacy-safe gold dataset,
RetrievalTraceV1, and Claim Grounding V0. The response path can detect explicit
personal-memory claims such as "我记得你..." or "you told me before..." and mark
them unsupported when the current retrieved care facts do not support them.

Leaving those warnings as developer-only diagnostics would still allow a V2
response to show unsupported personal-history claims to the user.

### Decision

When a ready V2 candidate contains any unsupported personal-memory claim, Avaloka
must use the existing local baseline as the user-visible response and set:

```text
responseSource = local_claim_grounding_fallback
```

The original V2 `candidateText` and `memoryClaimGrounding` result remain in
developer diagnostics/export for diagnosis. Supported memory claims and responses
with no memory claims may continue to use the V2 candidate text.

Do not add deterministic text surgery as the first enforcement step. A safer
rewrite policy may be designed later with fixtures and eval evidence.

### Rationale

Unsupported personal-memory claims are more damaging than ordinary generic
hallucinations because they imply Avaloka remembers the user incorrectly. A
conservative fallback preserves safety and trust while keeping the rejected V2
candidate observable for research.

### Consequences

- `local_claim_grounding_fallback` is part of the response-source contract.
- Export summaries count claim-grounding fallback interventions.
- User mode still does not expose claim IDs, memory IDs, evidence IDs, scores,
  tags, or hidden grounding logic.
- Future rewrite work must prove it is safer than fallback before becoming
  user-visible.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/research/r1-memory-gap-report.md`
- `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

## 2026-07-26 — Measure Retrieval And Ground Claims Before Adding Advanced RAG

Status: Accepted

### Context

The enterprise RAG bootcamp labs demonstrate relevance classifiers, semantic and
late chunking, Qdrant, response grounding, GraphRAG, MemGraphRAG, and guardrail
pipelines. Avaloka already has a deterministic Memory Reader, Care Card
lifecycle, safety gates, response Guardian, and memory eval fixtures, but it
does not yet have formal retrieval metrics or claim-level evidence checking.

Most bootcamp lab source files are training material with explicit reuse
restrictions. Their methods can inform Avaloka, but their source code must not be
copied into this repository without written permission.

### Decision

Keep Avaloka R1 in the existing TypeScript/Node stack and execute:

1. a gold-set benchmark of the unchanged deterministic Memory Reader
2. a versioned, redacted retrieval trace
3. claim and evidence contracts
4. a shadow claim-grounding evaluator
5. reversible enforcement only after eval targets pass
6. evidence-driven selection of any later embedding, hybrid, reranking, or graph
   experiment

Do not add Qdrant, a Python service, a production graph database, ModernBERT
fine-tuning, Microsoft GraphRAG, or RAPTOR during this plan.

### Rationale

Avaloka cannot know whether advanced retrieval is useful until the current reader
has a measured baseline. Claim-level grounding addresses a nearer safety gap:
the existing Guardian can reject unsafe tone and policy violations, but it does
not prove that personal-history or health-sensitive claims are supported by
permitted evidence.

This order preserves reversibility, keeps failures attributable, and prevents
new infrastructure from entering the emotionally sensitive runtime without
evidence.

### Consequences

- Graph Memory Schema V0 is no longer the immediate next slice.
- R2 graph work requires measured relationship or multi-hop failures.
- Bootcamp lab code remains a read-only learning reference.
- Claim grounding starts in shadow mode and uses an off/shadow/enforce rollback
  switch.
- Retrieval and grounding eval results become gates for architecture changes.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/research/r1-memory-gap-report.md`
- `docs/superpowers/plans/2026-07-26-r1-retrieval-grounding-implementation-plan.md`

## 2026-05-26 — Reposition Avaloka As A Research-First AI Companion Lab

Status: Accepted

### Context

The founder changed Avaloka's purpose. The project should no longer be treated primarily as a commercial MVP or near-term business validation effort. Instead, Avaloka should become a foundational AI research and implementation testbed for applying recent AI techniques, especially SAGE-style long-term memory, to emotionally sensitive companion agents.

The compassionate-wisdom companion scenario remains valuable because it is difficult: it stresses memory, safety, privacy, personalization, emotional state understanding, response naturalness, and long-horizon continuity.

### Decision

Reposition Avaloka as a research-first AI companion lab.

Set the active roadmap version to:

> R1: SAGE Memory Research Prototype

R1 should focus on designing and implementing a local SAGE Lite pipeline:

- Memory Writer
- Memory Guardian
- Care Card / graph-memory store
- Memory Reader
- response injection
- extraction/rejection/retrieval/response/privacy evals

The previous V0/V1 low-moment companion work becomes historical evidence and a research test scenario, not the active commercial roadmap.

### Rationale

Avaloka is a stronger foundational AI experiment than a near-term business project. It can help the founder learn how to turn new AI papers into working systems, build reusable memory/safety/eval infrastructure, and transfer those patterns to other projects.

### Consequences

- `docs/product/product-vision.md` now describes Avaloka as a research-first AI companion lab.
- `docs/product/version-roadmap.md` now uses R-series research versions.
- `docs/research/sage-memory-research-plan.md` becomes the active research plan.
- Business plans and 7-day validation docs remain historical context.
- Payment, launch, account, community, and growth work are out of scope.
- SAGE memory work may proceed as an experiment even though the old V1 commercial validation milestone is paused.

### Affected Docs

- `AGENTS.md`
- `README.md`
- `README.zh.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/research/sage-memory-research-plan.md`
- `docs/engineering/avaloka-memory-engine-v1.md`
- `docs/engineering/avaloka-memory-engine-v1.zh.md`

## 2026-05-25 — Keep SAGE-Inspired Memory Lightweight Until V1 Proves Need

Status: Superseded by `2026-05-26 — Reposition Avaloka As A Research-First AI Companion Lab`

### Context

A SAGE-style self-evolving graph memory architecture suggests a useful pattern for long-term AI companionship: separate memory writing from memory reading, keep memory sparse, and require evidence that each memory improves future retrieval or response quality.

Avaloka may eventually need long-term personalization, but the current product stage is V1 local MVP and second free validation. A full graph-memory engine, graph neural network reader, GRPO training loop, or large RAG system would be premature and could create privacy, safety, and scope risk.

### Decision

Add `docs/engineering/avaloka-memory-engine-v1.md` and `docs/engineering/avaloka-memory-engine-v1.zh.md` as English and Chinese proposed designs for a small local Care Card memory layer.

The design borrows SAGE's discipline but not its full technical weight:

- save care-relevant abstractions, not raw transcripts
- require source evidence for every saved memory
- store only sparse response preferences, recurring pain patterns, helpful moves, avoid moves, and safety notes
- keep memory local, exportable, and clearable
- require eval coverage before any runtime memory injection

### Rationale

Avaloka should become more personal by remembering how to care for a user, not by accumulating an invasive emotional dossier. The current system should continue prioritizing response quality, safety, and real-user validation before adding memory complexity.

### Consequences

The SAGE-inspired memory design is not runtime-active. Future implementation must start with a local Care Card prototype and pass privacy, safety, extraction, rejection, retrieval, and response evals before affecting user-facing replies.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/engineering/avaloka-memory-engine-v1.md`
- `docs/engineering/avaloka-memory-engine-v1.zh.md`

## 2026-05-19 — Treat `docs/kb/` As Avaloka's Internal Learning Base

Status: Accepted

### Context

Avaloka's internal philosophy, Baifa mind-state mapping, dukkha mapping, Compassion OS, Five Mindfulness Guardian, and secular Buddhism notes are stored under `docs/kb/`. Without an explicit binding rule, future agents or prompt changes could ignore this material and rely on chat memory, ad hoc assumptions, or generic model knowledge.

### Decision

`docs/kb/` is Avaloka's internal learning base. Runtime-facing knowledge must be promoted through derived KB notes, `prompt/registry.json` `knowledgeSources`, prompt files, eval cases, and content checks.

### Rationale

Avaloka should not "remember" project philosophy from prior conversations. The repo must make the learning source visible and testable so agents, prompts, and evals keep using the same internal philosophy.

### Consequences

- `docs/kb/README.md` is the KB entry point.
- Active prompts should declare KB dependencies through `knowledgeSources`.
- `npm run content:check` validates registered knowledge-source paths.
- New wisdom sources must follow `docs/engineering/content-ingestion-test-gate.md`.
- User-facing responses still remain plain, non-doctrinal, and safety-bound.

### Affected Docs

- `docs/kb/README.md`
- `prompt/registry.json`
- `AGENTS.md`
- `README.md`
- `README.zh.md`
- `docs/engineering/content-ingestion-test-gate.md`
- `scripts/check-content-ingestion.mjs`

## 2026-05-19 — Separate User Mode And Developer Mode In The V1 MVP

Status: Accepted

### Context

The V1 local MVP now uses LLM Orchestrator V2, Baifa Mapper, Compassion OS, Guardian, local baseline responses, feedback logging, and export data. Showing all of that diagnostic machinery in the main interface made the product feel like an AI control panel instead of a quiet private emotional support space.

### Decision

Avaloka V1 has two local UI modes:

- default user mode at `http://127.0.0.1:5173/`
- developer mode at `http://127.0.0.1:5173/?dev=1`

Default user mode shows the chat, lightweight feedback, local privacy note, and export/clear controls. Developer mode may show Internal Debug, Local Baseline, LLM Orchestrator V2, Compassion OS, and Baifa Mapper panels.

### Rationale

The validated user need is to feel privately met during low moments. Internal analysis, labels, latency, model state, and hidden routing metadata are useful for builders but should not contaminate the emotional experience.

### Consequences

- `DESIGN.md` is now active UI guidance.
- User-facing UI should stay low-pressure, non-clinical, non-religious, and free of implementation terms.
- Debug and evaluation surfaces should remain explicit developer-mode features.
- Future UI changes should preserve this separation unless a later decision log entry supersedes it.

### Affected Docs

- `DESIGN.md`
- `README.md`
- `README.zh.md`
- `AGENTS.md`
- `docs/product/version-roadmap.md`
- `docs/experiments/v1-alpha-readiness-checklist.md`

## 2026-05-16 — V0 First Validation Passed And V1 May Start

Status: Accepted

### Context

Avaloka completed a first 7-day free validation round with 5 target users. The Day 8 validation report shows that the V0 pass criteria were met:

- 5 users recruited
- 4/5 users used Avaloka for at least 4 days
- 3/5 users opened Avaloka during real low moments without prompting
- 3/5 users wanted to continue after Day 7
- 2/5 users were willing to recommend Avaloka to a similar person
- 0 serious safety or positioning incidents

### Decision

Mark V0 as passed and move the active roadmap version to V1.

V1 may start, but it must remain narrow: a minimal local chat MVP focused on short, body-grounded, non-judgmental emotional settling for the validated low-moment use case.

### Rationale

V0 produced real usage pull from a subset of target users. The strongest signal was not demand for advice, religious explanation, or a broad chatbot; it was demand for a short, steady, embodied response when the user does not want to burden family or explain herself.

### Consequences

- V1 should optimize for shorter responses, body-grounded settling, safer onboarding, and stronger eval gates.
- V1 should not expand into payment, full RAG, account systems, community, medical or therapy positioning, or broad emotional chatbot scope.
- V0 failure patterns must become eval cases: generic advice, chicken-soup reassurance, and asking users to explain too much during low moments.

### Affected Docs

- `docs/product/version-roadmap.md`
- `docs/experiments/2026-05-16-v0-day-8-validation-report-zh.md`
- `docs/experiments/failure-log.md`

## 2026-05-13 — Establish Agent-First Project Governance

Status: Accepted

### Context

Avaloka had many early drafts, old system design files, and scattered planning notes. Some old docs still described a Buddhist AI, RAG-first architecture, broad emotional scope, and payment validation.

### Decision

Use an agent-first documentation system:

- `README.md` as the human entry point
- `AGENTS.md` as the agent entry point
- `docs/` as active source of truth
- `archive/` as historical reference
- runbooks, feedback logs, quality checklists, and document gardening as operating tools

### Rationale

Agents can only reliably execute what is visible in the repository. The project needs a stable source of truth so future agents do not revive old directions.

### Consequences

Old direction files were archived. Active docs now describe Avaloka as a private emotional settling companion, not a Buddhist AI or therapy product.

### Affected Docs

- `README.md`
- `AGENTS.md`
- `docs/engineering/2026-05-13-harness-engineering-for-avaloka-zh.md`
- `docs/maintenance/2026-05-13-doc-gardening-checklist-zh.md`
- `archive/2026-05-13-superseded-docs/`

## 2026-05-13 — Make First Validation Free, Not Paid

Status: Accepted

### Context

Early user interviews suggested willingness to pay, but payment signals were not yet behaviorally validated and could be distorted by relationship, support, or imagined value.

### Decision

The first validation round is free. The Day 7 question asks whether users want to continue using Avaloka for free in the next test round, not whether they will pay.

### Rationale

The first risk is retention and real low-moment usage, not monetization. Payment should be tested only after continued-use pull is visible.

### Consequences

The business plan and validation runbook prioritize real usage, retention, continued-free-use desire, and safety trust.

### Affected Docs

- `docs/business/2026-05-12-avaloka-ai-7-day-user-validation-zh.md`
- `docs/business/2026-05-12-avaloka-ai-business-plan-revision-zh.md`
- `docs/experiments/2026-05-13-7-day-validation-runbook-zh.md`

## 2026-05-13 — Move From Buddhist-Language Product To Compassionate-Wisdom Companion

Status: Accepted

### Context

The target user wants compassionate and wise responses but does not want doctrine recitation, jargon, karma-blame, or a chatbot that sounds like it is teaching Buddhism.

### Decision

Avaloka user-facing language should be compassionate, clear, practical, and non-doctrinal. Wisdom and Five Mindfulness principles may guide the hidden system, but the product should not speak in religious performance.

### Rationale

The user need is emotional settling and personal reflection, not more content or religious explanation.

### Consequences

The old “Buddhist AI / Buddhist encyclopedia / RAG-first over religious texts” direction is superseded.

### Affected Docs

- `AGENTS.md`
- `README.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/product/2026-05-13-response-quality-checklist-zh.md`
- `archive/2026-05-13-superseded-docs/`

## 2026-05-14 — Add Version Governance As First-Class Project Structure

Status: Accepted

### Context

The project had a clear first-version target, but final vision, current active version, future versions, and decision history were not explicitly separated.

### Decision

Add:

- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/decisions/decision-log.md`

## 2026-05-14 — Add AI Production Safety Harness

Status: Accepted

### Context

Avaloka will eventually generate emotionally sensitive AI responses. A similar class of AI product failures can leak prompts, expose hidden rules, overstep medical or crisis boundaries, or repeat unsafe outputs because failures are not captured as eval data.

### Decision

Add `docs/engineering/ai-production-safety-harness.md` and `docs/experiments/failure-log.md` as active source-of-truth documents.

The harness requires:

- prompt and production logic separation
- no disclosure of hidden prompts, guardrails, scoring rules, chain-of-thought, or logs
- crisis, prompt-injection, response-quality, Five Mindfulness, hallucination, and boundary eval gates
- privacy redaction
- rollback policy
- failure-log-to-eval workflow

### Rationale

Avaloka should be treated as an AI production system before it becomes a production app. Its emotional safety risk makes verification more important than generation speed.

### Consequences

Before any user-facing AI behavior is used with testers, V0 must pass the minimum safety checklist in the AI production safety harness. Future prompt changes must be versioned, evaluated, and have rollback targets.

### Affected Docs

- `AGENTS.md`
- `README.md`
- `docs/product/version-roadmap.md`
- `docs/engineering/harness-engineering-setup.md`
- `docs/engineering/ai-production-safety-harness.md`
- `docs/experiments/failure-log.md`

and make them part of the source-of-truth hierarchy.

### Rationale

Future agents need to distinguish final vision, current active work, future possibilities, and superseded decisions.

### Consequences

`README.md` and `AGENTS.md` must point to these files. Future major direction changes should add decision-log entries.

### Affected Docs

- `README.md`
- `AGENTS.md`
- `docs/product/product-vision.md`
- `docs/product/version-roadmap.md`
- `docs/decisions/decision-log.md`
