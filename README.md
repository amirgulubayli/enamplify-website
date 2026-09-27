# Enamplify

**AI your team builds. Not AI you buy.**

The website for Enamplify, an AI enablement consultancy based in London and Baku that helps mid-sized organisations train their own people to build and run AI workflows safely. Enamplify replaces RAG Medium as the single brand.

The visual system is "The Board Pack": white paper, navy ink, one electric-blue signal, and every outcome shown as a numbered exhibit. See `DESIGN.md` for tokens and rules, `PRODUCT.md` for product truth, and `docs/superpowers/specs/2026-09-27-enamplify-redesign-design.md` for the site structure and copy.

## Run it

Requires **Node.js 22 or newer**. The site has **zero npm dependencies**.

```sh
npm run build
npm start
# Open http://localhost:3000
```

`npm run dev` rebuilds on change. `npm run check` builds and runs every test; Vercel runs the same command as its build step, so a failing test blocks a deploy.

## Pages

20 pre-rendered pages:

- Home, Approach, Work, About, Book a call (`/contact/`)
- Insights index, six essays (`/insights/<slug>/`) and three interactive field guides with PDFs (`/insights/guides/<slug>/`)
- Privacy, Cookies, Terms, Accessibility, and a noindex 404

Retired URLs from the previous site (`/solutions/*`, `/perspectives/*`, `/resources/*`, `/for/*`, `/start/*`, the old `/work/<project>/` notes, `/credits/`, `/thank-you/`) get permanent (308) redirects to their closest successor. The list lives in `src/routes.mjs` and is mirrored in `vercel.json`; a test keeps them identical and loop-free.

## Structure

```
content/site.json            Brand, nav, booking URL, definition sentence
content/work.json            Delivered systems and own products
content/faqs.json            Approach FAQs (also FAQPage JSON-LD)
content/articles.json + articles/*.md   Essays
content/resources.json       Field guides
src/content.mjs              Loads and validates all content
src/routes.mjs               Route table (title, description, crumbs) and redirects
src/seo.mjs                  Document head, canonical, robots, JSON-LD graph
src/exhibits.mjs             Exhibit charts: stacked bar, paired bars, line chart, ledger
src/components.mjs           Header, footer, exhibit frame, cards, close band
src/pages/*.mjs              One renderer per page type
src/markdown.mjs             Safe Markdown subset for essays
assets/styles.css            Board Pack stylesheet (budget 36 KB)
assets/site.js               Menu, enquiry composer, print notes, exhibit reveal (budget 12 KB)
public/fonts/                Self-hosted Schibsted Grotesk and Public Sans (OFL)
scripts/build.mjs            Build: pages, sitemap, robots, RSS, llms.txt
scripts/make_og.py           Renders public/images/social-card.png
scripts/fetch-fonts.mjs      One-off font download
api/enquiry.js               Optional server-side enquiry delivery
```

## Editing

- **Copy:** page copy lives in `src/pages/*.mjs`; shared copy (engagement stages, commitments, track record) in `src/pages/shared.mjs`. Keep sentence case, no em dashes and no kicker lines above headings: the tests enforce these.
- **Essays:** edit `content/articles/*.md` and their metadata in `content/articles.json`.
- **Exhibits:** any illustrative figure must say so in its source line. Replace illustrative data with real pilot numbers when you have them.
- **Booking link:** `bookingUrl` in `content/site.json`.

## Enquiries

The contact page offers a booking link and an email composer that prepares a message in the visitor's own email app and says clearly that nothing has been sent. Server delivery through Resend with Cloudflare Turnstile is implemented but off by default; configure every variable in `.env.example` on Vercel to enable it.

## SEO, AI search and performance

- Unique titles and descriptions, canonical URLs, Open Graph image, sitemap with lastmod, RSS feed.
- JSON-LD on every page: ProfessionalService (London, Baku, UK, Azerbaijan), Person, WebSite; plus BreadcrumbList, FAQPage (Approach) and Article (essays).
- `/llms.txt` summarises the site for AI search engines.
- Core Web Vitals: fonts are self-hosted, preloaded and `font-display: optional` (no layout shift); no hero image; every image has dimensions; no third-party stylesheets or trackers.
- Local and preview builds are noindex. After the custom domain is live, set `SITE_URL=https://enamplify.com` and redeploy.

## Evidence boundaries

No invented clients, logos, testimonials, results or guarantees. Client names are withheld by default. RAG-X is described as a concept. Illustrative exhibits are labelled as such.
