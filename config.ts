// config.ts
// Central app config (NO static MODEL export) --> myAI6

/**
 * Current date/time sentence for the system prompt. Computed PER CALL (the chat
 * route builds the prompt on every request) rather than once at module load,
 * which on a long-lived server instance would freeze the date at cold start.
 * Pinned to UTC so the output is deterministic regardless of server timezone.
 */
export function getDateAndTime(now: Date = new Date()): string {
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
  return `Today is ${dateStr} and the time right now is ${timeStr}.`;
}

// --- Assistant identity (all user-facing naming derives from these) ---
export const AI_NAME = "VCG Research Intelligence Agent";
export const OWNER_NAME = "Vertex Consulting Group";
export const AI_DESCRIPTION = `
${AI_NAME} is a research coworker for ${OWNER_NAME} consultants. It turns a business brief into a structured, source-graded, traceable research pack and hands it to the Engagement Manager for approval.
`.trim();

// Browser tab / metadata title. Change freely — one line, no other edits needed.
export const BROWSER_TAB_TITLE = "VCG Research Agent";

export const WELCOME_MESSAGE = `I'm the ${AI_NAME}. Give me a research brief (client or company, industry, geography, the decision it supports) and I'll plan, search, verify and return an evidence pack for Engagement Manager review.`;
export const CLEAR_CHAT_TEXT = "New";

// --- Defaults (PROF REQUIREMENT: Anthropic by default) ---
export const DEFAULT_VENDOR = "anthropic" as const;

// Use Claude Haiku 4.5 (cost-efficient, thinking budget separate from output)
export const DEFAULT_MODEL_ID = "claude-haiku-4-5" as const;

export const DEFAULT_MODE = "chat" as const; // "chat" | "reasoning"

// Default thinking level (used when reasoning is triggered)
export const DEFAULT_THINKING_LEVEL = "medium" as const; // "off" | "low" | "medium" | "high"

// --- Utility Model (background tasks) ---
// Small, fast model used for background work: the moderation classifier and
// conversation compaction summaries. Independent of the chat model above, so you
// can run chat and utilities on different vendors — or switch everything to one
// vendor. The API key for the chosen vendor must be set.
export type UtilityVendor = "anthropic" | "openai" | "fireworks";
export const UTILITY_VENDOR: UtilityVendor = "anthropic";
export const UTILITY_MODEL_ID = "claude-haiku-4-5"; // e.g. "gpt-5.4-mini" for openai, "accounts/fireworks/models/deepseek-v3" for fireworks

// --- Moderation denial messages ---
export const MODERATION_DENIAL_MESSAGE_SEXUAL =
  "I can't discuss explicit sexual content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SEXUAL_MINORS =
  "I can't discuss content involving minors in a sexual context. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT =
  "I can't engage with harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HARASSMENT_THREATENING =
  "I can't engage with threatening or harassing content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE =
  "I can't engage with hateful content. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_HATE_THREATENING =
  "I can't engage with threatening hate speech. Please be respectful.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT =
  "I can't discuss illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_ILLICIT_VIOLENT =
  "I can't discuss violent illegal activities. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM =
  "I can't discuss self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INTENT =
  "I can't discuss self-harm intentions. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_SELF_HARM_INSTRUCTIONS =
  "I can't provide instructions related to self-harm. If you're struggling, please reach out to a mental health professional or crisis helpline.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE =
  "I can't discuss violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_VIOLENCE_GRAPHIC =
  "I can't discuss graphic violent content. Please ask something else.";
export const MODERATION_DENIAL_MESSAGE_DEFAULT =
  "Your message violates our guidelines. I can't answer that.";

// --- Pinecone ---
export const PINECONE_TOP_K = 20; // sized for a multi-document KB; raise if the index grows substantially
export const PINECONE_MIN_SCORE = 0.1; // filter out low-relevance matches (lowered to catch acronym/abbreviation queries)
export const PINECONE_INDEX_NAME = "myai6"; // Pinecone index names must be lowercase (letters, numbers, hyphens)

// Parent-child retrieval (3-namespace architecture)
export const PINECONE_USE_PARENT_CHILD = true; // false = legacy "default" namespace
export const PINECONE_NS_CHILDREN = "children";
export const PINECONE_NS_PARENTS = "parents";
export const PINECONE_NS_PROPOSITIONS = "propositions";
export const PINECONE_PROP_BOOST = 0.5; // proposition score weight
export const PINECONE_PROP_K = 15; // propositions retrieved per search to boost children
export const PINECONE_VISUAL_TOP_K = 20; // topK for the visual-enrichment query (figures/tables/slides of a retrieved source)
export const PINECONE_VISUALS_PER_SOURCE = 20; // max figure/table chunks merged into context per retrieved source (keep >= PINECONE_VISUAL_TOP_K so late-document figures are not cut)

// --- Knowledge Base Scope (tells the model what topics are indexed) ---
// Update this list whenever you ingest new content into Pinecone.
// The model uses this to decide whether to search the KB or skip it entirely.
export const KB_SCOPE = `
The knowledge base holds ${OWNER_NAME} INTERNAL EVIDENCE that the consultant is authorized to use: prior research packs, engagement learnings, benchmarks and curated industry material.

DOCUMENTS AND TOPICS (replace with what you actually ingest; every item must carry a confidentiality / permission level):
- [Example] Approved research packs and market assessments by industry and geography
- [Example] Benchmark and margin datasets
- [Example] Methodology notes and approved definitions

Anything retrieved from here is VCG INTERNAL EVIDENCE: label it as such, never present it as external public evidence, and never carry client-confidential material across engagements.
`.trim();

// --- Exa Web Search ---
export const EXA_NUM_RESULTS = 10;
export const EXA_SEARCH_TYPE = "deep" as const; // "auto" | "neural" | "deep" | "deep-reasoning"
export const EXA_MAX_CHARACTERS = 3000; // max chars of page text per result
// "preferred" makes Exa fetch live page content when possible, reducing the odds
// that stale or deleted pages (e.g. dead university URLs) surface in results.
export const EXA_LIVECRAWL = "preferred" as const; // "never" | "fallback" | "preferred" | "always"
export const EXA_SYSTEM_PROMPT = `Prefer primary and authoritative sources: government and regulator publications, official statistics, company filings, annual reports and investor presentations, then recognised research institutions, industry bodies and established business publications. Prefer recent material and include publication dates. Avoid duplicates, anonymous or user-generated content, and low-quality aggregators.`;

// --- Owner Profile Sources (latest information and news) ---
// The owner's official profile pages. For "latest on the owner" questions, the
// model is instructed to web-search these places FIRST: the exact URLs are
// listed in the system prompt, and webSearch restricts results to their
// domains via includeDomains. Update here when a profile moves; everything
// else derives from this list.
// Not used by the VCG research agent: there is no "owner persona" to look up, and an
// empty list removes the fetchOwnerProfiles tool entirely (lib/ai/tools.ts).
export const OWNER_PROFILE_SOURCES: { name: string; url: string }[] = [];

// Max characters of live page text fetched per profile (fetchOwnerProfiles tool).
export const OWNER_PROFILE_MAX_CHARACTERS = 5000;

// Domains derived from the profile sources, used for webSearch includeDomains.
export const OWNER_PROFILE_DOMAINS = OWNER_PROFILE_SOURCES.map((s) => {
  try {
    return new URL(s.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}).filter(Boolean);

// --- Source Tiers (VCG master prompt s.7; consumed by lib/source-trust.ts) ---
// DOMAIN-BASED HEURISTICS. A domain cannot prove provenance, methodology or
// independence, so every label derived from these lists is presented as a
// heuristic and the consultant / Engagement Manager still makes the real call.
// Matching is on hostname boundaries (a domain matches itself and its subdomains;
// a suffix must include its leading dot) so "notreddit.com" is not "reddit.com".
// Tier 4 is checked first: a low-trust platform stays low-trust even if a path
// looks official. Domains in no list are treated as Tier 3 and flagged unclassified.

// Tier 1 — primary / direct evidence: governments, regulators, official bodies.
export const SOURCE_TIER1_SUFFIXES = [
  ".gov", ".gov.in", ".gov.uk", ".gov.au", ".gov.sg", ".gov.cn", ".go.jp", ".go.kr",
  ".nic.in", ".mil", ".europa.eu", ".int",
] as const;
export const SOURCE_TIER1_DOMAINS = [
  "rbi.org.in", "sebi.gov.in", "mospi.gov.in", "niti.gov.in", "dpiit.gov.in",
  "nseindia.com", "bseindia.com", "mca.gov.in", "trai.gov.in", "cci.gov.in",
  "sec.gov", "census.gov", "bls.gov", "federalreserve.gov", "ecb.europa.eu",
  "worldbank.org", "imf.org", "oecd.org", "un.org", "unctad.org", "wto.org",
  "ilo.org", "fao.org", "who.int", "bis.org", "ifc.org", "adb.org",
  "ons.gov.uk", "eurostat.ec.europa.eu",
] as const;
// Company investor-relations / annual-report disclosures (looks like the company's own filing).
export const SOURCE_TIER1_HOST_PREFIXES = ["investors.", "investor.", "ir."] as const;
export const SOURCE_TIER1_PATH_PATTERN =
  "annual[-_ ]?report|investor[-_ ]?(?:presentation|deck|relations)|integrated[-_ ]?report|\\b10-k\\b|\\b20-f\\b|earnings[-_ ]?(?:release|presentation)";

// Tier 2 — high-quality secondary: academia, research institutions, industry bodies, established press.
export const SOURCE_TIER2_SUFFIXES = [".edu", ".edu.in", ".ac.in", ".ac.uk", ".edu.au", ".ac.jp"] as const;
export const SOURCE_TIER2_DOMAINS = [
  "mckinsey.com", "bcg.com", "bain.com", "deloitte.com", "pwc.com", "ey.com", "kpmg.com",
  "gartner.com", "forrester.com", "idc.com", "brookings.edu", "nber.org", "ssrn.com",
  "arxiv.org", "jstor.org", "sciencedirect.com", "springer.com", "nature.com",
  "hbr.org", "weforum.org", "ibef.org", "nasscom.in", "cii.in", "ficci.in", "assocham.org",
  "icrier.org", "ncaer.org", "reuters.com", "bloomberg.com", "ft.com", "wsj.com",
  "economist.com", "livemint.com", "economictimes.indiatimes.com", "business-standard.com",
  "thehindubusinessline.com", "moneycontrol.com", "financialexpress.com", "crisil.com",
  "icra.in", "careratings.com", "ind-ra.com", "spglobal.com", "moodys.com", "fitchratings.com",
] as const;

// Tier 3 — specialist / supporting: trade press, market-research vendors (opaque methodology; corroborate).
export const SOURCE_TIER3_DOMAINS = [
  "grandviewresearch.com", "marketsandmarkets.com", "mordorintelligence.com",
  "fortunebusinessinsights.com", "alliedmarketresearch.com", "statista.com",
  "technavio.com", "imarcgroup.com", "ibisworld.com", "researchandmarkets.com",
  "expertmarketresearch.com", "psmarketresearch.com", "precedenceresearch.com",
  "tracxn.com", "crunchbase.com", "ibtimes.com", "techcrunch.com", "yourstory.com",
  "inc42.com", "entrackr.com", "medianama.com",
] as const;

// Tier 4 — discovery only: forums, social, user-generated content, wikis, blogging platforms.
export const SOURCE_TIER4_DOMAINS = [
  "reddit.com", "quora.com", "wikipedia.org", "wikiwand.com", "fandom.com",
  "medium.com", "substack.com", "blogspot.com", "wordpress.com", "tumblr.com",
  "linkedin.com", "facebook.com", "x.com", "twitter.com", "instagram.com",
  "youtube.com", "tiktok.com", "pinterest.com", "stackexchange.com", "stackoverflow.com",
  "scribd.com", "slideshare.net", "answers.com", "yahoo.com", "ask.com",
] as const;

// --- Chat Route Limits ---
// Hard cap on tool-use steps per request. Must be large enough to cover the
// per-response soft budgets below plus one fetchOwnerProfiles call and the
// final compose step, i.e. >= MAX_KB_SEARCHES + MAX_WEB_SEARCHES + 2.
export const MAX_STEPS = 12; // max tool-use steps per request
// Per-response soft budgets (enforced via prompt guidance in lib/ai/tools.ts).
export const MAX_KB_SEARCHES = 2; // max vectorDatabaseSearch calls per response
export const MAX_WEB_SEARCHES = 6; // max webSearch calls per response (research = several distinct search paths + a contradiction search)
export const MAX_MESSAGES = 100; // max messages in conversation history
export const MAX_MESSAGE_TEXT_LENGTH = 10000; // max chars per user message
export const VERCEL_MAX_DURATION = 120; // Vercel Pro plan function timeout in seconds

// --- Conversation Compaction ---
// Summarizes older messages when token count exceeds threshold to reduce input costs.
export const COMPACTION_ENABLED = true; // set false to disable compaction
export const COMPACTION_TOKEN_THRESHOLD = 40000; // compact when summary + unsummarized messages exceed this (tokens)
export const COMPACTION_KEEP_RECENT = 4; // keep last N messages intact when compacting (2 user + 2 assistant turns)
export const COMPACTION_CHARS_PER_TOKEN = 4; // heuristic: chars/token ratio for estimation (lower = more conservative)
export const COMPACTION_MAX_SUMMARY_WORDS = 1500; // max word limit for LLM summary (LLM should be concise but not artificially short)
export const COMPACTION_MAX_SUMMARY_CHARS = 8000; // hard safety cap on summary length (truncates if LLM exceeds — should rarely trigger)
export const COMPACTION_SHOW_CONTEXT_MEMORY = true; // show "Context Memory" button in header to view summary

// --- Thinking Budget (tokens) ---
export const THINKING_BUDGET_LOW = 2000;
export const THINKING_BUDGET_MEDIUM = 8000;
export const THINKING_BUDGET_HIGH = 15000;
// Thinking level used in plain "chat" mode (reasoning mode uses the routed level).
export const CHAT_THINKING_LEVEL = "low" as const; // "low" | "medium" | "high"

// --- Output Tokens ---
// Hard cap on response tokens per request. undefined = the provider's default.
// If set while Anthropic thinking is enabled, it must EXCEED the thinking
// budget in use (the API rejects max_tokens <= thinking budget).
export const MAX_OUTPUT_TOKENS: number | undefined = undefined;

// --- Reasoning Escalation ---
export const STRONG_REASONING_LENGTH_THRESHOLD = 1800; // long messages with code keywords → high reasoning

// --- Citation Verification (green check in the Sources box) ---
// The sentence preceding each citation (its claim) is checked against the
// cited source's retrieved text by significant-word containment; legacy
// in-citation quotes, when present, are checked by substring/containment.
export const CITATION_CLAIM_MIN_CHARS = 20; // shorter preceding fragments are not treated as claims
export const CITATION_CLAIM_MAX_CHARS = 300; // claims are trimmed to their last N chars
export const CITATION_CLAIM_MIN_WORD_LENGTH = 4; // "significant" words for claim matching
export const CITATION_CLAIM_MIN_WORDS = 3; // claims with fewer significant words are unverifiable
export const CITATION_CLAIM_MATCH_RATIO = 0.6; // share of significant words that must appear in the source
export const CITATION_QUOTE_MIN_WORD_LENGTH = 3; // "significant" words for quote matching
export const CITATION_QUOTE_MATCH_RATIO = 0.8; // share of quote words that must appear in the source

// --- Rate Limiting ---
export const RATE_LIMIT_ENABLED = true; // set false to disable rate limiting
export const RATE_LIMIT_WINDOW_MS = 60_000; // sliding window size (1 minute)
export const RATE_LIMIT_MAX_REQUESTS = 20; // max requests per window per IP

// --- Pinecone Cache ---
export const PINECONE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- Moderation ---
// Provider that checks user messages for harmful content BEFORE they reach the chat model.
// Set via the env var MODERATION_PROVIDER (in Vercel or .env.local); defaults to "llm":
// "llm"    = LLM classifier running on the utility model above (any vendor)
//            ("anthropic" is accepted as a legacy alias for this value)
// "openai" = OpenAI's dedicated moderation API (requires OPENAI_API_KEY with access to omni-moderation-latest)
// "off"    = no moderation call at all; relies solely on the system prompt guardrails
export type ModerationProvider = "llm" | "openai" | "off";
const _moderationEnv = process.env.MODERATION_PROVIDER?.toLowerCase();
export const MODERATION_PROVIDER: ModerationProvider =
  _moderationEnv === "openai" || _moderationEnv === "off"
    ? _moderationEnv
    : "llm";

// "open" = allow requests when the moderation service is unavailable
// "closed" = block requests when the moderation service is unavailable
// (irrelevant when MODERATION_PROVIDER = "off")
export const MODERATION_FAIL_POLICY = "closed" as const;

// --- Reasoning Display ---
// Controls how the thinking/reasoning block is shown in the chat UI.
// "full"       = show collapsible reasoning with full text (debugging only — exposes prompts!)
// "truncated"  = show first N words of reasoning, then "..." (safe, gives a glimpse)
// "hidden"     = show only the past-tense label (e.g., "Reasoned for 2 seconds"), no expandable content
export type ReasoningDisplayMode = "full" | "truncated" | "hidden";
export const REASONING_DISPLAY_MODE: ReasoningDisplayMode = "truncated";
export const REASONING_TRUNCATE_WORDS = 15; // words to show in "truncated" mode

// --- Backend toggles (enabled by default) ---
// Disable web search by setting the env var: ENABLE_WEB_SEARCH=false
export const ENABLE_WEB_SEARCH =
  process.env.ENABLE_WEB_SEARCH?.toLowerCase() !== "false";

// Disable the Pinecone knowledge base by setting the env var: ENABLE_VECTOR_SEARCH=false
// When off: the KB tool is removed from the model, no Pinecone connection is made,
// and PINECONE_API_KEY is not needed. The bot answers from general knowledge (+ web search if enabled). 
export const ENABLE_VECTOR_SEARCH =
  process.env.ENABLE_VECTOR_SEARCH?.toLowerCase() !== "false";
