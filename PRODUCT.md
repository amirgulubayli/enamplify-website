# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: COOs, Heads of Operations and transformation leads at mid-sized organisations (roughly 200–2,000 staff). They feel the operational drag, own the budget, and think long-term. They read quietly (often on a phone between meetings), rarely comment, and forward what they trust. They are wary of hype, vendors, "$100M offer" language and guarantees; they have seen the standard "AI agency" pitch many times.

Their job: get their teams genuinely using AI to do more, without losing control of data, quality or accountability, and with something they can defend to a board.

Secondary: the managers and team leads under them, who share and forward material upward. Professional services is one strong niche within the ICP.

Two markets: London (UK/EU; hosted delivery; prestige; relationship and event-led) and Baku (on-prem or local cloud; Azerbaijani-language; introduction-led).

## Product Purpose

Enamplify turns a company's own people into the ones who build and run their AI workflows, safely. Success for the client: hours returned to the team, capability that stays in-house after the engagement, and AI use leadership can see, audit and stand behind.

Success for the site: a senior operator reads it and books a diagnostic call.

## Positioning

"AI your team builds, not AI you buy." Competitors run workshops and leave, or sell a tool nobody adopts. Enamplify leaves behind a governed environment and a team that can use it, plus measured results.

The site sells the outcome (capacity, ownership, control), not the mechanism. The governed sandbox, model gateway, and Diagnostic → Pilot → Subscription ladder are real but are revealed in conversation and deeper pages, never led with.

## Operating Context

- Enamplify replaces RAG Medium (ragmedium.com) as the single brand. Custom AI builds and automation remain available as a secondary line behind enablement.
- Delivery (not homepage copy): governed sandbox inside client infrastructure or UK/EU hosting; SSO + roles; self-hostable builder; model gateway routing frontier vs open-weight models by data sensitivity; read-only connectors; audit logs and review before go-live; quarterly impact reporting.
- Commercial ladder: Diagnostic (2–3 weeks, fixed fee, credited to pilot) → Pilot (8–12 weeks, 10–15 champions) → Subscription. Pricing is not published.
- Go-to-market around the site: LinkedIn (founder voice), fortnightly brief (newsletter), hosted dinners/roundtables, handwritten invitations, targeted cold email. The site must be the credible landing point for all of them.
- Booking: https://cal.com/ragmedium/ragmedium (to be renamed). Enquiry form exists at `api/enquiry.js`.

## Capabilities and Constraints

- Existing codebase: zero-dependency static generator (Node ≥22), `scripts/build.mjs`, content in `content/*.json` and `content/articles/*.md`, deployed on Vercel at enamplify.com. Keep zero runtime dependencies unless there is a strong reason.
- Primary CTA: book a diagnostic call. Secondary, lower-commitment routes (readiness scorecard, fortnightly brief, dinner invites) are allowed but must not compete with it.
- No guarantees of outcomes; no percentage-improvement promises.
- Undecided: whether Azerbaijani-language pages ship at launch; name of the fortnightly brief; whether the readiness scorecard is built now.

## Brand Commitments

- Name: Enamplify. Founder-led by Amir Gulubayli (London, Azerbaijani; works across London and Baku).
- Voice: calm, credible, specific, unvarnished. Proof over opinion; "here's what we're seeing" over "leaders must". No hype words, no emoji, no "AI agency" self-description, no "replace yourself" language (frame as removing the boring parts of the job).
- Premium, high-craft presentation that reads as a serious peer to senior operators.
- Visual world is open for redesign; the current parchment/oxblood editorial look is the incumbent, not a binding commitment.

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

1. Sell the destination, not the machinery. Outcomes up front; mechanism only when it answers an objection.
2. Earn authority with specificity. Concrete, verifiable detail beats adjectives; say less, prove more.
3. Control is the reassurance, ownership is the difference, capacity is the reward.
4. Every page must earn its place. A solo founder cannot maintain sprawl.
5. Never overclaim. Credibility with senior operators is the whole asset.

## Accessibility & Inclusion

WCAG 2.2 AA. Respect `prefers-reduced-motion` for all animation. Readable on mobile first (senior readers skim on phones).
