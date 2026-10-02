# VCG Research Intelligence Agent: Agent Guide

This repo is the myAI6 template specialised into the VCG Research Intelligence Agent. The
behavioural spec is `vcg/master-prompt.ts` (verbatim; do not paraphrase or edit it casually,
tests check all 38 sections). Runtime-specific prompt text goes in `RUNTIME_BINDINGS_PROMPT`
in `prompts.ts`, never in the master prompt.

**Enforced in code, not just prompt** (keep it that way when changing things):
- Source Trust Gate: `webSearch` returns the gate question and does NOT search until
  `detectSourceTrust()` finds a STRICT/STANDARD/BROAD choice (`lib/source-trust.ts`).
- Source policy: Tier 4 withheld under STRICT/STANDARD; tier labels are heuristics, always say so.
- Human Gate: `lib/human-gate.ts` + `components/messages/human-gate.tsx` + `app/api/human-gate/route.ts`.
- The conversation persist effect in `app/page.tsx` must keep carrying `humanGate` and
  `feedback` forward, or decisions are erased on the next message.


## Configuration Model

Configuration is split into two places:

- **Env vars** (Vercel dashboard or `.env.local`) — secrets and operational switches:
  API keys, `ENABLE_VECTOR_SEARCH`, `ENABLE_WEB_SEARCH`, `MODERATION_PROVIDER`, and the
  optional security vars `SUMMARY_HMAC_SECRET` (compaction-summary signing) and
  `HEALTH_CHECK_TOKEN` (detailed /api/health checks in production).
  See `env.template` for all of them with explanations. Secrets are server-side only —
  never use a `NEXT_PUBLIC_` prefix, which embeds values in the public JS bundle.
- **`config.ts`** — design and tuning parameters: chat vendor/model selection, the utility
  model (`UTILITY_VENDOR`/`UTILITY_MODEL_ID` — used by the moderation classifier and
  compaction summaries), thinking budgets, Pinecone index/namespaces/thresholds,
  compaction, reasoning display, rate limits, search budgets (`MAX_STEPS`,
  `MAX_KB_SEARCHES`, `MAX_WEB_SEARCHES`), output token cap, Exa/web-search settings, owner
  profile sources, citation-verification thresholds, KB scope.

## Key Files

| File | Purpose |
|------|---------|
| `config.ts` | Design/tuning parameters (see above) |
| `env.template` | All env vars (keys + feature switches) with explanations |
| `prompts.ts` | `buildSystemPrompt()`: master prompt verbatim + runtime bindings layer |
| `vcg/master-prompt.ts` | VCG master system prompt v1.0 (authoritative spec) |
| `lib/source-trust.ts` | Source Trust Gate detection, Tier 1-4 classification, source policy |
| `lib/human-gate.ts` | Human Gate schema, block detection, challenge/reject message format |
| `app/api/chat/route.ts` | Main chat endpoint (orchestrator) |
| `middleware.ts` | Per-IP rate limiting for /api/chat |
| `lib/moderation.ts` | Content moderation (llm / openai / off, via `MODERATION_PROVIDER`; llm mode uses the utility model) |
| `lib/compaction.ts` | Conversation summarization for long chats (uses the utility model) |
| `lib/summary-signature.ts` | HMAC signing/verification of compaction summaries (server accepts only summaries it issued; forged/oversized ones are ignored) |
| `lib/pinecone.ts` | 3-namespace vector search (children → propositions → parents), lazy client |
| `lib/sources.ts` | Context assembly and citation formatting |
| `components/messages/sources.tsx` | Code-rendered Sources box (from the `data-sources` stream part) |
| `lib/citations.ts` | Citation canonicalization (renumbering, debris stripping, list repair) + claim verification (`claimSupported`; legacy quotes via `quoteAppearsIn`) |
| `lib/ai/routing.ts` | Vendor/model/mode routing |
| `lib/ai/model-registry.ts` | Supported models and thinking budgets |
| `lib/ai/tools.ts` | Tool set assembly (respects the feature switches) |

## Tools

Tools live in `app/api/chat/tools/`. Each is conditionally included in `lib/ai/tools.ts`
based on the feature switches (`ENABLE_VECTOR_SEARCH`, `ENABLE_WEB_SEARCH`).

| Tool | File | Description |
|------|------|-------------|
| `vectorDatabaseSearch` | `search-vector-database.ts` | Pinecone RAG search |
| `webSearch` | `web-search.ts` | Exa web search |
| `fetchOwnerProfiles` | `fetch-owner-profiles.ts` | Live fetch of the owner's profile pages (`OWNER_PROFILE_SOURCES`) via Exa contents API |

UI display for tools is in `components/messages/tool-call.tsx`.

Each tool is a factory (`createWebSearch`, `createVectorDatabaseSearch`) that takes a
`collect` callback. The tools push a structured `UISource` (`types/data.ts`) for every
source they retrieve. Citation numbering is canonicalized by `lib/citations.ts`
(unit-tested): the model's own [[N]] numbers are IGNORED — citations are renumbered
sequentially by first appearance and bare [[N]] debris is stripped. The client applies
this to displayed text (`assistant-message.tsx`, shared state across text parts); the
chat route runs the same function on the joined answer text to build the `data-sources`
stream part, rendered by `components/messages/sources.tsx` as the SINGLE reference list
(the model writes no References section). Inline and box numbers agree by construction.

## Adding a Tool

1. Create `app/api/chat/tools/my-tool.ts` using the `tool()` helper from `ai`
2. Import and add to `lib/ai/tools.ts` (with a feature switch if it should be toggleable)
3. Add display config in `components/messages/tool-call.tsx` (icon, label category)
4. Add fun labels in `lib/fun-labels.ts` if using a new category

## Ingestion

Content is ingested via `RAGloader/RAG_loader_pipeline.ipynb`, which imports its
classes and functions from `RAGloader/myAI6_RAG.py`. See README for pipeline
documentation (stages incl. formula-to-LaTeX repair, content types,
Cloudinary/SFTP image hosting, index utilities). Notebooks must never be
committed with API keys or other credentials filled in.
