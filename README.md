# Enamplify

**Human potential. Thoughtfully advanced.**

A complete editorial website for Amir Gulubayli’s AI education and advisory practice. Warm parchment, oxblood, original letterform artwork, generous typography and practical, human-centred content.

## Delivery status

The site has been built and tested locally. **No remote GitHub repository or Vercel deployment was created in the development session.** The available GitHub connector did not expose repository creation; the Vercel deployment action returned `Tool deploy_to_vercel not found`. Existing repositories and Vercel projects were not modified.

The publishing script below performs the remaining authenticated operations from your own machine. It does not buy a domain, upgrade a plan, or change DNS.

## Run it

Requires **Node.js 22 or newer**. The site has **zero npm dependencies**.

```sh
npm run build
npm start
# Open http://localhost:3000
```

`npm run dev` rebuilds when content or templates change. Refresh the page after editing. `npm run check` builds and runs the automated test suite. Vercel runs this same check before producing a deployment.

## Publish to a new repository and Vercel

Install GitHub CLI (`gh`) and sign in to the intended accounts through the normal CLI/browser authentication. The script fetches Vercel CLI with `npx`; internet access is required.

```sh
npm run publish:site
```

Default targets are a **new private** `amirgulubayli/enamplify` GitHub repository and a **new** `enamplify` Vercel project in `amirgulubaylis-projects`. Existing conflicting destinations cause the script to stop instead of silently replacing anything. If a step fails after repository creation, the script can resume from the linked folder. Inspect the actual CLI output: the deployment URL is not known in advance.

Optional explicit overrides:

```sh
ENAMPLIFY_REPO=enamplify-website ENAMPLIFY_PROJECT=enamplify-website npm run publish:site
```

Confirm that your Vercel plan permits the intended business use. The script does not choose or purchase a new plan. The provider-side deployment, Git integration and custom-domain configuration still need live verification.

## Pages

38 complete HTML pages, including the custom 404:

- Home; Solutions overview and four engagements; Approach; About; Contact.
- Selected Work index and three founder-project notes: pripitch, grademy, RAG-X.
- Perspectives index with search/topic filters and six complete essays.
- Field Guides index and three interactive worksheets, each with a real two-page PDF.
- Four audience pages: professional services, sales, operations, learning and development.
- Three focused campaign pages.
- Privacy, cookies, terms, accessibility, credits and a post-enquiry utility page.

All routes are listed in `qa/routes.json`. Campaign and utility pages are not indexable. An unknown route produces a custom 404 rather than a single-page-app fallback.

## Architecture

This is a pre-rendered multipage website, not a client-side application that needs hydration. Each route has complete semantic HTML. JavaScript enhances the menu, filters, email composer, print notes and clipboard controls. Native document navigation keeps the website useful without a framework runtime. Supported browsers get a quiet 160 ms crossfade; reduced-motion settings disable the effects.

```
content/site.json          Practice details and navigation
content/services.json      Four engagement pages
content/projects.json      Founder-project facts and narrative
content/audiences.json     Audience-specific pages
content/resources.json     Field-guide web content
content/articles.json      Essay metadata
content/articles/*.md      Authoritative essay copy
src/components.mjs        Reusable visual and semantic components
src/pages.mjs             Page templates
src/markdown.mjs           Safe editorial Markdown subset
assets/styles.css         Responsive design system
assets/site.js            Progressive enhancements
public/downloads/         Finished PDF worksheets
api/enquiry.js            Optional server-side delivery, disabled by default
scripts/build.mjs         HTML, sitemap, RSS, metadata and asset build
scripts/publish.sh        Authenticated repository creation and deployment
```

`dist/` is generated and not committed. It is included in the downloadable handoff so a local preview can be served immediately.

## Editing

Edit essay text in `content/articles/*.md`, and titles, descriptions, categories and dates in `content/articles.json`. The build compiles Markdown; there is no duplicate HTML copy to maintain. The supported subset includes paragraphs, headings `##`–`####`, emphasis, safe links, lists, quotations and code blocks. Raw HTML is escaped. Use a page title in metadata rather than a second `#` heading.

Edit service, project and audience narratives in their JSON files. Add an article by adding its metadata and matching Markdown file. Keep publication dates truthful; do not manufacture historical posts or results.

Field-guide PDF files are already generated. After editing guide content, regenerate the PDFs with `python scripts/make_print_assets.py` in an environment with Pillow, ReportLab and fontconfig. This optional print-production step is not needed for a normal website build.

## Enquiries: the default is deliberately honest

The current contact page is a **functional email composer**. It validates the details, prepares a correctly addressed message, offers an email-app link and a copyable draft, and explicitly tells the visitor that nothing has been sent yet. It does not silently discard a submission or show fake success.

The receiving address is the existing public business contact found in RAGmedium’s source: `amirg@ragmedium.com`. A new Enamplify email address has not been invented or provisioned.

Direct server delivery is implemented, but **has not been connected to a real provider or tested with a real email**. To enable it, configure all the variables in `.env.example` on Vercel, including a verified Resend sender and Cloudflare Turnstile. Keep secrets in Vercel settings, not source control or chat. `CONTACT_ALLOWED_ORIGIN` must contain the exact live origin. The server validates input, origin, token action/hostname and size, uses an idempotency key, and only reports success after provider acceptance. Unit tests mock both providers; they do not send email. Rebuild after changing form mode.

## Images and type

The hero folio, monogram, project illustrations, diagrams, social card and icons are original website assets. Project diagrams are not presented as application screenshots or evidence of results.

The founder-photo reference is `https://ragmedium.com/images/amir-gulubayli.jpg`, found in the existing website source. **Its download could not be verified in the development environment.** The layout has an intentional initials fallback; it never fabricates a likeness. Verify the actual portrait on the live page, or place the approved image at `public/images/amir-gulubayli.jpg`.

An Unsplash library photograph was visually reviewed and selected as editorial atmosphere, not represented as an office or client location. Container downloads failed, so the current source uses the remote reference with a clean fallback. `npm run assets:sync` attempts to make the portrait and library image local. Vercel builds also attempt the sync unless `ASSET_SYNC=0`. A failed sync never changes the contents of existing approved image files.

Typography uses Google-hosted Instrument Serif and DM Sans with system fallbacks. No font binaries are included. The original moodboard’s Canela/Söhne combination is not falsely represented as licensed.

## Metadata, performance and security

Every page has a distinct title and description, canonical URL, Open Graph metadata, semantic landmarks and an appropriate indexing setting. Essays have Article structured data. The practice and founder have conservative structured data without fabricated addresses, awards or review ratings. RSS and XML sitemap are generated.

Styles and scripts are content-hashed and receive immutable caching. Images have dimensions. There is no analytics library, tracking pixel, local-storage persistence, login, checkout or unnecessary frontend dependency. Security headers and a restrictive Content Security Policy are configured in `vercel.json`.

`SITE_URL` takes precedence over the platform URL. When unset, Vercel’s actual production domain is used. Local and preview builds are non-indexable. After connecting the custom domain, set `SITE_URL=https://enamplify.com` and redeploy. Do not claim a domain is connected until its DNS and certificate are verified. If Vercel system environment variables are disabled, set `SITE_URL` explicitly.

## Evidence and publication boundaries

The Work pages are clearly **founder-project notes**, not fabricated Enamplify client case studies. There are no invented testimonials, client logos, revenue improvements, savings, accreditations or guaranteed results. RAG-X remains described as a concept. Existing product links provide context, not proof of customer outcomes.

Services are descriptions of potential scoped engagements; they are not a promise of a fixed delivery schedule or capacity. There are no fabricated programme dates, prices or available seats.

Legal pages describe this implementation and known contact information; they are not a substitute for review of your actual entity, data handling and contracts before commercial engagements.

## QA and remaining launch checks

See `qa/README.md`, `qa/browser-report.json`, `qa/unit-tests.txt` and `docs/LAUNCH_CHECKS.md` for the tested scope and remaining provider-side checks. No Lighthouse score, cross-browser certification or cloud deployment is claimed without measurement.
