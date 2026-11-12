# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Us is the default offering at `/` and `/az/`: businesses and teams evaluating an adaptive AI workspace implemented around their processes, with advice and support. The established primary business audience remains COOs, Heads of Operations and transformation leads at mid-sized organisations (roughly 200–2,000 staff). They feel the operational drag, own the budget, and think long-term. They read quietly (often on a phone between meetings), rarely comment, and forward what they trust. They are wary of hype, vendors, "$100M offer" language and guarantees; they have seen the standard "AI agency" pitch many times.

Their job: get their teams genuinely using AI to do more, without losing control of data, quality or accountability, and with something they can defend to a board.

Secondary: the managers and team leads under them, who share and forward material upward. Professional services is one strong niche within the ICP.

Me at `/me/` and `/az/me/` serves one person with their own team of agents: projects, context, tools, work, learning and everyday planning. It is a complete consumer/personal version of the same workspace and visual design, with a full landing page. Me is in development; registering interest does not create an account.

Two markets: London (UK/EU; hosted delivery; prestige; relationship and event-led) and Baku (on-prem or local cloud; Azerbaijani-language; introduction-led).

## Product Purpose

Enamplify is an adaptive AI working environment. Conversations, projects, files, supported accounts, tools and agent responsibilities stay around a workspace that can change through conversation. Us brings shared, permissioned work to teams and businesses, with tailored implementation, advisory and continuing support. Me brings the same approach to one human and their agent team.

Success for the client remains useful capacity, control over access and actions, and capability that people can keep using. Success for the site is an informed, offering-specific enquiry: a business scopes an implementation, or an individual registers interest in Me with its availability understood.

## Positioning

The adaptive AI workspace is central. Us is implemented around a team's existing work; Me is the same design for one person. The consultancy supplies implementation, advice and support around that environment, retaining the calm credibility of the original practice.

The commercial paths must be explicit on the landing pages. Us offers a scoped, tailored implementation with ongoing support; its enquiry starts a conversation about the outcome, rather than a self-serve software account. Me is the personal software product, currently in development; its enquiry registers interest and does not create an account. Lead Us with work prepared and operational capacity returned to the team. Show representative requests and reviewable outputs before explaining accounts or infrastructure. No launch date, price or subscription tier is promised.

Show what the environment does through concrete examples and clearly labelled product concepts. Explain context, tools, agents, permissions and the describe → preview → apply change path when they help understanding. Keep hosting, infrastructure and developer details out of visitor copy. Capacity, ownership and control remain useful benefits; the product is no longer hidden behind an enablement proposition.

## Operating Context

- Enamplify replaces RAG Medium (ragmedium.com) as the single brand. Custom AI builds and automation remain available alongside the adaptive workspace and its implementation services.
- Delivery (not homepage copy): governed sandbox inside client infrastructure or UK/EU hosting; SSO + roles; self-hostable builder; model gateway routing frontier vs open-weight models by data sensitivity; read-only connectors; audit logs and review before go-live; quarterly impact reporting.
- Established delivery/commercial context: Diagnostic (2–3 weeks, fixed fee, credited to the implementation) → Pilot/implementation (8–12 weeks, historically 10–15 champions) → ongoing support/subscription. The current public process is Diagnose → Implement → Support. Pricing is not published; every implementation is scoped in writing. This is not a universal consumer subscription promise.
- Go-to-market around the site: LinkedIn (founder voice), fortnightly brief (newsletter), hosted dinners/roundtables, handwritten invitations, targeted cold email. The site must be the credible landing point for all of them.
- Booking destination in `content/site.json`: https://calendar.app.google/tANUivSNL2Y2sgTW6. The existing contact/enquiry flow remains the destination for the offering actions; server handling is at `api/enquiry.js`.

## Capabilities and Constraints

- Existing codebase: zero-dependency static generator (Node ≥22), `scripts/build.mjs`, content in `content/*.json` and `content/articles/*.md`, deployed on Vercel at enamplify.com. Keep zero runtime dependencies unless there is a strong reason.
- Us primary action: "Wire up your team" → `/contact/?interest=Enamplify%20for%20a%20team#enquiry`, for a scoped implementation enquiry. Me primary action: "Get me wired up" → `/contact/?interest=Enamplify%20Me#enquiry`, for a genuine enquiry/registering interest while Me is in development, not account creation. The short Me availability note sits beside its first action; the process explains reviewing and sending the enquiry.
- Native Us/Me links and reciprocal audience links below the main actions let readers choose the relevant offering. Both offering and language navigation preserve locale. The landing actions recur in the closing bands; Me also has its own header action. Secondary, lower-commitment routes (readiness scorecard, fortnightly brief, dinner invites) remain allowed without competing with the relevant offering action.
- No guarantees of outcomes; no percentage-improvement promises.
- English and Azerbaijani routes are implemented, including both versions of Me. Still undecided here: the name of the fortnightly brief and any further readiness-scorecard development.
- Do not promise universal subscription, history or plugin compatibility. Concepts are illustrative product direction, not release evidence. Do not add fabricated metrics, personal-project anecdotes, AWS or developer details to visitor copy.

## Brand Commitments

- Name: Enamplify. Founder-led by Amir Gulubayli (London, Azerbaijani; works across London and Baku).
- Voice: calm, credible, specific, unvarnished. Proof over opinion; "here's what we're seeing" over "leaders must". No hype words, no emoji, no "AI agency" self-description, no "replace yourself" language (frame as removing the boring parts of the job).
- Premium, high-craft presentation that reads as a serious peer to senior operators.
- Preserve the original parchment/oxblood/Caslon editorial identity across Us and Me. Product positioning changes within that same design. London and Baku appear in an architectural photography chapter beneath the product, alongside existing footer/About context; the workspace remains the landing hero's focus. `assets/styles.css` is the visual source of truth; `DESIGN.md` records the current system.
- Interactive product previews use a distinct, readable interface treatment: DM Sans headings and content, white and quiet neutral surfaces, softer corners, restrained depth and the existing wine accent. Caslon remains the marketing display voice and wordmark. Native controls should produce useful visible changes across example views; guided setup is explicitly an in-page preview, with no account connection or saved configuration.

## Evidence on Hand

Usable, from ragmedium.com and founder record:
- Google hackathon winners ($10,000 winning build).
- Founder: 10+ years experience; multi-entrepreneur; AI strategy, operating model design, implementation and capability building across travel, marketing, education, finance and clinical technology.
- Delivered work categories (client names not public): outbound automation systems, SaaS buildouts, AI trading/market intelligence systems, AI finance tracking and reconciliation, AI clinical trial management software, internal operations systems, marketing agency systems, PR agency systems.
- Own ventures: grademy (adaptive AI study ecosystem, grademy.work), pripitch (sales meeting intelligence, pripitch.com), RAG-X (AI-first CRM concept, not a client deployment).
- Existing field guides: `public/downloads/*.pdf` (AI Opportunity Canvas, Pilot Acceptance Checklist, Team AI Readiness).
- Existing essays: `content/articles/*.md`.

Absent — must not be fabricated: named client logos, testimonials, hours-saved figures, pilot results, Pasha/ABB references, benchmark data. Proof slots for pilot numbers are designed to be filled later.

## Product Principles

1. Put the adaptive workspace at the centre. Explain useful work, context and control concretely; technical machinery belongs in delivery discussions.
2. Earn authority with specificity. Concrete, verifiable detail beats adjectives; say less, prove more.
3. Control is the reassurance, ownership is the difference, capacity is the reward.
4. Every page must earn its place. A solo founder cannot maintain sprawl.
5. Never overclaim. Credibility with senior operators is the whole asset.

## Accessibility & Inclusion

WCAG 2.2 AA. Respect `prefers-reduced-motion` for all animation. Readable on mobile first (senior readers skim on phones).
