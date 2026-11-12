# Product-led Us and Me (7 November 2026)

The site now centres on the core product, an adaptive AI working environment, while keeping the original Oxblood Editorial identity (assets/styles.css) and the consultancy's credibility.

## Routes

- `/` and `/az/`: **Us**, the default. The workspace for teams and businesses, implemented around existing processes, with advisory and support.
- `/me/` and `/az/me/`: **Me**, the same design for one person. A full landing page with its own title (no "| Enamplify" suffix), no visible breadcrumb, and a `BreadcrumbList` in structured data.
- Both pages are rendered by `src/pages/home.mjs` (`home`, `me`) from one shared structure.

## Us · Me toggle

`audienceToggle` in `src/components.mjs`: two native links (`/` and `/me/`, localised) in a hairline frame. It sits in the header beside the wordmark from 720px and in the mobile menu; on phones it sits above the H1 of both landing pages. The current landing page is marked `aria-current="page"`, and other pages mark Us as the active offering. It needs no JavaScript and can be shared, bookmarked and indexed.

## Actions and cross-links

- Us: "Wire up your team" → `/contact/?interest=Enamplify%20for%20a%20team#enquiry` (`US_ENQUIRY`). Underneath: "Working on your own? Enamplify Me is the same workspace, for one person." → `/me/`.
- Me: "Get me wired up" → `/contact/?interest=Enamplify%20Me#enquiry` (`ME_ENQUIRY`). Underneath: "Looking to wire up your whole team?" → `/`.
- These appear in the hero and the closing band of both pages. The approach page's close also uses the Us action and cross-link. On `/me/` the header action becomes "Get me wired up".
- The contact form gained two interest values, `Enamplify for a team` and `Enamplify Me` (`INTEREST_VALUES` in `src/pages/contact.mjs`). `site.js` already preselects from `?interest=`. The form container carries `id="enquiry"`. A short note above the form tells no-JS visitors which option to choose and states that Me is in development and that a note creates no account. The email label is now "Email", and Organisation is marked optional, so individuals are not asked for a work address. The server validation (`api/enquiry.js`) already accepts any short interest value, so it is unchanged. Nothing new is sent, stored or activated.

## Page structure (both)

Type-led hero (H1 with wine italic line, ruled masthead: lede, action, cross-link, offer list and note), then:

1. "What it is": prose beside a drawn anatomy exhibit. The environment keeps conversations, history and files, supported accounts, tools, agent responsibilities and permissions around a workspace that changes through conversation. A change runs: describe, preview, apply.
2. One original workspace concept (`public/images/workspaces/`), lazy, captioned as illustrative product direction.
3. Uses: three for Us, four for Me.
4. Control lines.
5. Process. Us: Diagnose, Implement, Support, from the shared `common.stages`, now product-centred. Me: honest availability steps.
6. Us only: selected work and the founder. Me only: "The same design as Enamplify for teams", with a link to Us.
7. Close with action and cross-link.

The city-photo hero diptych is gone. London and Baku remain a quiet reference in the footer cities, the site definition and the About photographs.

## Copy and content

- `content/copy/en.json` and `az.json`: new `common` keys (toggle, actions, footer links), `routes.me`, rewritten `home`, new `me`, product-centred stages, approach control and handover, About "why", and contact interests and note. The obsolete capability-model copy was removed. The Azerbaijani dictionary mirrors every key.
- `content/site.json` and `az/site.json`: product-led definition and description.
- `content/faqs.json` and `az/faqs.json`: product-aware answers. They promise no universal compatibility and include no hosting or infrastructure detail.
- `src/seo.mjs`: `standalone` titles, the italic preload on both landing pages, and `knowsAbout` updated.

## CSS

Added the hero masthead, `.audience`, `.cross`, `.duo`, `.anatomy*`, `.support-areas--four` and `.contact__offer`. Removed rules for the old home capability model and diptych, and for chart types that no page renders (stacked bar, paired bars, line chart), to stay inside the 36 KB budget. The `exhibits.mjs` helpers are untouched; reinstate their styles if a page uses them again. The one authored motion is the anatomy core revealing by clip-path on arrival, at rest under reduced motion and in print.

## Tests

Updated only where content or routes deliberately changed:

- Route counts: 63 routes.
- City-photo test: the landing pages now assert no city hero and real, lazy, labelled concept images.
- Italic preload: now expected on Me as well.
- Home test: checks the concept and diagram labels instead of the retired capability model.
- Site definition prefix.

New coverage: the toggle, the enquiry actions and the reciprocal cross-links in both languages, Me's honesty note, its full title, and the contact form's interest options and anchor.

## Not done here

No deployment, no new imagery, no doc drift repair (DESIGN.md's navy palette remains stale and does not govern). Build, tests and browser journeys are run by the parent session.
