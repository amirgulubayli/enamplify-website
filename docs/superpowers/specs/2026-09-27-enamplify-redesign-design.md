# Enamplify redesign: design spec

Date: 2026-09-27 · Owner: Amir Gulubayli · Status: draft for review

Product truth lives in `PRODUCT.md`. This spec covers the site structure, the visual system, the copy, and the SEO / Core Web Vitals requirements for the rebuild of enamplify.com.

## 1. Goals

1. A senior operator (COO, Head of Ops, transformation lead at a 200–2,000 person company) understands within one viewport what Enamplify gives them, trusts it, and books a diagnostic call when they are ready.
2. The site sells outcomes (capacity, ownership, control). The mechanism (governed sandbox, model gateway, commercial ladder) stays in conversation and, lightly, on the Approach page.
3. Trust is built, never demanded: no countdowns, no pop-ups, no "limited spots", no guarantees, one quiet primary action.
4. Enamplify replaces RAG Medium as the single brand. RAG Medium's delivered work becomes Enamplify's proof.
5. Search: ranks for AI enablement / AI training for teams / AI adoption consultancy (London, Baku) and is quotable by AI search engines.
6. Performance: Core Web Vitals green on mobile; CLS ≈ 0.

## 2. Non-goals (this round)

Azerbaijani-language pages, a readiness scorecard app, a newsletter platform, a CMS, analytics, embedded scheduling, bespoke scroll animation. Each can be added later without restructuring.

## 3. Sitemap (7 page types, ~20 URLs)

| URL | Page | Job |
|---|---|---|
| `/` | Home | The whole argument in one long page |
| `/approach/` | Approach | "How does this actually work, and is it safe?" |
| `/work/` | Work | Proof: recognition, delivered systems, own products |
| `/about/` | About | The founder, London · Baku, why this exists |
| `/insights/` | Insights | Essays + field guides |
| `/insights/<article-slug>/` | Article | 6 existing essays |
| `/insights/guides/<guide-slug>/` | Field guide | 3 existing interactive worksheets + PDFs |
| `/contact/` | Book a call | Booking link + enquiry composer |
| `/privacy/` `/cookies/` `/terms/` `/accessibility/` | Legal | Footer only |
| `/404/` | Not found | noindex |

Removed: `/solutions/*`, `/for/*`, `/start/*`, `/work/<project>/`, `/perspectives/*`, `/resources/*`, `/credits/`, `/thank-you/`. All removed URLs 301 to their closest successor (see §8).

## 4. Visual world: The Board Pack

Every outcome is presented as a numbered exhibit, the way a COO already reads a board pack. Clean, calm, generous white space, institutional without being stiff. Refuses both the dark/neon "AI startup" look and the cream/serif "bookish" look.

- **Colour (Restrained):** white paper, deep navy ink, one electric-blue signal used only for exhibit highlights, links and the primary button.
  - `--paper #FFFFFF` · `--wash #F4F6F8` · `--navy #0A1F33` · `--ink #1A2633` · `--muted #556474` · `--rule #D8DEE5` · `--rule-strong #A8B4C0` · `--signal #1F5EFF` · `--signal-deep #1746C8` · `--signal-wash #E9EFFF`
  - One full-bleed navy band (the closing section) per page; everything else is white or wash.
- **Type:** Schibsted Grotesk (display, 500/700) and Public Sans (text, 400/500/600). Both OFL, self-hosted WOFF2, `font-display: optional`. Tabular figures in every exhibit.
- **Exhibits:** each has a label ("Exhibit 1"), a title in sentence case, a hairline chart or ledger drawn as inline SVG/HTML, and a source line. Illustrative exhibits say so in the source line.
- **Motion:** none beyond hover/focus transitions and a single fade-up of exhibit marks on first view (disabled under `prefers-reduced-motion`). The page must be complete with JS off.
- **Imagery:** no stock photography. The only photograph is Amir's portrait.
- **Grid:** 12 columns, max width 1200px, 24px gutters, 20px mobile gutter.
- **Voice rules:** sentence case everywhere; no em dashes (existing test); no decorative preheaders (existing test); no uppercase transforms (existing test).

## 5. Home page (final copy)

**Header:** wordmark `Enamplify` · Approach · Work · Insights · About · button "Book a call".

**Hero**
- H1: **AI your team builds. Not AI you buy.**
- Lede: Enamplify helps mid-sized organisations make AI part of how their own people work. More gets done each week, the capability stays in-house, and every workflow is visible to the people accountable for it.
- Primary: **Book a diagnostic call** → `/contact/` · Secondary text link: **How we work** → `/approach/`
- Note: A 30-minute conversation with the founder. No pitch deck.
- Exhibit 1, "Where an operations team's week goes": horizontal 100% stacked bar. Judgement and client work 41% (navy), Recurring reporting 21% (signal), Finding information 16% (signal), Handoffs and chasing 13% (signal), Other 9% (rule). Caption: "Reporting, finding information and handoffs, shown in blue, are where AI workflows usually start." (names the segments so the point doesn't depend on colour) Source: "Illustrative composite for explanation. A diagnostic replaces it with your own numbers."

**The situation** (H2: *Your people are already using AI. The question is whether it's working for the organisation.*)
1. **Tools were bought. The work didn't change.** Licences go unused when nobody is given the permission, or the method, to change how the work is done.
2. **The real use is out of sight.** People paste work into personal accounts because the approved route is slower. Leadership can't see it, so it can't improve it.
3. **Pilots stall in month two.** The demo worked. Ownership, review and handoffs were never designed.
- Marked line: *Most AI rollouts don't fail on technology. They fail on who owns the work afterwards.*

**What changes** (H2: *Three things you can take to the board.*) Three exhibits:
- Exhibit 2, **More done.** Hours come back from the work nobody chose: reporting, searching, re-keying, chasing. Chart: paired bars "Weekly hours on recurring admin, before / after" 14 → 6, source "Illustrative."
- Exhibit 3, **Owned in-house.** Your people learn to build and run their own workflows. When we step back, the capability stays. Chart: two lines over 12 months, "Workflows maintained by your team" rising past "Workflows maintained by Enamplify", source "Illustrative."
- Exhibit 4, **In control.** Every workflow is visible, reviewed before it goes live, and runs inside limits you set. Sensitive data stays where it belongs. Ledger: columns Workflow · Owner · Reviewed · Data stays in; rows "Monthly board report · Finance · Yes · Your environment", "Client enquiry triage · Operations · Yes · Your environment", "Contract first-read · Legal · Yes · Your environment". Source "Example ledger."

**How it starts** (H2: *Start small. Prove it. Then decide.*)
- 01 **Diagnose**, 2–3 weeks. We map where your team's time goes and choose the few workflows worth doing first. The fee is credited if you continue.
- 02 **Prove**, 8–12 weeks. One or two teams build real workflows with us, measured against numbers agreed up front.
- 03 **Scale**, ongoing. Roll out on your terms, with governance, new use cases and a quarterly report on what changed.
- Link: "More on our approach" → `/approach/`

**Commitments** (H2: *What we will and won't do.*)
- We won't promise percentages we can't evidence.
- We won't lock you into our tools.
- We won't move your data anywhere you haven't approved.
- We won't frame this as replacing your people.
- We will agree how success is measured before we start.
- We will leave you with something your team runs without us.

**Track record** (H2: *Built by people who ship.*)
- Figures (bold figure / label): "$10,000" / "Google hackathon winning build"; "10+ years" / "Building software, automation and AI systems"; "2 products" / "Of our own in market: grademy and pripitch".
- Delivered: AI clinical trial management software · AI finance tracking and reconciliation · Market intelligence and trading systems · Outbound growth systems · SaaS product builds · Internal operations systems · Marketing and PR agency systems.
- Link: "See the work" → `/work/`

**Founder** (H2: *Founder-led, between London and Baku.*)
- Quote (DRAFT, Amir to approve): "The organisations getting real value from AI aren't the ones with the biggest budgets. They're the ones whose own people know how to use it."
- Attribution: Amir Gulubayli, Founder. Link "About Enamplify" → `/about/`

**Insights**: H2 *Recent thinking.* Three latest essays, link "All insights".

**Close** (navy band): H2 *When the timing is right, start with a conversation.* Body: Thirty minutes about your team and the work you'd like to change. If we're not the right fit, we'll say so. Button **Book a diagnostic call**.

**Footer:** wordmark; the definition sentence from §7; "London · Baku"; Pages (Approach, Work, Insights, About, Book a call); Contact (email, LinkedIn); legal links; © year.

## 6. Inner pages (copy direction)

- **Approach**: H1 *Start small. Prove it. Then scale.* Sections: the three stages in detail (what happens, what you get, how long); *What "in control" means in practice* (single sign-on and roles; review before anything goes live; a full audit trail; sensitive data routed to models that run in your environment; runs on your infrastructure or UK/EU hosting); *What your team leaves with* (workflows in use, people who can build more, a playbook, a measured baseline); FAQs (from `content/faqs.json`, marked up as FAQPage).
- **Work**: H1 *Systems we've built. Products we run.* Recognition (Google hackathon, $10,000 winning build); delivered systems grid (8 categories, one line each, no client names, note: "Client names are withheld by default. References are available in conversation."); our products (grademy, pripitch with outbound links; RAG-X as a concept).
- **About**: H1 *Founder-led, between London and Baku.* Amir's background (AI strategy, operating model design, implementation and capability building across travel, marketing, education, finance and clinical technology); why Enamplify exists; how we work (the commitments); London · Baku.
- **Insights**: H1 *Insights.* Essays grid then field guides grid.
- **Contact**: H1 *Book a diagnostic call.* Left: what the call covers, what happens after, "You'll speak with Amir, the founder." Primary: "Choose a time" → booking URL (opens cal.com in new tab). Right: enquiry composer (existing email/server modes) for people who prefer to write.

## 7. SEO and AI search

- Unique `<title>` (≤ 60 chars) and meta description (≤ 155 chars) per page, written for intent (see plan Task 3 route table).
- Home title: `Enamplify · AI enablement for mid-sized teams`.
- JSON-LD `@graph` on every page: `ProfessionalService` (Enamplify, areaServed London + Baku + United Kingdom + Azerbaijan, founder, sameAs LinkedIn), `Person`, `WebSite`; plus `BreadcrumbList` on inner pages, `FAQPage` on Approach, `Article` on essays.
- One definitional sentence, used as the About lede and in the footer of every page, that AI engines can quote: "Enamplify is an AI enablement consultancy, based in London and Baku, that helps mid-sized organisations train their own people to build and run AI workflows safely."
- `/llms.txt` summarising the site and linking every indexable page.
- `sitemap.xml` with per-page lastmod; `robots.txt` unchanged in behaviour; RSS feed moves to `/insights/`.
- New Open Graph image (1200×630) in the Board Pack style.

## 8. Redirects (301, in `vercel.json`)

`/solutions/` and `/solutions/:slug/` → `/approach/` · `/for/:slug/` → `/` · `/start/:slug/` → `/contact/` · `/work/pripitch/`, `/work/grademy/`, `/work/rag-x/` → `/work/` · `/perspectives/` → `/insights/` · `/perspectives/:slug/` → `/insights/:slug/` · `/resources/` → `/insights/` · `/resources/:slug/` → `/insights/guides/:slug/` · `/credits/` → `/` · `/thank-you/` → `/`

## 9. Core Web Vitals

- LCP element is the H1 text: no hero image, fonts preloaded and self-hosted.
- CLS: `font-display: optional` on self-hosted fonts; every `<img>` carries width/height; no late-injected content above the fold.
- INP: under 8 KB of deferred JS, no third-party scripts except Turnstile on `/contact/` in server mode.
- Budgets enforced by tests: CSS ≤ 36 KB, JS ≤ 12 KB, no `<img>` without dimensions, no stylesheet from a third-party origin.

## 10. Testing

- `node --test` suite: route manifest matches this spec; one H1 per page; unique titles/descriptions; internal links resolve; JSON-LD valid and includes the required types; redirects cover every removed route; budgets; existing voice tests (no em dash, no preheaders, no uppercase); fonts are self-hosted WOFF2 with an OFL licence file.
- Visual: Playwright screenshots at 1440 and 390 of every page type into `.impeccable/review/`, then the Impeccable finish review.

## 11. Open items for Amir

1. Approve or rewrite the founder quote (§5).
2. Confirm the booking URL (currently `https://cal.com/ragmedium/ragmedium`).
3. Confirm "10+ years" and the hackathon wording as they appear on ragmedium.com.
4. Replace illustrative exhibits with real pilot numbers when available.
