# Enamplify Board Pack Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild enamplify.com as a 7-page-type, outcome-led, trust-building site in the "Board Pack" visual world (numbered exhibits, navy and white, one electric-blue signal), with strong SEO/AI-search markup and green Core Web Vitals.

**Architecture:** Keep the existing zero-dependency Node static generator. Split the monolithic `src/pages.mjs` into focused modules: `src/content.mjs` (load and validate content), `src/exhibits.mjs` (SVG/HTML chart builders), `src/components.mjs` (shared chrome), `src/seo.mjs` (document head, JSON-LD), `src/routes.mjs` (route table and redirects) and `src/pages/*.mjs` (one module per page type). `scripts/build.mjs` becomes a thin orchestrator. Fonts are self-hosted WOFF2 with `font-display: optional`.

**Tech Stack:** Node ≥ 22 (ESM, `node:test`), plain HTML/CSS/JS, Vercel static hosting with one serverless function (`api/enquiry.js`), Python Playwright for screenshots and the OG image.

**Spec:** `docs/superpowers/specs/2026-09-27-enamplify-redesign-design.md`. Product truth: `PRODUCT.md`. Direction contract: `.impeccable/surfaces/src-pages-home-mjs.md`.

**House rules the code must obey (enforced by existing tests):** no em dashes (U+2014) in any page, no classes named `eyebrow|section-label|service-kicker|visual-overline`, no `text-transform: uppercase`, no `localStorage`/cookies/trackers in `assets/site.js`, no `style="..."` attributes (the CSP forbids inline styles), sentence case everywhere.

**Commit trailer:** end every commit message with a blank line then `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

---

## File map

| File | Status | Responsibility |
|---|---|---|
| `scripts/fetch-fonts.mjs` | create | One-off: download WOFF2 + OFL licences into `public/fonts/` |
| `public/fonts/*` | create | Self-hosted fonts and licences |
| `content/site.json` | rewrite | Brand, nav, booking URL, definition sentence |
| `content/work.json` | create | Delivered systems + own products |
| `content/faqs.json` | create | Approach FAQs (also FAQPage JSON-LD) |
| `content/services.json`, `content/audiences.json`, `content/projects.json` | delete | Replaced |
| `content/articles/*.md` | modify | Fix internal links to new URLs |
| `src/content.mjs` | create | Load + validate all content |
| `src/exhibits.mjs` | create | `stackedBar`, `pairedBars`, `lineChart`, `ledger` |
| `src/components.mjs` | rewrite | `esc`, icons, buttons, crumbs, header, footer, exhibit frame, cards, close band |
| `src/seo.mjs` | create | `titleFor`, `jsonLd`, `renderDocument` |
| `src/pages/shared.mjs` | create | Copy shared by several pages (commitments, stages) |
| `src/pages/home.mjs` … `legal.mjs` | create | One renderer per page type |
| `src/routes.mjs` | create | `routeTable(ctx)`, `redirects` |
| `src/pages.mjs` | delete | Replaced by `src/pages/*` |
| `scripts/build.mjs` | rewrite | Orchestrate build, sitemap, robots, feed, llms.txt |
| `scripts/sync-assets.mjs` | modify | Drop the Unsplash library image |
| `assets/styles.css` | rewrite | Board Pack styles |
| `assets/site.js` | modify | Drop web-font swap + journal filter; add exhibit reveal |
| `vercel.json` | modify | Redirects, CSP, font caching |
| `tests/*.test.mjs` | create/rewrite | Unit + built-site tests |
| `scripts/make_og.py` | create | Render `public/images/social-card.png` |

---

### Task 1: Branch and self-hosted fonts

**Files:**
- Create: `scripts/fetch-fonts.mjs`, `public/fonts/schibsted-grotesk-latin.woff2`, `public/fonts/public-sans-latin.woff2`, `public/fonts/schibsted-grotesk-OFL.txt`, `public/fonts/public-sans-OFL.txt`

- [ ] **Step 1: Create the branch**

```bash
git checkout -b redesign/board-pack
```

- [ ] **Step 2: Write the fetch script**

`scripts/fetch-fonts.mjs`:

```js
// One-off: downloads the latin variable WOFF2 files and their OFL licences. Not part of the build.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'public/fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const families = [
  {file: 'schibsted-grotesk', query: 'Schibsted+Grotesk:wght@400..900', ofl: 'schibstedgrotesk'},
  {file: 'public-sans', query: 'Public+Sans:wght@100..900', ofl: 'publicsans'}
];

await fs.mkdir(dir, {recursive: true});
for (const f of families) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&display=optional`, {headers: {'User-Agent': UA}})).text();
  const latin = css.split('/* latin */')[1];
  if (!latin) throw new Error(`No latin subset for ${f.file}`);
  const url = latin.match(/url\((https:[^)]+\.woff2)\)/)?.[1];
  if (!url) throw new Error(`No woff2 URL for ${f.file}`);
  const font = Buffer.from(await (await fetch(url)).arrayBuffer());
  await fs.writeFile(path.join(dir, `${f.file}-latin.woff2`), font);
  const licence = await (await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${f.ofl}/OFL.txt`)).text();
  if (!licence.includes('SIL OPEN FONT LICENSE')) throw new Error(`Unexpected licence for ${f.file}`);
  await fs.writeFile(path.join(dir, `${f.file}-OFL.txt`), licence);
  console.log(`${f.file}: ${font.length} bytes`);
}
```

- [ ] **Step 3: Run it**

Run: `node scripts/fetch-fonts.mjs`
Expected: two lines, each `… bytes` between roughly 20,000 and 120,000.

- [ ] **Step 4: Verify the files**

Run: `node -e "const fs=require('fs');for(const f of fs.readdirSync('public/fonts'))console.log(f,fs.statSync('public/fonts/'+f).size)"`
Expected: four files: two `.woff2` and two `-OFL.txt`.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-fonts.mjs public/fonts
git commit -m "chore: self-host Schibsted Grotesk and Public Sans (OFL)"
```

---

### Task 2: Content model

**Files:**
- Rewrite: `content/site.json`
- Create: `content/work.json`, `content/faqs.json`, `src/content.mjs`, `tests/content.test.mjs`
- Delete: `content/services.json`, `content/audiences.json`, `content/projects.json`
- Modify: `content/articles/*.md` (links)

- [ ] **Step 1: Write the failing test**

`tests/content.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadContent} from '../src/content.mjs';

const c = await loadContent();

test('site config carries booking, definition and nav', () => {
  assert.match(c.site.bookingUrl, /^https:\/\//);
  assert.ok(c.site.definition.startsWith('Enamplify is an AI enablement consultancy'));
  assert.deepEqual(c.site.nav.map(([, h]) => h), ['/approach/', '/work/', '/insights/', '/about/']);
});
test('articles are rendered, timed and newest first', () => {
  assert.equal(c.articles.length, 6);
  for (const a of c.articles) { assert.ok(a.html.includes('<p>')); assert.ok(a.readingTime >= 1); }
  const dates = c.articles.map(a => a.isoDate);
  assert.deepEqual(dates, [...dates].sort().reverse());
});
test('articles only link to routes that still exist', () => {
  for (const a of c.articles) assert.ok(!/href="\/(solutions|for|perspectives|resources|start)\//.test(a.html), a.slug);
});
test('work and faqs are present', () => {
  assert.equal(c.work.delivered.length, 8);
  assert.equal(c.work.products.length, 3);
  assert.ok(c.faqs.length >= 6);
  for (const [q, a] of c.faqs) { assert.ok(q.endsWith('?')); assert.ok(a.length > 40); }
});
test('guides keep their PDF slugs', () => {
  assert.deepEqual(c.guides.map(g => g.slug).sort(), ['ai-opportunity-canvas', 'ai-pilot-acceptance-checklist', 'team-ai-readiness']);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/content.test.mjs`
Expected: FAIL, `Cannot find module '…/src/content.mjs'`.

- [ ] **Step 3: Write `content/site.json`**

```json
{
  "name": "Enamplify",
  "descriptor": "AI enablement for mid-sized teams",
  "definition": "Enamplify is an AI enablement consultancy, based in London and Baku, that helps mid-sized organisations train their own people to build and run AI workflows safely.",
  "description": "AI your team builds, not AI you buy. We help mid-sized organisations make AI part of how their people work: more done, owned in-house, in control.",
  "email": "amirg@ragmedium.com",
  "founder": "Amir Gulubayli",
  "linkedin": "https://www.linkedin.com/in/amirgulubayli/",
  "bookingUrl": "https://cal.com/ragmedium/ragmedium",
  "siteUrl": "https://enamplify.com",
  "portrait": "https://ragmedium.com/images/amir-gulubayli.jpg",
  "launchDate": "2026-09-27",
  "cities": ["London", "Baku"],
  "nav": [["Approach", "/approach/"], ["Work", "/work/"], ["Insights", "/insights/"], ["About", "/about/"]]
}
```

- [ ] **Step 4: Write `content/work.json`**

```json
{
  "delivered": [
    ["AI clinical trial management", "Safer trial operations, grounded search and less friction across complex clinical workflows."],
    ["AI finance tracking", "Clearer reporting, automated reconciliation and an always-current view of financial performance."],
    ["Market intelligence", "Research, communications and decision support built around live market signals."],
    ["Outbound growth systems", "Signal-led prospecting, enrichment, qualification and outreach without the busywork."],
    ["SaaS product builds", "Focused software products taken from a rough workflow to a production-ready platform."],
    ["Internal operations", "Custom systems that remove repetitive handoffs and give teams a shared source of truth."],
    ["Marketing agency systems", "Brand-aware content, distribution and campaign systems with human judgement built in."],
    ["PR agency systems", "Research, outreach, pitching and reporting workflows that turn good stories into momentum."]
  ],
  "products": [
    {"name": "grademy", "url": "https://www.grademy.work/", "status": "In market", "line": "An adaptive AI study ecosystem grounded in the material learners actually use."},
    {"name": "pripitch", "url": "https://www.pripitch.com/", "status": "In market", "line": "Sales intelligence for meeting preparation, prospect context and better conversations."},
    {"name": "RAG-X", "url": null, "status": "Concept", "line": "An AI-first CRM concept exploring how business information can support better questions."}
  ]
}
```

- [ ] **Step 5: Write `content/faqs.json`**

```json
[
  ["Do our people need a technical background?", "No. We start from the tasks people already do. Most of the people who build workflows during a pilot have never written code."],
  ["Which AI models and tools do you use?", "Whatever fits your data and your rules. Low-sensitivity work can use leading commercial models under enterprise terms; sensitive work can run on models inside your own environment. You are not locked into our choices."],
  ["Where does our data go?", "Only where you have approved. We agree data boundaries before anything is built, and we can deploy on your own infrastructure or in UK or EU hosting."],
  ["How do we know it worked?", "We agree a baseline and two or three measures before we start, such as hours spent on a task or review effort, and we report against them. Attendance is not an outcome."],
  ["Do you guarantee results?", "No. Outcomes depend on your data, approvals and people, which we do not control. We price the first steps so you can see value before committing to more."],
  ["What does it cost?", "The diagnostic is a fixed fee, credited against the pilot if you continue. Pilot and ongoing fees depend on scope and team size, and are set out in a written proposal."],
  ["Do you work outside London?", "Yes. We work across the UK and Europe from London, and across Azerbaijan from Baku, where we can deliver in Azerbaijani."]
]
```

- [ ] **Step 6: Write `src/content.mjs`**

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMarkdown} from './markdown.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const readJson = async name => JSON.parse(await fs.readFile(path.join(root, 'content', `${name}.json`), 'utf8'));

export async function loadContent() {
  const [site, articles, guides, work, faqs] = await Promise.all(['site', 'articles', 'resources', 'work', 'faqs'].map(readJson));
  for (const item of [...articles, ...guides]) if (!SLUG.test(item.slug)) throw new Error(`Invalid content slug: ${item.slug}`);
  for (const a of articles) {
    const md = await fs.readFile(path.join(root, 'content/articles', `${a.slug}.md`), 'utf8');
    a.html = renderMarkdown(md);
    a.readingTime = Math.max(1, Math.ceil(md.split(/\s+/).length / 220));
  }
  articles.sort((x, y) => y.isoDate.localeCompare(x.isoDate));
  return {site, articles, guides, work, faqs};
}
```

- [ ] **Step 7: Fix article links and delete retired content**

Run:

```bash
node -e "
const fs=require('fs');const map=[['/contact/?interest=Team%20education','/contact/'],['/for/sales-teams/','/approach/'],['/resources/ai-pilot-acceptance-checklist/','/insights/guides/ai-pilot-acceptance-checklist/'],['/solutions/ai-training/','/approach/'],['/solutions/leadership-briefing/','/approach/'],['/solutions/workflow-design/','/approach/']];
for(const f of fs.readdirSync('content/articles')){const p='content/articles/'+f;let s=fs.readFileSync(p,'utf8');for(const [a,b] of map)s=s.split('('+a+')').join('('+b+')');fs.writeFileSync(p,s);}"
git rm content/services.json content/audiences.json content/projects.json
```

Then check: `grep -rn "](/\(solutions\|for\|perspectives\|resources\|start\)/" content/articles`
Expected: no output.

- [ ] **Step 8: Run the test to verify it passes**

Run: `node --test tests/content.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 9: Commit**

```bash
git add content src/content.mjs tests/content.test.mjs
git commit -m "feat(content): new content model for the redesign"
```

---

### Task 3: Exhibit builders

**Files:**
- Create: `src/exhibits.mjs`, `tests/exhibits.test.mjs`
- Modify: `src/components.mjs` (Step 3 prepends only `esc`, full rewrite in Task 4)

- [ ] **Step 1: Write the failing test**

`tests/exhibits.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {stackedBar, pairedBars, lineChart, ledger} from '../src/exhibits.mjs';

const week = [
  {label: 'Judgement and client work', value: 41, tone: 'navy'},
  {label: 'Recurring reporting', value: 21, tone: 'signal'},
  {label: 'Finding information', value: 16, tone: 'signal'},
  {label: 'Handoffs and chasing', value: 13, tone: 'signal'},
  {label: 'Other', value: 9, tone: 'rule'}
];

test('stackedBar draws one mark per segment and a readable legend', () => {
  const html = stackedBar(week);
  assert.equal([...html.matchAll(/class="mark mark--/g)].length, 5);
  assert.ok(html.includes('aria-hidden="true"'));
  assert.ok(html.includes('Recurring reporting') && html.includes('21%'));
});
test('stackedBar refuses segments that do not total 100', () => {
  assert.throws(() => stackedBar([{label: 'A', value: 40, tone: 'navy'}]), /total 100/);
});
test('pairedBars scales against max and labels values', () => {
  const html = pairedBars({unit: 'hours', max: 16, rows: [{label: 'Before', value: 14, tone: 'rule'}, {label: 'After', value: 6, tone: 'signal'}]});
  assert.ok(html.includes('width="87.5"'));
  assert.ok(html.includes('width="37.5"'));
  assert.ok(html.includes('aria-label="Before: 14 hours; After: 6 hours"'));
});
test('lineChart emits one polyline per series with pathLength for the reveal', () => {
  const html = lineChart({xLabels: ['Month 1', 'Month 12'], max: 12, series: [
    {label: 'Maintained by your team', tone: 'signal', values: [0, 2, 5, 9, 12]},
    {label: 'Maintained by Enamplify', tone: 'navy', values: [3, 4, 3, 2, 1]}
  ]});
  assert.equal([...html.matchAll(/<polyline /g)].length, 2);
  assert.ok(html.includes('pathLength="1"'));
  assert.ok(html.includes('role="img"'));
});
test('ledger uses row and column headers', () => {
  const html = ledger({caption: 'Example', columns: ['Workflow', 'Owner'], rows: [['Board report', 'Finance']]});
  assert.ok(html.includes('<th scope="col">Workflow</th>'));
  assert.ok(html.includes('<th scope="row">Board report</th>'));
  assert.ok(html.includes('<td>Finance</td>'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/exhibits.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/exhibits.mjs`**

```js
import {esc} from './components.mjs';

const pct = n => `${Math.round(n)}%`;
const legend = items => `<ul class="legend">${items.map(s => `<li><span class="swatch swatch--${s.tone}" aria-hidden="true"></span><span class="legend__label">${esc(s.label)}</span>${s.value === undefined ? '' : `<span class="legend__value">${pct(s.value)}</span>`}</li>`).join('')}</ul>`;

/** A single 100% horizontal bar. The legend carries the data for assistive technology. */
export function stackedBar(segments) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (Math.round(total) !== 100) throw new Error(`Stacked bar segments must total 100, got ${total}`);
  let x = 0;
  const rects = segments.map(s => {
    const rect = `<rect class="mark mark--${s.tone}" x="${x}" y="0" width="${Math.max(s.value - 0.6, 0)}" height="14"/>`;
    x += s.value;
    return rect;
  }).join('');
  return `<svg class="stack" viewBox="0 0 100 14" preserveAspectRatio="none" width="100" height="14" aria-hidden="true">${rects}</svg>${legend(segments)}`;
}

/** Horizontal bars on a shared scale, one row per value. */
export function pairedBars({unit, max, rows}) {
  const label = rows.map(r => `${r.label}: ${r.value} ${unit}`).join('; ');
  return `<div class="bars" role="img" aria-label="${esc(label)}">${rows.map(r => `<div class="bars__row" aria-hidden="true"><span class="bars__label">${esc(r.label)}</span><svg class="bars__track" viewBox="0 0 100 12" preserveAspectRatio="none" width="100" height="12"><rect class="bars__bg" x="0" y="0" width="100" height="12"/><rect class="mark mark--${r.tone}" x="0" y="0" width="${+(r.value / max * 100).toFixed(1)}" height="12"/></svg><span class="bars__value">${r.value} ${esc(unit)}</span></div>`).join('')}</div>`;
}

/** Hairline line chart; labels live in HTML so they never scale with the SVG. */
export function lineChart({xLabels, series, max}) {
  const W = 300, H = 150, P = 6, n = series[0].values.length;
  const x = i => P + i * (W - 2 * P) / (n - 1);
  const y = v => H - P - v / max * (H - 2 * P);
  const grid = [0, 0.5, 1].map(t => `<line class="gridline" x1="0" x2="${W}" y1="${y(max * t)}" y2="${y(max * t)}"/>`).join('');
  const lines = series.map(s => `<polyline class="mark-line mark-line--${s.tone}" pathLength="1" points="${s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>`).join('');
  const label = series.map(s => `${s.label}: from ${s.values[0]} to ${s.values.at(-1)}`).join('; ');
  return `<svg class="linechart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">${grid}${lines}</svg><div class="axis" aria-hidden="true"><span>${esc(xLabels[0])}</span><span>${esc(xLabels.at(-1))}</span></div>${legend(series.map(({label, tone}) => ({label, tone})))}`;
}

/** A small governance ledger: first cell of each row is its header. */
export const ledger = ({caption, columns, rows}) => `<div class="ledger-scroll"><table class="ledger"><caption class="sr-only">${esc(caption)}</caption><thead><tr>${columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((cell, i) => i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
```

Note: `src/components.mjs` already exports `esc` (line 1), so this import works before Task 4.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/exhibits.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/exhibits.mjs tests/exhibits.test.mjs
git commit -m "feat(exhibits): SVG and table builders for board-pack exhibits"
```

---

### Task 4: Shared components

**Files:**
- Rewrite: `src/components.mjs`
- Create: `tests/components.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/components.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {esc, header, footer, exhibit, breadcrumb, closeBand} from '../src/components.mjs';

const site = {name: 'Enamplify', email: 'a@b.co', linkedin: 'https://example.com/in', cities: ['London', 'Baku'], definition: 'Enamplify is an AI enablement consultancy.', nav: [['Approach', '/approach/'], ['Work', '/work/']]};

test('esc escapes markup', () => assert.equal(esc('<a "b">'), '&lt;a &quot;b&quot;&gt;'));
test('header marks the current section and offers a quiet booking link', () => {
  const html = header(site, '/work/');
  assert.ok(html.includes('<a href="/work/" aria-current="page">Work</a>'));
  assert.ok(!html.includes('<a href="/approach/" aria-current'));
  assert.ok(html.includes('Book a call'));
  assert.ok(html.includes('Skip to content'));
});
test('footer carries the definition sentence and both cities', () => {
  const html = footer(site);
  assert.ok(html.includes('Enamplify is an AI enablement consultancy.'));
  assert.ok(html.includes('London · Baku'));
});
test('exhibit is a figure with label, title and source', () => {
  const html = exhibit({n: 2, title: 'More done', chart: '<svg></svg>', source: 'Illustrative.'});
  assert.match(html, /^<figure class="exhibit/);
  assert.ok(html.includes('Exhibit 2') && html.includes('More done') && html.includes('Source: Illustrative.'));
});
test('breadcrumb marks the last crumb as current', () => {
  assert.ok(breadcrumb([['Insights', '/insights/'], ['Essay']]).includes('<span aria-current="page">Essay</span>'));
});
test('close band links to contact', () => assert.ok(closeBand().includes('href="/contact/"')));
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/components.test.mjs`
Expected: FAIL (`exhibit`/`closeBand` signatures and footer text differ).

- [ ] **Step 3: Rewrite `src/components.mjs`**

```js
export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const arrow = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>`;
export const arrowNE = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>`;

export const button = (text, href, variant = 'primary', extra = '') => `<a class="btn btn--${variant}" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;
export const textLink = (text, href, extra = '') => `<a class="link-arrow" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;

export const breadcrumb = crumbs => `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${crumbs.map(([t, h]) => `<li>${h ? `<a href="${esc(h)}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;

export const pageHead = ({title, lede = '', crumbs}) => `${breadcrumb(crumbs)}<header class="page-head wrap"><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>`;

export const exhibit = ({n, title, chart, source, note = '', cls = ''}) => `<figure class="exhibit${cls ? ` ${cls}` : ''}"><figcaption class="exhibit__cap"><span class="exhibit__label">Exhibit ${n}</span><span class="exhibit__title">${esc(title)}</span></figcaption><div class="exhibit__chart">${chart}</div>${note ? `<p class="exhibit__note">${esc(note)}</p>` : ''}<p class="exhibit__source">Source: ${esc(source)}</p></figure>`;

export const closeBand = ({title = 'When the timing is right, start with a conversation.', body = 'Thirty minutes about your team and the work you’d like to change. If we’re not the right fit, we’ll say so.'} = {}) => `<section class="close" aria-labelledby="close-title"><div class="wrap close__inner"><h2 id="close-title">${esc(title)}</h2><div class="close__body"><p>${esc(body)}</p>${button('Book a diagnostic call', '/contact/', 'inverse')}</div></div></section>`;

export const articleCard = a => `<article class="card"><p class="card__meta">${esc(a.category)} · ${a.readingTime} min read</p><h3 class="card__title"><a href="/insights/${a.slug}/">${esc(a.title)}</a></h3><p>${esc(a.summary)}</p></article>`;
export const guideCard = g => `<article class="card card--guide"><p class="card__meta">Field guide · ${esc(g.time)}</p><h3 class="card__title"><a href="/insights/guides/${g.slug}/">${esc(g.name)}</a></h3><p>${esc(g.description)}</p></article>`;

export const portrait = site => `<figure class="portrait"><img class="remote-image" src="${esc(site.portrait)}" alt="Amir Gulubayli, founder of Enamplify" width="640" height="800" loading="lazy" decoding="async"><figcaption>Amir Gulubayli, Founder</figcaption></figure>`;

export function header(site, path) {
  const links = site.nav.map(([t, h]) => `<a href="${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('');
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="wrap site-header__inner"><a class="wordmark" href="/" aria-label="Enamplify home">Enamplify</a><nav class="site-nav" aria-label="Main">${links}</nav><a class="btn btn--quiet site-header__cta" href="/contact/">Book a call</a><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false"><span class="menu-label">Menu</span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Mobile" inert hidden><div class="wrap">${site.nav.map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}<a href="/contact/">Book a call</a></div></nav></header><noscript><nav class="noscript-nav wrap" aria-label="Main without JavaScript">${links}<a href="/contact/">Book a call</a></nav></noscript>`;
}

export function footer(site) {
  const legal = [['Privacy', '/privacy/'], ['Cookies', '/cookies/'], ['Terms', '/terms/'], ['Accessibility', '/accessibility/']];
  return `<footer class="site-footer"><div class="wrap"><div class="site-footer__top"><div class="site-footer__brand"><a class="wordmark" href="/">Enamplify</a><p>${esc(site.definition)}</p><p class="site-footer__cities">${site.cities.map(esc).join(' · ')}</p></div><nav aria-label="Footer"><h2>Pages</h2>${[...site.nav, ['Book a call', '/contact/']].map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</nav><div><h2>Contact</h2><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer">Amir on LinkedIn ${arrowNE}</a><a href="/feed.xml">Insights feed</a></div></div><div class="site-footer__bottom"><p>© ${new Date().getFullYear()} Enamplify</p><nav aria-label="Legal">${legal.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</nav></div></div></footer>`;
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/components.test.mjs tests/exhibits.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components.mjs tests/components.test.mjs
git commit -m "feat(components): board-pack chrome, exhibit frame and cards"
```

---

### Task 5: SEO module

**Files:**
- Create: `src/seo.mjs`, `tests/seo.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/seo.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {titleFor, jsonLd, renderDocument} from '../src/seo.mjs';

const site = {name: 'Enamplify', email: 'a@b.co', founder: 'Amir Gulubayli', linkedin: 'https://example.com/in', definition: 'Enamplify is an AI enablement consultancy.', cities: ['London', 'Baku'], nav: [['Work', '/work/']]};
const base = 'https://enamplify.com';
const graph = route => JSON.parse(jsonLd({base, site, route}))['@graph'];
const types = route => graph(route).map(n => n['@type']);

test('titles: home is literal, others get the brand suffix', () => {
  assert.equal(titleFor({home: true, title: 'Enamplify · AI enablement'}, site), 'Enamplify · AI enablement');
  assert.equal(titleFor({title: 'Work.'}, site), 'Work | Enamplify');
});
test('every page carries the practice, founder and website', () => {
  assert.deepEqual(types({url: '/'}), ['ProfessionalService', 'Person', 'WebSite']);
  const org = graph({url: '/'})[0];
  assert.deepEqual(org.areaServed.map(a => a.name), ['London', 'Baku', 'United Kingdom', 'Azerbaijan']);
});
test('breadcrumbs, FAQs and articles add their own nodes', () => {
  assert.ok(types({url: '/work/', crumbs: [['Work']]}).includes('BreadcrumbList'));
  assert.ok(types({url: '/approach/', faqs: [['Q?', 'A.']]}).includes('FAQPage'));
  assert.ok(types({url: '/insights/x/', article: {title: 'T', summary: 'S', isoDate: '2026-09-26'}}).includes('Article'));
});
test('JSON-LD cannot break out of its script tag', () => {
  assert.ok(!jsonLd({base, site: {...site, definition: '</script>'}, route: {url: '/'}}).includes('</script>'));
});
test('document preloads fonts, uses no third-party stylesheet and sets robots', () => {
  const html = renderDocument({base, site, route: {url: '/work/', title: 'Work', description: 'D', html: '<h1>W</h1>'}, cssName: 's.css', jsName: 's.js', indexable: false});
  assert.ok(html.includes('rel="preload" href="/fonts/schibsted-grotesk-latin.woff2"'));
  assert.ok(!/<link[^>]+rel="stylesheet"[^>]+https:/.test(html));
  assert.ok(html.includes('content="noindex,follow"'));
  assert.ok(html.includes('<link rel="canonical" href="https://enamplify.com/work/">'));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/seo.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/seo.mjs`**

```js
import {esc, header, footer} from './components.mjs';

export const titleFor = (route, site) => route.home ? route.title : `${route.title.replace(/\.$/, '')} | ${site.name}`;

export function jsonLd({base, site, route}) {
  const canonical = base + route.url;
  const graph = [
    {'@type': 'ProfessionalService', '@id': `${base}/#practice`, name: site.name, url: `${base}/`, description: site.definition, email: site.email, logo: `${base}/favicon.svg`, image: `${base}/images/social-card.png`, founder: {'@id': `${base}/#founder`},
      areaServed: [{'@type': 'City', name: 'London'}, {'@type': 'City', name: 'Baku'}, {'@type': 'Country', name: 'United Kingdom'}, {'@type': 'Country', name: 'Azerbaijan'}],
      knowsAbout: ['AI enablement', 'AI training for teams', 'AI governance', 'Workflow automation'], sameAs: [site.linkedin]},
    {'@type': 'Person', '@id': `${base}/#founder`, name: site.founder, jobTitle: 'Founder', worksFor: {'@id': `${base}/#practice`}, sameAs: [site.linkedin]},
    {'@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.name, inLanguage: 'en-GB', publisher: {'@id': `${base}/#practice`}}
  ];
  if (route.crumbs) graph.push({'@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...route.crumbs].map(([name, url], i) => ({'@type': 'ListItem', position: i + 1, name, item: base + (url || route.url)}))});
  if (route.faqs) graph.push({'@type': 'FAQPage', mainEntity: route.faqs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
  if (route.article) {
    const a = route.article;
    graph.push({'@type': 'Article', headline: a.title, description: a.summary, datePublished: a.isoDate, dateModified: a.isoDate, author: {'@id': `${base}/#founder`}, publisher: {'@id': `${base}/#practice`}, mainEntityOfPage: canonical, image: `${base}/images/social-card.png`, inLanguage: 'en-GB'});
  }
  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c');
}

export function renderDocument({base, site, route, cssName, jsName, indexable, turnstileKey = ''}) {
  const title = titleFor(route, site);
  const canonical = base + route.url;
  let body = route.html;
  let turnstile = '';
  if (route.contact && turnstileKey) {
    turnstile = '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>';
    body = body.replace('<div id="form-errors"', `<div class="cf-turnstile" data-sitekey="${esc(turnstileKey)}" data-theme="light" data-action="enquiry"></div><div id="form-errors"`);
  }
  const fonts = ['schibsted-grotesk', 'public-sans'].map(f => `<link rel="preload" href="/fonts/${f}-latin.woff2" as="font" type="font/woff2" crossorigin>`).join('');
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#FFFFFF"><title>${esc(title)}</title><meta name="description" content="${esc(route.description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${esc(canonical)}">${fonts}<link rel="stylesheet" href="/assets/${cssName}"><script src="/assets/${jsName}" defer></script>${turnstile}<meta property="og:type" content="${route.article ? 'article' : 'website'}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:locale" content="en_GB"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(base)}/images/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Enamplify. AI your team builds, not AI you buy."><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.png" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="Enamplify Insights" href="/feed.xml"><script type="application/ld+json">${jsonLd({base, site, route})}</script></head><body id="top" class="${route.bodyClass || ''}">${header(site, route.url)}<main id="main" tabindex="-1">${body}</main>${footer(site)}</body></html>`;
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `node --test tests/seo.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/seo.mjs tests/seo.test.mjs
git commit -m "feat(seo): document head and JSON-LD graph"
```

---

### Task 6: Shared copy and the home page

**Files:**
- Create: `src/pages/shared.mjs`, `src/pages/home.mjs`

- [ ] **Step 1: Write `src/pages/shared.mjs`**

```js
export const stages = [
  {n: '01', name: 'Diagnose', time: '2–3 weeks',
    short: 'We map where your team’s time goes and choose the few workflows worth doing first. The fee is credited if you continue.',
    what: 'We talk to the people who do the work, map where their time goes, and check what your data, systems and policies allow.',
    get: ['A baseline of where time goes today', 'Three to five workflows ranked by value and risk', 'A pilot plan with the measures agreed up front'],
    note: 'Fixed fee, credited against the pilot if you continue.'},
  {n: '02', name: 'Prove', time: '8–12 weeks',
    short: 'One or two teams build real workflows with us, measured against numbers agreed up front.',
    what: 'Ten to fifteen people from one or two teams build real workflows with us, in a governed environment set up for your organisation.',
    get: ['Workflows in daily use, not demos', 'People who can build the next ones themselves', 'Results measured against the baseline'],
    note: 'Scoped and priced in a written proposal after the diagnostic.'},
  {n: '03', name: 'Scale', time: 'Ongoing',
    short: 'Roll out on your terms, with governance, new use cases and a quarterly report on what changed.',
    what: 'Extend to more teams at the pace you choose. We keep the environment governed, add new workflow templates, and report on what changed each quarter.',
    get: ['A growing library of workflows your team owns', 'Governance that keeps pace with use', 'A quarterly impact report for leadership'],
    note: 'A subscription you can scale up, down or end.'}
];

export const commitments = {
  wont: ['Promise percentages we can’t evidence.', 'Lock you into our tools.', 'Move your data anywhere you haven’t approved.', 'Frame this as replacing your people.'],
  will: ['Agree how success is measured before we start.', 'Leave you with something your team runs without us.']
};
```

- [ ] **Step 2: Write `src/pages/home.mjs`**

```js
import {esc, button, textLink, exhibit, closeBand, articleCard, portrait} from '../components.mjs';
import {stackedBar, pairedBars, lineChart, ledger} from '../exhibits.mjs';
import {stages, commitments} from './shared.mjs';

export const weekSegments = [
  {label: 'Judgement and client work', value: 41, tone: 'navy'},
  {label: 'Recurring reporting', value: 21, tone: 'signal'},
  {label: 'Finding information', value: 16, tone: 'signal'},
  {label: 'Handoffs and chasing', value: 13, tone: 'signal'},
  {label: 'Other', value: 9, tone: 'rule'}
];

const situation = [
  ['Tools were bought. The work didn’t change.', 'Licences go unused when nobody is given the permission, or the method, to change how the work is done.'],
  ['The real use is out of sight.', 'People paste work into personal accounts because the approved route is slower. Leadership can’t see it, so it can’t improve it.'],
  ['Pilots stall in month two.', 'The demo worked. Ownership, review and handoffs were never designed.']
];

const figures = [
  ['$10,000', 'Google hackathon winning build'],
  ['10+ years', 'Building software, automation and AI systems'],
  ['2 products', 'Of our own in market: grademy and pripitch']
];

const outcomes = () => [
  exhibit({n: 2, title: 'More done', cls: 'exhibit--outcome',
    chart: pairedBars({unit: 'hours', max: 16, rows: [{label: 'Before', value: 14, tone: 'rule'}, {label: 'After', value: 6, tone: 'signal'}]}),
    note: 'Hours come back from the work nobody chose: reporting, searching, re-keying, chasing.',
    source: 'Illustrative. Weekly hours on recurring admin for one role.'}),
  exhibit({n: 3, title: 'Owned in-house', cls: 'exhibit--outcome',
    chart: lineChart({xLabels: ['Month 1', 'Month 12'], max: 12, series: [
      {label: 'Maintained by your team', tone: 'signal', values: [0, 1, 3, 5, 8, 10, 12]},
      {label: 'Maintained by Enamplify', tone: 'navy', values: [3, 4, 4, 3, 2, 1, 1]}]}),
    note: 'Your people learn to build and run their own workflows. When we step back, the capability stays.',
    source: 'Illustrative.'}),
  exhibit({n: 4, title: 'In control', cls: 'exhibit--outcome',
    chart: ledger({caption: 'Example workflow ledger', columns: ['Workflow', 'Owner', 'Reviewed', 'Data stays in'], rows: [
      ['Monthly board report', 'Finance', 'Yes', 'Your environment'],
      ['Client enquiry triage', 'Operations', 'Yes', 'Your environment'],
      ['Contract first read', 'Legal', 'Yes', 'Your environment']]}),
    note: 'Every workflow is visible, reviewed before it goes live, and runs inside limits you set.',
    source: 'Example ledger.'})
].join('');

export function home({site, articles, work}) {
  return `<section class="hero wrap" aria-labelledby="hero-title">
<div class="hero__copy"><h1 id="hero-title">AI your team builds. <span class="h1-alt">Not AI you buy.</span></h1>
<p class="lede">Enamplify helps mid-sized organisations make AI part of how their own people work. More gets done each week, the capability stays in-house, and every workflow is visible to the people accountable for it.</p>
<div class="actions">${button('Book a diagnostic call', '/contact/')}${textLink('How we work', '/approach/')}</div>
<p class="note">A 30-minute conversation with the founder. No pitch deck.</p></div>
${exhibit({n: 1, title: 'Where an operations team’s week goes', cls: 'hero__exhibit', chart: stackedBar(weekSegments), note: 'The blue share is where AI workflows usually start.', source: 'Illustrative composite for explanation. A diagnostic replaces it with your own numbers.'})}
</section>

<section class="section wrap" aria-labelledby="situation-title">
<h2 id="situation-title" class="section__title">Your people are already using AI. The question is whether it’s working for the organisation.</h2>
<ol class="numbered">${situation.map(([t, p], i) => `<li><span class="numbered__n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
<p class="marked">Most AI rollouts don’t fail on technology. They fail on who owns the work afterwards.</p>
</section>

<section class="section section--wash" aria-labelledby="outcomes-title"><div class="wrap">
<h2 id="outcomes-title" class="section__title">Three things you can take to the board.</h2>
<div class="outcomes">${outcomes()}</div>
</div></section>

<section class="section wrap" aria-labelledby="start-title">
<div class="split"><h2 id="start-title" class="section__title">Start small. Prove it. Then decide.</h2>
<div><ol class="stages">${stages.map(s => `<li><span class="stages__n">${s.n}</span><div><h3>${esc(s.name)} <span class="stages__time">${esc(s.time)}</span></h3><p>${esc(s.short)}</p></div></li>`).join('')}</ol>
${textLink('More on our approach', '/approach/')}</div></div>
</section>

<section class="section wrap" aria-labelledby="commit-title">
<h2 id="commit-title" class="section__title">What we will and won’t do.</h2>
<div class="commitments"><div><h3>We won’t</h3><ul class="ticks ticks--no">${commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>We will</h3><ul class="ticks">${commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>
</section>

<section class="section section--wash" aria-labelledby="record-title"><div class="wrap">
<h2 id="record-title" class="section__title">Built by people who ship.</h2>
<dl class="figures">${figures.map(([n, l]) => `<div class="figure"><dt>${esc(l)}</dt><dd>${esc(n)}</dd></div>`).join('')}</dl>
<ul class="delivered">${work.delivered.map(([t]) => `<li>${esc(t)}</li>`).join('')}</ul>
${textLink('See the work', '/work/')}
</div></section>

<section class="section wrap founder" aria-labelledby="founder-title">
${portrait(site)}
<div><h2 id="founder-title" class="section__title">Founder-led, between London and Baku.</h2>
<blockquote class="quote"><p>“The organisations getting real value from AI aren’t the ones with the biggest budgets. They’re the ones whose own people know how to use it.”</p><footer>Amir Gulubayli, Founder</footer></blockquote>
${textLink('About Enamplify', '/about/')}</div>
</section>

<section class="section wrap" aria-labelledby="insights-title">
<div class="section__row"><h2 id="insights-title" class="section__title">Recent thinking.</h2>${textLink('All insights', '/insights/')}</div>
<div class="cards">${articles.slice(0, 3).map(articleCard).join('')}</div>
</section>
${closeBand()}`;
}
```

- [ ] **Step 3: Smoke-check it renders**

Run: `node -e "import('./src/content.mjs').then(async m=>{const c=await m.loadContent();const {home}=await import('./src/pages/home.mjs');const h=home(c);console.log(h.length,(h.match(/<h1/g)||[]).length,/\u2014/.test(h))})"`
Expected: a length over 8000, then `1 false`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/shared.mjs src/pages/home.mjs
git commit -m "feat(home): board-pack home page with four exhibits"
```

---

### Task 7: Approach, Work and About pages

**Files:**
- Create: `src/pages/approach.mjs`, `src/pages/work.mjs`, `src/pages/about.mjs`

- [ ] **Step 1: Write `src/pages/approach.mjs`**

```js
import {esc, pageHead, closeBand} from '../components.mjs';
import {stages} from './shared.mjs';

const control = [
  ['Your sign-in, your roles', 'People sign in with their company accounts. Roles decide who can build, who approves and who uses.'],
  ['Reviewed before it runs', 'No workflow goes live without a named owner and a review step.'],
  ['A complete record', 'Every run is logged, so you can see what happened, when, and on whose authority.'],
  ['Data routed by sensitivity', 'Sensitive information only goes to models that run in your environment. Nobody has to make that call by hand.'],
  ['Spending you can see', 'Usage limits per team, and a clear view of what AI is costing you.'],
  ['Hosted where you decide', 'On your own infrastructure, or in UK or EU hosting.']
];
const leaves = ['Workflows your people use every week', 'People who can build the next ones', 'A playbook for how your organisation uses AI', 'A measured baseline, and the evidence of what changed'];

export function approach({faqs}) {
  return `${pageHead({title: 'Start small. Prove it. Then scale.', lede: 'Every engagement begins with a small, fixed piece of work and a clear decision point. You only go further when the evidence says it’s worth it.', crumbs: [['Approach']]})}
<section class="section wrap" aria-label="Stages">
<ol class="stage-detail">${stages.map(s => `<li><div class="stage-detail__head"><span class="stages__n">${s.n}</span><h2>${esc(s.name)}</h2><p class="stages__time">${esc(s.time)}</p></div><div><p>${esc(s.what)}</p><h3>What you get</h3><ul class="ticks">${s.get.map(g => `<li>${esc(g)}</li>`).join('')}</ul><p class="small">${esc(s.note)}</p></div></li>`).join('')}</ol>
</section>
<section class="section section--wash" aria-labelledby="control-title"><div class="wrap">
<h2 id="control-title" class="section__title">What “in control” means in practice.</h2>
<ul class="grid-list">${control.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
</div></section>
<section class="section wrap" aria-labelledby="leaves-title">
<div class="split"><h2 id="leaves-title" class="section__title">What your team is left with.</h2><ul class="ticks ticks--large">${leaves.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
</section>
<section class="section wrap" aria-labelledby="faq-title">
<div class="split"><h2 id="faq-title" class="section__title">Questions leaders ask.</h2>
<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>
</section>
${closeBand()}`;
}
```

- [ ] **Step 2: Write `src/pages/work.mjs`**

```js
import {esc, arrowNE, pageHead, closeBand} from '../components.mjs';

export function work({work}) {
  return `${pageHead({title: 'Systems we’ve built. Products we run.', lede: 'Before Enamplify, we built AI systems for clients under the RAG Medium name. The same people now help your team build its own.', crumbs: [['Work']]})}
<section class="section wrap" aria-labelledby="recognition-title">
<div class="recognition"><h2 id="recognition-title">Google hackathon winners</h2><p>A $10,000 winning build, recognised for technical depth, usefulness and execution.</p></div>
</section>
<section class="section wrap" aria-labelledby="delivered-title">
<h2 id="delivered-title" class="section__title">What we’ve delivered.</h2>
<ul class="grid-list grid-list--four">${work.delivered.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
<p class="small">Client names are withheld by default. References are available in conversation.</p>
</section>
<section class="section section--wash" aria-labelledby="products-title"><div class="wrap">
<h2 id="products-title" class="section__title">Products we build and run.</h2>
<ul class="products">${work.products.map(p => `<li><p class="card__meta">${esc(p.status)}</p><h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ${arrowNE}</a>` : esc(p.name)}</h3><p>${esc(p.line)}</p></li>`).join('')}</ul>
</div></section>
${closeBand()}`;
}
```

- [ ] **Step 3: Write `src/pages/about.mjs`**

```js
import {esc, pageHead, closeBand, portrait, textLink} from '../components.mjs';
import {commitments} from './shared.mjs';

export function about({site}) {
  return `${pageHead({title: 'Founder-led, between London and Baku.', lede: site.definition, crumbs: [['About']]})}
<section class="section wrap founder" aria-labelledby="amir-title">
${portrait(site)}
<div class="prose"><h2 id="amir-title">Amir Gulubayli</h2>
<p>Amir advises leadership teams on where AI can create measurable value, how it should reshape workflows, and what people need to adopt it successfully. His work spans AI strategy, operating model design, implementation and capability building across travel, marketing, education, finance and clinical technology.</p>
<p>Before Enamplify, Amir built AI systems for clients under the RAG Medium name, from outbound growth engines to clinical trial management software, and launched two AI products of his own, grademy and pripitch. His team won a Google hackathon with a $10,000 winning build.</p>
${textLink('Amir on LinkedIn', site.linkedin, 'target="_blank" rel="noopener noreferrer"')}</div>
</section>
<section class="section section--wash" aria-labelledby="why-title"><div class="wrap split">
<h2 id="why-title" class="section__title">Why Enamplify exists.</h2>
<div class="prose"><p>Most organisations don’t need another AI tool. They need their own people to be able to use the ones they have, safely, on the work that matters.</p><p>Enamplify exists to make that normal: AI your team builds, not AI you buy.</p></div>
</div></section>
<section class="section wrap" aria-labelledby="markets-title">
<div class="split"><h2 id="markets-title" class="section__title">Two markets, one standard.</h2>
<div class="prose"><p>We work from London across the UK and Europe, and from Baku across Azerbaijan. The standard is the same in both: your data stays where you decide, and the capability stays with your people.</p></div></div>
</section>
<section class="section wrap" aria-labelledby="how-title">
<h2 id="how-title" class="section__title">How we work.</h2>
<div class="commitments"><div><h3>We won’t</h3><ul class="ticks ticks--no">${commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>We will</h3><ul class="ticks">${commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>
</section>
${closeBand()}`;
}
```

- [ ] **Step 4: Smoke-check all three**

Run: `node -e "import('./src/content.mjs').then(async m=>{const c=await m.loadContent();for(const n of ['approach','work','about']){const f=(await import('./src/pages/'+n+'.mjs'))[n];const h=f(c);console.log(n,(h.match(/<h1/g)||[]).length,/\u2014/.test(h))}})"`
Expected: `approach 1 false`, `work 1 false`, `about 1 false`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/approach.mjs src/pages/work.mjs src/pages/about.mjs
git commit -m "feat(pages): approach, work and about"
```

---

### Task 8: Insights, article and guide pages

**Files:**
- Create: `src/pages/insights.mjs`

- [ ] **Step 1: Write `src/pages/insights.mjs`**

```js
import {esc, arrowNE, button, textLink, pageHead, breadcrumb, closeBand, articleCard, guideCard} from '../components.mjs';

export function insights({articles, guides}) {
  return `${pageHead({title: 'Insights.', lede: 'Practical thinking on AI adoption, pilots, measurement and governance, for the people who have to make it work.', crumbs: [['Insights']]})}
<section class="section wrap" aria-labelledby="essays-title"><h2 id="essays-title" class="section__title">Essays</h2><div class="cards">${articles.map(articleCard).join('')}</div></section>
<section id="guides" class="section section--wash" aria-labelledby="guides-title"><div class="wrap"><h2 id="guides-title" class="section__title">Field guides</h2><p class="lede">Free worksheets to use with your team. No email required.</p><div class="cards">${guides.map(guideCard).join('')}</div></div></section>
${closeBand()}`;
}

export function article(a, {articles, guides}) {
  const guide = guides.find(g => g.slug === a.resource);
  const html = a.html.replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${t.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${t}</h2>`);
  return `${breadcrumb([['Insights', '/insights/'], [a.title]])}
<header class="page-head page-head--article wrap"><p class="card__meta">${esc(a.category)} · ${a.readingTime} min read</p><h1>${esc(a.title)}</h1><p class="lede">${esc(a.summary)}</p><p class="byline">By <a href="/about/">Amir Gulubayli</a> · <time datetime="${a.isoDate}">${esc(a.date)}</time></p></header>
<div class="wrap article-body"><article class="prose">${html}</article>
<aside class="article-aside">${guide ? `<div class="aside-box"><p class="card__meta">Field guide</p><h2>${esc(guide.name)}</h2><p>${esc(guide.description)}</p>${textLink('Open the guide', `/insights/guides/${guide.slug}/`)}</div>` : ''}<button class="link-arrow" type="button" data-copy-link>Copy link ${arrowNE}</button></aside></div>
<section class="section section--wash" aria-labelledby="more-title"><div class="wrap"><h2 id="more-title" class="section__title">Keep reading.</h2><div class="cards">${articles.filter(x => x.slug !== a.slug).slice(0, 3).map(articleCard).join('')}</div></div></section>
${closeBand()}`;
}

export function guide(g) {
  return `${breadcrumb([['Insights', '/insights/'], [g.name]])}
<header class="page-head wrap"><p class="card__meta">Field guide · ${esc(g.time)}</p><h1>${esc(g.short)}</h1><p class="lede">${esc(g.description)}</p><div class="actions">${button('Download the worksheet', `/downloads/${g.slug}.pdf`, 'primary', 'download')}<button class="link-arrow" type="button" data-print>Print this guide ${arrowNE}</button></div><p class="small">Free to use with your team. Bring it to: ${esc(g.audience)}</p></header>
<section class="section wrap worksheet" aria-labelledby="ws-title">
<h2 id="ws-title" class="section__title">${esc(g.name)}</h2><p class="lede">${esc(g.intro)}</p><p class="small">Notes stay on this page. They are not sent or saved.</p>
<div class="worksheet__fields">${g.fields.map((f, i) => `<label>${esc(f)}<input type="text" name="worksheet-${i}" autocomplete="off"></label>`).join('')}</div>
<ol class="worksheet__checks">${g.checks.map(([t, p], i) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p><label class="sr-only" for="note-${i}">Notes for ${esc(t)}</label><textarea id="note-${i}" rows="3"></textarea></li>`).join('')}</ol>
<div class="worksheet__close"><h3>The next decision</h3><p>${esc(g.closing)}</p><label>What happens next?<textarea rows="3"></textarea></label><div class="actions"><button class="btn btn--primary" type="button" data-print>Print with your notes</button><button class="link-arrow" type="button" data-clear-notes>Clear my notes</button></div></div>
</section>
${closeBand({title: 'Useful on paper. Better in practice.', body: 'Bring the completed guide to a conversation about your team’s work.'})}`;
}
```

- [ ] **Step 2: Smoke-check**

Run: `node -e "import('./src/content.mjs').then(async m=>{const c=await m.loadContent();const p=await import('./src/pages/insights.mjs');for(const h of [p.insights(c),p.article(c.articles[0],c),p.guide(c.guides[0])])console.log((h.match(/<h1/g)||[]).length,/\u2014/.test(h))})"`
Expected: three lines of `1 false`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/insights.mjs
git commit -m "feat(pages): insights index, articles and field guides"
```

---

### Task 9: Contact, legal and 404 pages

**Files:**
- Create: `src/pages/contact.mjs`, `src/pages/legal.mjs`

- [ ] **Step 1: Write `src/pages/contact.mjs`**

The form keeps every id and `data-` attribute that `assets/site.js` relies on (`enquiry-form`, `data-mode`, `data-email`, `name`, `email`, `organisation`, `interest`, `message`, `website`, `startedAt`, `form-errors`, `enquiry-result`).

```js
import {esc, arrow, button, breadcrumb} from '../components.mjs';

const interests = ['A diagnostic call', 'Team AI enablement', 'A custom AI build', 'Something else'];

export function contact({site, enquiryMode = 'email'}) {
  const server = enquiryMode === 'server';
  return `${breadcrumb([['Book a call']])}
<section class="contact wrap">
<div class="contact__intro"><h1>Book a diagnostic call.</h1>
<p class="lede">Thirty minutes with Amir, the founder, about your team and the work you’d like to change. No pitch deck, and no automated follow-up sequence.</p>
<h2>What we’ll cover</h2><ul class="ticks"><li>Where your team’s time goes today</li><li>Where AI is already being used, officially or not</li><li>Whether a diagnostic would be worth it, and what it would look at</li></ul>
<h2>What happens after</h2><p>If there’s a fit, you get a short written proposal for a diagnostic. If there isn’t, we’ll say so and point you somewhere useful.</p>
<div class="actions">${button('Choose a time', site.bookingUrl, 'primary', 'target="_blank" rel="noopener noreferrer"')}</div><p class="small">Opens our booking calendar in a new tab.</p></div>
<div class="contact__form"><h2>Prefer to write?</h2>
<form id="enquiry-form" data-mode="${enquiryMode}" data-email="${esc(site.email)}" novalidate>
<div class="form-row"><label for="name">Your name<input id="name" name="name" autocomplete="name" required maxlength="100"></label><label for="email">Work email<input id="email" name="email" type="email" autocomplete="email" required maxlength="254"></label></div>
<label for="organisation">Organisation<input id="organisation" name="organisation" autocomplete="organization" maxlength="160"></label>
<label for="interest">What would you like to talk about?<select id="interest" name="interest"><option value="Not sure yet">Not sure yet</option>${interests.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('')}</select></label>
<label for="message">A little about the work<textarea id="message" name="message" rows="5" minlength="20" maxlength="4000" required></textarea></label>
<div class="hp-field" aria-hidden="true"><label for="website">Leave this blank<input id="website" name="website" tabindex="-1" autocomplete="off"></label></div>
<input name="startedAt" type="hidden">
<p class="small">Please don’t include confidential information. Read our <a href="/privacy/">privacy note</a>.</p>
<div id="form-errors" class="form-errors" role="alert" hidden></div>
<button class="btn btn--secondary" type="submit">${server ? 'Send your note' : 'Prepare your note'}${arrow}</button>
<p class="small">${server ? 'Your note goes straight to Amir. You are not subscribed to anything.' : 'This prepares a message in your email app. Nothing is sent until you choose to send it.'}</p>
<div id="enquiry-result" class="enquiry-result" role="status" aria-live="polite" hidden></div>
</form><noscript><p>Please email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p></noscript></div>
</section>`;
}
```

- [ ] **Step 2: Write `src/pages/legal.mjs`**

```js
import {esc, button, textLink, pageHead} from '../components.mjs';

const pages = (site, enquiryMode) => ({
  privacy: {title: 'Privacy', description: 'How the Enamplify website handles the information you share, in plain English.', lede: 'What this website collects, why, and how to reach us.', sections: [
    ['Who we are', `Enamplify is an AI enablement practice led by Amir Gulubayli. For any question about your information, email ${site.email}.`],
    ['Your enquiry', enquiryMode === 'server' ? 'The contact form sends your details and message through Resend to our inbox, and Cloudflare Turnstile checks the form for automated abuse. We use your enquiry only to reply to you.' : 'The contact form prepares a message in your own email app. Nothing you type is sent to an Enamplify server; your email provider handles the message when you choose to send it.'],
    ['Booking a call', 'Booking opens our scheduling provider in a new tab. The details you enter there are handled under that provider’s privacy policy and used by us only to hold the call.'],
    ['Field guide notes', 'Notes typed into a field guide stay in the page. They are not sent to us or saved.'],
    ['Technical information', 'Our hosting provider processes technical information such as IP addresses to deliver and protect the site. We do not use advertising trackers or marketing analytics.'],
    ['Fonts and images', 'Fonts are served from this website. The founder portrait may be served from ragmedium.com, our previous website.'],
    ['Your rights', `You can ask what we hold about you, and ask us to correct or delete it, by emailing ${site.email}.`]]},
  cookies: {title: 'Cookies', description: 'Enamplify sets no advertising or analytics cookies. What the website stores, and what it does not.', lede: 'A short answer: we don’t set any.', sections: [
    ['No cookies from us', 'This website does not set advertising, analytics or preference cookies, and does not use browser storage to follow you.'],
    ['Other services', 'Our booking provider and LinkedIn set their own cookies when you visit them. Their policies apply there.'],
    ['If this changes', 'If we ever add analytics or embedded services, we will update this page and ask for consent where the law requires it, before they run.']]},
  terms: {title: 'Terms', description: 'The terms that apply to using the Enamplify website and its free field guides.', lede: 'The ground rules for this website.', sections: [
    ['General information', 'This website describes Enamplify and how we work. It is general information, not an offer to provide a particular service.'],
    ['Engagements', 'Every engagement is governed by its own written agreement setting out scope, fees and responsibilities. An enquiry or call does not create one.'],
    ['Not professional advice', 'Articles and field guides are educational. They are not legal, regulatory or financial advice.'],
    ['No guaranteed outcomes', 'Examples and exhibits marked illustrative explain a pattern; they are not a promise of results.'],
    ['Using the field guides', 'You may use the field guides within your organisation and share links to them. Please keep the Enamplify attribution.'],
    ['Questions', `Email ${site.email}.`]]},
  accessibility: {title: 'Accessibility', description: 'How the Enamplify website is built to be usable by as many people as possible, and how to report a problem.', lede: 'We aim to meet WCAG 2.2 AA across the site.', sections: [
    ['How the site is built', 'Pages use semantic HTML, visible focus states, sufficient colour contrast and a skip link. Every page works without JavaScript, and motion is switched off if you ask your device to reduce it.'],
    ['Charts', 'Every exhibit has a text equivalent: a readable legend, a table, or a description for screen readers.'],
    ['Known limitations', 'The booking calendar is provided by a third party and may not meet the same standard. If it gives you trouble, email us and we will arrange a time directly.'],
    ['Report a problem', `Email ${site.email} and we will reply within five working days.`]]}
});

export const legalMeta = (key, site, enquiryMode) => {
  const p = pages(site, enquiryMode)[key];
  return {title: p.title, description: p.description};
};

export function legal(key, {site, enquiryMode}) {
  const p = pages(site, enquiryMode)[key];
  return `${pageHead({title: p.title, lede: p.lede, crumbs: [[p.title]]})}<section class="section wrap"><div class="prose prose--legal">${p.sections.map(([h, t]) => `<h2>${esc(h)}</h2><p>${esc(t)}</p>`).join('')}<p class="small">Last updated ${esc(site.launchDate)}.</p></div></section>`;
}

export const notFound = () => `<section class="section wrap not-found"><h1>This page has moved, or never existed.</h1><p class="lede">We recently reorganised the site. Most of what was here now lives under Approach or Insights.</p><div class="actions">${button('Back to the home page', '/')}${textLink('Browse insights', '/insights/')}</div></section>`;
```

- [ ] **Step 3: Smoke-check**

Run: `node -e "import('./src/content.mjs').then(async m=>{const c=await m.loadContent();const {contact}=await import('./src/pages/contact.mjs');const l=await import('./src/pages/legal.mjs');for(const h of [contact({...c,enquiryMode:'email'}),l.legal('privacy',{...c,enquiryMode:'email'}),l.notFound()])console.log((h.match(/<h1/g)||[]).length,h.includes('Nothing is sent until you choose to send it.'))})"`
Expected: `1 true`, `1 false`, `1 false`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/contact.mjs src/pages/legal.mjs
git commit -m "feat(pages): contact, legal and 404"
```

---

### Task 10: Route table and redirects

**Files:**
- Create: `src/routes.mjs`, `tests/routes.test.mjs`

- [ ] **Step 1: Write the failing test**

`tests/routes.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadContent} from '../src/content.mjs';
import {routeTable, redirects} from '../src/routes.mjs';

const c = await loadContent();
const routes = routeTable({...c, enquiryMode: 'email'});
const urls = routes.map(r => r.url);

test('route set matches the spec sitemap', () => {
  const expected = ['/', '/approach/', '/work/', '/about/', '/insights/', '/contact/',
    ...c.articles.map(a => `/insights/${a.slug}/`), ...c.guides.map(g => `/insights/guides/${g.slug}/`),
    '/privacy/', '/cookies/', '/terms/', '/accessibility/', '/404/'];
  assert.deepEqual([...urls].sort(), [...expected].sort());
});
test('every route has a title, a description and rendered HTML', () => {
  for (const r of routes) {
    assert.ok(r.title && r.description && r.html, r.url);
    assert.ok(r.description.length <= 160, `${r.url} description ${r.description.length}`);
    assert.ok((r.home ? r.title : `${r.title} | Enamplify`).length <= 70, `${r.url} title`);
  }
});
test('inner pages carry breadcrumbs; approach carries FAQs', () => {
  for (const r of routes.filter(r => !r.home && !r.notFound)) assert.ok(r.crumbs, r.url);
  assert.equal(routes.find(r => r.url === '/approach/').faqs.length, c.faqs.length);
});
test('only the 404 page is excluded from indexing', () => {
  assert.deepEqual(routes.filter(r => r.index === false).map(r => r.url), ['/404/']);
});
test('every retired section redirects, and vercel.json matches', async () => {
  for (const old of ['/solutions/', '/for/', '/start/', '/perspectives/', '/resources/', '/credits/', '/thank-you/', '/work/'])
    assert.ok(redirects.some(r => r.source.startsWith(old)), old);
  const vercel = JSON.parse(await fs.readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.deepEqual(vercel.redirects, redirects.map(r => ({...r, permanent: true})));
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test tests/routes.test.mjs`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `src/routes.mjs`**

```js
import {home} from './pages/home.mjs';
import {approach} from './pages/approach.mjs';
import {work} from './pages/work.mjs';
import {about} from './pages/about.mjs';
import {insights, article, guide} from './pages/insights.mjs';
import {contact} from './pages/contact.mjs';
import {legal, legalMeta, notFound} from './pages/legal.mjs';

export const redirects = [
  {source: '/solutions/', destination: '/approach/'},
  {source: '/solutions/:slug/', destination: '/approach/'},
  {source: '/for/:slug/', destination: '/'},
  {source: '/start/:slug/', destination: '/contact/'},
  {source: '/work/:slug/', destination: '/work/'},
  {source: '/perspectives/', destination: '/insights/'},
  {source: '/perspectives/:slug/', destination: '/insights/:slug/'},
  {source: '/resources/', destination: '/insights/'},
  {source: '/resources/:slug/', destination: '/insights/guides/:slug/'},
  {source: '/credits/', destination: '/'},
  {source: '/thank-you/', destination: '/'}
];

export function routeTable(ctx) {
  const {site, articles, guides, faqs, enquiryMode} = ctx;
  const routes = [
    {url: '/', home: true, title: 'Enamplify · AI enablement for mid-sized teams', description: site.description, html: home(ctx), bodyClass: 'is-home'},
    {url: '/approach/', title: 'How AI enablement works: diagnose, prove, scale', description: 'Start small, prove it, then scale. How Enamplify helps teams build their own AI workflows with review, governance and data kept where it belongs.', crumbs: [['Approach']], faqs, html: approach(ctx)},
    {url: '/work/', title: 'AI systems we’ve built and products we run', description: 'Delivered AI systems across clinical, finance, growth and operations, a Google hackathon win, and the AI products we build and run ourselves.', crumbs: [['Work']], html: work(ctx)},
    {url: '/about/', title: 'About Enamplify: founder-led, London and Baku', description: 'Enamplify is a founder-led AI enablement consultancy in London and Baku. Meet Amir Gulubayli and the principles behind the work.', crumbs: [['About']], html: about(ctx)},
    {url: '/insights/', title: 'Insights on AI adoption for operations leaders', description: 'Practical essays and free field guides on AI adoption, pilots, measurement and governance for operations leaders.', crumbs: [['Insights']], html: insights(ctx)},
    ...articles.map(a => ({url: `/insights/${a.slug}/`, title: a.title, description: a.summary, crumbs: [['Insights', '/insights/'], [a.title]], article: a, html: article(a, ctx), bodyClass: 'is-article'})),
    ...guides.map(g => ({url: `/insights/guides/${g.slug}/`, title: g.name, description: g.description, crumbs: [['Insights', '/insights/'], [g.name]], html: guide(g), bodyClass: 'is-guide'})),
    {url: '/contact/', title: 'Book a diagnostic call', description: 'Book a 30-minute diagnostic call with Amir Gulubayli, founder of Enamplify. No pitch deck: a conversation about your team and its work.', crumbs: [['Book a call']], contact: true, html: contact(ctx)},
    ...['privacy', 'cookies', 'terms', 'accessibility'].map(key => ({url: `/${key}/`, ...legalMeta(key, site, enquiryMode), crumbs: [[legalMeta(key, site, enquiryMode).title]], html: legal(key, ctx)})),
    {url: '/404/', title: 'Page not found', description: 'This page has moved. Find your way back to Enamplify.', index: false, notFound: true, html: notFound()}
  ];
  return routes;
}
```

- [ ] **Step 4: Add the redirects to `vercel.json`**

Add a top-level `"redirects"` key (after `"trailingSlash": true`) containing each entry above with `"permanent": true`, in the same order:

```json
"redirects": [
  {"source": "/solutions/", "destination": "/approach/", "permanent": true},
  {"source": "/solutions/:slug/", "destination": "/approach/", "permanent": true},
  {"source": "/for/:slug/", "destination": "/", "permanent": true},
  {"source": "/start/:slug/", "destination": "/contact/", "permanent": true},
  {"source": "/work/:slug/", "destination": "/work/", "permanent": true},
  {"source": "/perspectives/", "destination": "/insights/", "permanent": true},
  {"source": "/perspectives/:slug/", "destination": "/insights/:slug/", "permanent": true},
  {"source": "/resources/", "destination": "/insights/", "permanent": true},
  {"source": "/resources/:slug/", "destination": "/insights/guides/:slug/", "permanent": true},
  {"source": "/credits/", "destination": "/", "permanent": true},
  {"source": "/thank-you/", "destination": "/", "permanent": true}
],
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test tests/routes.test.mjs`
Expected: PASS (5 tests). If a title or description length assertion fails, shorten that string in `src/routes.mjs` (or the article's `title` in `content/articles.json`) and rerun.

- [ ] **Step 6: Commit**

```bash
git add src/routes.mjs tests/routes.test.mjs vercel.json
git commit -m "feat(routes): seven page types and 301s from retired URLs"
```

---

### Task 11: Build orchestrator, llms.txt and feed

**Files:**
- Rewrite: `scripts/build.mjs`
- Modify: `scripts/sync-assets.mjs` (remove the `library.jpg` entry)
- Delete: `src/pages.mjs`

- [ ] **Step 1: Rewrite `scripts/build.mjs`**

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {loadContent, root} from '../src/content.mjs';
import {routeTable} from '../src/routes.mjs';
import {renderDocument, titleFor} from '../src/seo.mjs';
import {esc} from '../src/components.mjs';

export {root};
const out = path.join(root, 'dist');
const xml = t => esc(t).replace(/&#39;/g, '&apos;');

export async function build() {
  try { process.loadEnvFile(path.join(root, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.mkdir(path.join(root, 'qa'), {recursive: true});
  if (process.env.VERCEL && process.env.ASSET_SYNC !== '0') { const {syncAssets} = await import('./sync-assets.mjs'); await syncAssets(); }

  const content = await loadContent();
  const {site, articles} = content;
  const supplied = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const base = new URL(supplied).origin;
  const isLive = (process.env.VERCEL_ENV === 'production' || process.env.INDEX_SITE === 'true') && !base.includes('localhost');
  const env = process.env;
  const enquiryMode = env.ENQUIRY_MODE === 'server' && env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO && env.CONTACT_ALLOWED_ORIGIN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY ? 'server' : 'email';
  const localPortrait = await fs.stat(path.join(root, 'public/images/amir-gulubayli.jpg')).then(s => s.size > 1000).catch(() => false);
  if (localPortrait) site.portrait = '/images/amir-gulubayli.jpg';

  const routes = routeTable({...content, enquiryMode});

  await fs.rm(out, {recursive: true, force: true});
  await fs.mkdir(path.join(out, 'assets'), {recursive: true});
  await fs.cp(path.join(root, 'public'), out, {recursive: true});
  const css = await fs.readFile(path.join(root, 'assets/styles.css'), 'utf8');
  const js = await fs.readFile(path.join(root, 'assets/site.js'), 'utf8');
  const hash = v => createHash('sha256').update(v).digest('hex').slice(0, 10);
  const cssName = `styles.${hash(css)}.css`, jsName = `site.${hash(js)}.js`;
  await fs.writeFile(path.join(out, 'assets', cssName), css);
  await fs.writeFile(path.join(out, 'assets', jsName), js);

  for (const r of routes) {
    const html = renderDocument({base, site, route: r, cssName, jsName, indexable: isLive && r.index !== false, turnstileKey: enquiryMode === 'server' ? env.TURNSTILE_SITE_KEY : ''});
    const dest = path.join(out, r.url, 'index.html');
    await fs.mkdir(path.dirname(dest), {recursive: true});
    await fs.writeFile(dest, html);
    if (r.notFound) await fs.writeFile(path.join(out, '404.html'), html);
  }

  const indexable = routes.filter(r => r.index !== false);
  const lastmod = r => r.article?.isoDate || site.launchDate;
  await fs.writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map(r => `<url><loc>${xml(base + r.url)}</loc><lastmod>${lastmod(r)}</lastmod></url>`).join('')}</urlset>`);
  await fs.writeFile(path.join(out, 'robots.txt'), isLive ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  await fs.writeFile(path.join(out, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Enamplify Insights</title><link>${xml(base)}/insights/</link><description>Practical thinking on AI adoption for operations leaders.</description><language>en-gb</language><atom:link href="${xml(base)}/feed.xml" rel="self" type="application/rss+xml"/>${articles.map(a => `<item><title>${xml(a.title)}</title><link>${xml(base)}/insights/${a.slug}/</link><guid>${xml(base)}/insights/${a.slug}/</guid><description>${xml(a.summary)}</description><pubDate>${new Date(a.isoDate).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
  const section = (heading, list) => `## ${heading}\n\n${list.map(r => `- [${titleFor(r, site)}](${base}${r.url}): ${r.description}`).join('\n')}\n`;
  await fs.writeFile(path.join(out, 'llms.txt'), `# ${site.name}\n\n> ${site.definition}\n\n${section('Pages', indexable.filter(r => !r.article && !r.url.startsWith('/insights/guides/') && !['/privacy/', '/cookies/', '/terms/', '/accessibility/'].includes(r.url)))}\n${section('Insights', indexable.filter(r => r.article))}\n${section('Field guides', indexable.filter(r => r.url.startsWith('/insights/guides/')))}\n## Contact\n\n- Book a call: ${site.bookingUrl}\n- Email: ${site.email}\n`);

  await fs.writeFile(path.join(root, 'qa/routes.json'), JSON.stringify(routes.map(({url, title, description, index}) => ({url, title, description, index: index !== false})), null, 2));
  await fs.writeFile(path.join(root, 'qa/build.json'), JSON.stringify({builtAt: new Date().toISOString(), pages: routes.length, base, indexing: isLive, enquiryMode, cssBytes: Buffer.byteLength(css), jsBytes: Buffer.byteLength(js), fontsSelfHosted: true}, null, 2));
  console.log(`Built ${routes.length} pages. Enquiries: ${enquiryMode}. Indexing: ${isLive}. Base: ${base}`);
  return {routes, base, enquiryMode};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build().catch(e => { console.error(e); process.exitCode = 1; });
```

- [ ] **Step 2: Drop the library photo from `scripts/sync-assets.mjs`**

Delete this line from the `assets` array:

```js
 {name:'library.jpg',urls:['https://images.unsplash.com/photo-1507842217343-583bb7270b66?fit=crop&w=1600&q=85&fm=jpg'],source:'Unsplash editorial photograph. Not an Enamplify location.'}
```

and remove the trailing comma from the preceding `amir-gulubayli.jpg` entry.

- [ ] **Step 3: Delete the old page module**

```bash
git rm src/pages.mjs
grep -rn "pages.mjs'" scripts src tests
```

Expected: no output (only `src/pages/*.mjs` imports remain).

- [ ] **Step 4: Run the build**

Run: `node scripts/build.mjs`
Expected: `Built 20 pages. Enquiries: email. Indexing: false. Base: http://localhost:3000`

- [ ] **Step 5: Commit**

```bash
git add scripts/build.mjs scripts/sync-assets.mjs
git commit -m "feat(build): route-driven build with llms.txt, sitemap lastmod and new feed"
```

---

### Task 12: vercel.json security and caching headers

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Replace the Content-Security-Policy value**

```
default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self'; font-src 'self'; img-src 'self' https://ragmedium.com https://www.ragmedium.com data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:; upgrade-insecure-requests
```

(Google Fonts and Unsplash origins are removed; fonts are self-hosted.)

- [ ] **Step 2: Add font caching** as a new entry in `"headers"`:

```json
{"source": "/fonts/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]}
```

- [ ] **Step 3: Validate JSON and rerun the routes test**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'));console.log('ok')" && node --test tests/routes.test.mjs`
Expected: `ok` then PASS.

- [ ] **Step 4: Commit**

```bash
git add vercel.json
git commit -m "chore(vercel): tighten CSP for self-hosted fonts, cache fonts"
```

---

### Task 13: Board Pack stylesheet

**Files:**
- Rewrite: `assets/styles.css`

- [ ] **Step 1: Replace `assets/styles.css` entirely**

```css
@font-face{font-family:"Schibsted Grotesk";src:url("/fonts/schibsted-grotesk-latin.woff2") format("woff2");font-weight:400 900;font-style:normal;font-display:optional}
@font-face{font-family:"Public Sans";src:url("/fonts/public-sans-latin.woff2") format("woff2");font-weight:100 900;font-style:normal;font-display:optional}

:root{
  --paper:#fff;--wash:#f4f6f8;--navy:#0a1f33;--ink:#1a2633;--muted:#556474;--rule:#d8dee5;--rule-strong:#a8b4c0;
  --signal:#1f5eff;--signal-deep:#1746c8;--signal-wash:#e9efff;
  --display:"Schibsted Grotesk",Arial,Helvetica,sans-serif;--text:"Public Sans",Arial,Helvetica,sans-serif;
  --gutter:20px;--section:clamp(64px,9vw,128px);--ease:cubic-bezier(.2,.7,.2,1)
}
@media (min-width:720px){:root{--gutter:32px}}

*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-padding-top:96px}
body{margin:0;background:var(--paper);color:var(--ink);font:400 1.0625rem/1.6 var(--text);font-variant-numeric:lining-nums tabular-nums;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}
img,svg{display:block;max-width:100%}
a{color:inherit;text-underline-offset:.2em;text-decoration-thickness:1px}
p,ul,ol,dl,dd,figure,blockquote{margin:0}
ul,ol{padding:0;list-style:none}
h1,h2,h3{margin:0;font-family:var(--display);color:var(--navy);text-wrap:balance}
h1{font-size:clamp(2.5rem,1.4rem + 4.4vw,4.75rem);font-weight:650;line-height:1.02;letter-spacing:-.028em}
h2{font-size:clamp(1.75rem,1.2rem + 1.9vw,2.75rem);font-weight:600;line-height:1.1;letter-spacing:-.018em}
h3{font-size:1.1875rem;font-weight:600;line-height:1.3}
.lede{font-size:clamp(1.125rem,1rem + .45vw,1.3125rem);line-height:1.55;max-width:42ch;text-wrap:pretty}
.small{font-size:.875rem;color:var(--muted)}
.wrap{width:100%;max-width:1264px;margin-inline:auto;padding-inline:var(--gutter)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.skip-link{position:absolute;left:12px;top:-64px;z-index:100;background:var(--navy);color:#fff;padding:10px 14px;text-decoration:none}
.skip-link:focus{top:12px}
:focus-visible{outline:2px solid var(--signal);outline-offset:3px}
main:focus{outline:none}

/* Header */
.site-header{position:sticky;top:0;z-index:50;background:var(--paper);border-bottom:1px solid var(--rule)}
.site-header__inner{display:flex;align-items:center;gap:32px;min-height:72px}
.wordmark{font-family:var(--display);font-weight:700;font-size:1.375rem;letter-spacing:-.02em;color:var(--navy);text-decoration:none}
.site-nav{display:flex;gap:28px;margin-left:auto}
.site-nav a{font-size:.9375rem;color:var(--ink);text-decoration:none;padding:6px 0;border-bottom:1px solid transparent}
.site-nav a:hover,.site-nav a[aria-current]{border-bottom-color:var(--navy);color:var(--navy)}
.menu-toggle{display:none;margin-left:auto;background:none;border:1px solid var(--rule-strong);padding:8px 14px;font:500 .875rem var(--text);color:var(--navy);cursor:pointer}
.mobile-menu{border-top:1px solid var(--rule);padding-block:8px 24px}
.mobile-menu a{display:block;padding:14px 0;border-bottom:1px solid var(--rule);font:600 1.25rem var(--display);color:var(--navy);text-decoration:none}
.noscript-nav{display:flex;flex-wrap:wrap;gap:16px;padding-block:12px}
@media (max-width:1000px){.site-nav,.site-header__cta{display:none}.menu-toggle{display:block}}
@media (min-width:1001px){.mobile-menu{display:none}}

/* Buttons and links */
.btn{display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:12px 20px;font:600 .9375rem/1 var(--text);text-decoration:none;border:1px solid transparent;transition:background-color .2s,color .2s,border-color .2s}
.btn .icon{transition:transform .2s var(--ease)}
.btn:hover .icon,.link-arrow:hover .icon{transform:translateX(3px)}
.btn--primary{background:var(--signal);color:#fff}
.btn--primary:hover{background:var(--signal-deep)}
.btn--secondary{background:var(--navy);color:#fff}
.btn--secondary:hover{background:var(--ink)}
.btn--quiet{min-height:40px;padding:8px 16px;border-color:var(--navy);color:var(--navy)}
.btn--quiet:hover{background:var(--navy);color:#fff}
.btn--inverse{background:#fff;color:var(--navy)}
.btn--inverse:hover{background:var(--signal-wash)}
.link-arrow{display:inline-flex;align-items:center;gap:8px;padding:6px 0;background:none;border:0;border-bottom:1px solid currentColor;font:600 .9375rem var(--text);color:var(--signal-deep);text-decoration:none;cursor:pointer}
.actions{display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;margin-top:32px}

/* Sections */
.section{padding-block:var(--section)}
.section--wash{background:var(--wash)}
.section__title{max-width:24ch;margin-bottom:48px}
.section__row{display:flex;justify-content:space-between;align-items:end;gap:24px;margin-bottom:48px}
.section__row .section__title{margin:0}
.split{display:grid;gap:32px 64px}
@media (min-width:900px){.split{grid-template-columns:5fr 7fr}.split .section__title{margin:0}}
.page-head{padding-block:32px var(--section);border-bottom:1px solid var(--rule)}
.page-head h1{max-width:18ch}
.page-head .lede{margin-top:24px}
.page-head--article h1{max-width:24ch;font-size:clamp(2.125rem,1.4rem + 3vw,3.5rem)}
.crumbs ol{display:flex;flex-wrap:wrap;gap:8px;padding-top:24px;font-size:.8125rem;color:var(--muted)}
.crumbs li+li::before{content:"/";margin-right:8px;color:var(--rule-strong)}
.crumbs a{text-decoration:none}
.crumbs a:hover{text-decoration:underline}

/* Hero */
.hero{display:grid;gap:48px;padding-block:56px var(--section);align-items:end}
.hero .h1-alt{display:block;color:var(--muted)}
.hero .lede{margin-top:28px}
.note{margin-top:20px;font-size:.875rem;color:var(--muted)}
@media (min-width:1000px){.hero{grid-template-columns:7fr 5fr;gap:72px;padding-top:88px}}

/* Exhibits */
.exhibit{border-top:2px solid var(--navy);padding-top:16px}
.exhibit__cap{display:flex;flex-direction:column;gap:4px;margin-bottom:24px}
.exhibit__label{font-size:.8125rem;font-weight:600;color:var(--signal-deep);letter-spacing:.01em}
.exhibit__title{font:600 1.1875rem/1.3 var(--display);color:var(--navy)}
.exhibit__note{margin-top:20px;font-size:.9375rem}
.exhibit__source{margin-top:16px;padding-top:12px;border-top:1px solid var(--rule);font-size:.8125rem;color:var(--muted)}
.stack{width:100%;height:56px}
.mark--navy{fill:var(--navy)}
.mark--signal{fill:var(--signal)}
.mark--rule{fill:var(--rule-strong)}
.legend{display:grid;gap:8px;margin-top:20px}
.legend li{display:grid;grid-template-columns:12px 1fr auto;gap:12px;align-items:center;font-size:.9375rem}
.swatch{width:12px;height:12px}
.swatch--navy{background:var(--navy)}
.swatch--signal{background:var(--signal)}
.swatch--rule{background:var(--rule-strong)}
.legend__value{font-weight:600;color:var(--navy)}
.bars{display:grid;gap:14px}
.bars__row{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;font-size:.9375rem}
.bars__track{width:100%;height:12px}
.bars__bg{fill:var(--paper)}
.section--wash .bars__bg{fill:#e6eaee}
.bars__value{font-weight:600;color:var(--navy)}
.linechart{width:100%;height:auto}
.gridline{stroke:var(--rule);stroke-width:1;vector-effect:non-scaling-stroke}
.mark-line{fill:none;stroke-width:2.5;vector-effect:non-scaling-stroke;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:0}
.mark-line--signal{stroke:var(--signal)}
.mark-line--navy{stroke:var(--navy)}
.axis{display:flex;justify-content:space-between;margin-top:8px;font-size:.8125rem;color:var(--muted)}
.ledger-scroll{overflow-x:auto}
.ledger{width:100%;border-collapse:collapse;font-size:.875rem}
.ledger th,.ledger td{padding:10px 12px 10px 0;text-align:left;border-bottom:1px solid var(--rule);vertical-align:top}
.ledger thead th{font-weight:600;color:var(--muted);border-bottom-color:var(--rule-strong)}
.ledger tbody th{font-weight:600;color:var(--navy)}
.stack .mark,.bars .mark{transform-box:fill-box;transform-origin:left center;transition:transform 1s var(--ease)}
.mark-line{transition:stroke-dashoffset 1.4s var(--ease)}
.exhibit.is-pending .mark{transform:scaleX(0)}
.exhibit.is-pending .mark-line{stroke-dashoffset:1}

/* Home blocks */
.numbered{display:grid;gap:40px;border-top:1px solid var(--rule);padding-top:40px}
.numbered__n{display:block;margin-bottom:12px;font:600 .875rem var(--display);color:var(--signal-deep)}
.numbered h3{margin-bottom:10px}
@media (min-width:900px){.numbered{grid-template-columns:repeat(3,1fr);gap:48px}}
.marked{margin-top:56px;max-width:36ch;padding-left:20px;border-left:3px solid var(--signal);font:600 clamp(1.25rem,1rem + .8vw,1.625rem)/1.35 var(--display);color:var(--navy)}
.outcomes{display:grid;gap:56px}
@media (min-width:1000px){.outcomes{grid-template-columns:repeat(3,1fr);gap:40px}}
.stages li{display:grid;grid-template-columns:48px 1fr;gap:16px;padding-block:24px;border-top:1px solid var(--rule)}
.stages li:last-child{border-bottom:1px solid var(--rule);margin-bottom:28px}
.stages__n{font:600 .875rem var(--display);color:var(--signal-deep)}
.stages__time{font:500 .875rem var(--text);color:var(--muted);margin-left:8px}
.stages h3{margin-bottom:6px}
.commitments{display:grid;gap:40px;border-top:1px solid var(--rule);padding-top:40px}
.commitments h3{margin-bottom:16px}
@media (min-width:900px){.commitments{grid-template-columns:1fr 1fr;gap:64px}}
.ticks li{position:relative;padding:12px 0 12px 32px;border-bottom:1px solid var(--rule)}
.ticks li::before{content:"";position:absolute;left:2px;top:19px;width:14px;height:8px;border-left:2px solid var(--signal);border-bottom:2px solid var(--signal);transform:rotate(-45deg)}
.ticks--no li::before{top:22px;width:14px;height:0;border-left:0;border-bottom:2px solid var(--muted);transform:none}
.ticks--large li{font:600 1.1875rem/1.35 var(--display);color:var(--navy)}
.figures{display:grid;gap:32px;margin-bottom:56px}
.figure{display:flex;flex-direction:column-reverse;gap:8px;border-top:2px solid var(--navy);padding-top:16px}
.figure dd{font:650 clamp(2.25rem,1.6rem + 2.4vw,3.5rem)/1 var(--display);letter-spacing:-.02em;color:var(--navy)}
.figure dt{color:var(--muted);max-width:28ch}
@media (min-width:900px){.figures{grid-template-columns:repeat(3,1fr);gap:40px}}
.delivered{display:grid;gap:0 40px;margin-bottom:36px}
.delivered li{padding:12px 0;border-bottom:1px solid var(--rule-strong);font-weight:500;color:var(--navy)}
@media (min-width:700px){.delivered{grid-template-columns:1fr 1fr}}
@media (min-width:1000px){.delivered{grid-template-columns:repeat(4,1fr)}}
.founder{display:grid;gap:40px;align-items:center}
@media (min-width:900px){.founder{grid-template-columns:4fr 8fr;gap:72px}}
.portrait{position:relative;background:var(--wash);aspect-ratio:4/5;max-width:420px}
.portrait img{width:100%;height:100%;object-fit:cover}
.portrait figcaption{margin-top:12px;font-size:.8125rem;color:var(--muted)}
.portrait.image-unavailable img{visibility:hidden}
.quote p{font:600 clamp(1.375rem,1.1rem + 1vw,1.875rem)/1.3 var(--display);color:var(--navy);max-width:32ch}
.quote footer{margin:20px 0 32px;color:var(--muted)}

/* Cards and lists */
.cards{display:grid;gap:24px}
@media (min-width:760px){.cards{grid-template-columns:repeat(2,1fr)}}
@media (min-width:1100px){.cards{grid-template-columns:repeat(3,1fr)}}
.card{position:relative;padding:24px 0;border-top:2px solid var(--navy)}
.card__meta{font-size:.8125rem;color:var(--muted);margin-bottom:10px}
.card__title{margin-bottom:10px}
.card__title a{text-decoration:none}
.card__title a::after{content:"";position:absolute;inset:0}
.card:hover .card__title a{color:var(--signal-deep)}
.grid-list{display:grid;gap:32px}
.grid-list li{border-top:1px solid var(--rule-strong);padding-top:16px}
.grid-list h3{margin-bottom:8px}
@media (min-width:760px){.grid-list{grid-template-columns:repeat(2,1fr)}}
@media (min-width:1100px){.grid-list{grid-template-columns:repeat(3,1fr)}.grid-list--four{grid-template-columns:repeat(4,1fr)}}
.grid-list+.small{margin-top:32px}
.products{display:grid;gap:24px}
.products li{border-top:2px solid var(--navy);padding-top:16px}
.products h3{margin-bottom:8px}
.products h3 a{display:inline-flex;gap:6px;align-items:center;text-decoration:none}
@media (min-width:900px){.products{grid-template-columns:repeat(3,1fr)}}
.recognition{display:grid;gap:12px;border-top:2px solid var(--navy);padding-top:24px;max-width:760px}
.recognition p{font-size:1.1875rem}

/* Approach */
.stage-detail>li{display:grid;gap:24px;padding-block:40px;border-top:1px solid var(--rule)}
.stage-detail>li:last-child{border-bottom:1px solid var(--rule)}
.stage-detail h3{margin:24px 0 8px;font-size:1rem}
.stage-detail .small{margin-top:16px}
@media (min-width:900px){.stage-detail>li{grid-template-columns:5fr 7fr;gap:64px}}
.faq details{border-top:1px solid var(--rule)}
.faq details:last-child{border-bottom:1px solid var(--rule)}
.faq summary{display:flex;justify-content:space-between;gap:16px;padding:20px 0;cursor:pointer;list-style:none;font:600 1.125rem/1.35 var(--display);color:var(--navy)}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-weight:400;color:var(--signal-deep)}
.faq details[open] summary::after{content:"\2212"}
.faq details p{padding-bottom:20px;max-width:62ch}

/* Prose and articles */
.prose{max-width:66ch}
.prose h2{font-size:1.625rem;margin:48px 0 16px}
.prose h2:first-child{margin-top:0}
.prose p+p,.prose ul,.prose ol,.prose blockquote{margin-top:1em}
.prose ul{list-style:disc;padding-left:1.25em}
.prose ol{list-style:decimal;padding-left:1.25em}
.prose li+li{margin-top:.4em}
.prose blockquote{padding-left:20px;border-left:3px solid var(--signal);font:600 1.25rem/1.4 var(--display);color:var(--navy)}
.prose a{color:var(--signal-deep)}
.prose--legal h2{font-size:1.25rem;margin-top:36px}
.byline{margin-top:24px;font-size:.9375rem;color:var(--muted)}
.article-body{display:grid;gap:48px;padding-block:64px}
@media (min-width:1000px){.article-body{grid-template-columns:8fr 4fr;gap:80px}}
.article-aside{display:grid;gap:24px;align-content:start}
.aside-box{border-top:2px solid var(--navy);padding-top:16px}
.aside-box h2{font-size:1.1875rem;margin-bottom:8px}
.aside-box p{margin-bottom:12px}

/* Guides */
.worksheet .lede{margin-bottom:12px}
.worksheet__fields{display:grid;gap:20px;margin-block:40px}
@media (min-width:760px){.worksheet__fields{grid-template-columns:1fr 1fr}}
.worksheet__checks{display:grid;gap:0;counter-reset:check}
.worksheet__checks li{padding-block:24px;border-top:1px solid var(--rule)}
.worksheet__checks h3{margin-bottom:6px}
.worksheet__checks textarea{margin-top:12px}
.worksheet__close{margin-top:40px;padding:32px;background:var(--wash)}
.worksheet__close h3{margin-bottom:8px}
.print-value{white-space:pre-wrap;border-bottom:1px solid var(--rule);padding:6px 0}

/* Forms */
label{display:grid;gap:8px;font-size:.9375rem;font-weight:500;color:var(--navy)}
input,select,textarea{width:100%;padding:12px 14px;font:400 1rem/1.4 var(--text);color:var(--ink);background:#fff;border:1px solid var(--rule-strong);border-radius:0}
input:focus,select:focus,textarea:focus{outline:2px solid var(--signal);outline-offset:0;border-color:var(--signal)}
[aria-invalid="true"]{border-color:#b42318}
.contact{display:grid;gap:56px;padding-block:32px var(--section)}
.contact h1{max-width:14ch;margin-bottom:24px}
.contact__intro h2{font-size:1.25rem;margin:40px 0 12px}
.contact__form{background:var(--wash);padding:32px}
.contact__form h2{font-size:1.5rem;margin-bottom:24px}
#enquiry-form{display:grid;gap:20px}
.form-row{display:grid;gap:20px}
@media (min-width:600px){.form-row{grid-template-columns:1fr 1fr}}
@media (min-width:1000px){.contact{grid-template-columns:6fr 5fr;gap:80px;align-items:start}}
.hp-field{position:absolute;left:-9999px}
.form-errors{padding:16px;border-left:3px solid #b42318;background:#fff}
.form-errors ul{margin-top:8px;list-style:disc;padding-left:1.2em}
.enquiry-result{display:grid;gap:12px;padding:20px;background:#fff;border-top:2px solid var(--signal)}
.message-preview{white-space:pre-wrap;font:400 .875rem/1.5 var(--text);background:var(--wash);padding:12px;margin:0}
.copy-fallback{width:100%;min-height:120px;margin-top:12px}

/* Close band and footer */
.close{background:var(--navy);color:#fff;padding-block:var(--section)}
.close h2{color:#fff;max-width:18ch}
.close__inner{display:grid;gap:32px}
.close__body p{max-width:42ch;margin-bottom:28px;color:#d6dde6;font-size:1.125rem}
@media (min-width:900px){.close__inner{grid-template-columns:7fr 5fr;align-items:end;gap:64px}}
.site-footer{padding-block:64px 32px;border-top:1px solid var(--rule);font-size:.9375rem}
.site-footer__top{display:grid;gap:40px}
.site-footer__brand p{max-width:44ch;margin-top:12px;color:var(--muted)}
.site-footer__cities{font-weight:600;color:var(--navy)!important}
.site-footer h2{font:600 .875rem var(--text);color:var(--muted);margin-bottom:12px}
.site-footer nav a,.site-footer__top>div:last-child a{display:flex;align-items:center;gap:6px;padding:4px 0;text-decoration:none}
.site-footer a:hover{color:var(--signal-deep)}
.site-footer__bottom{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;margin-top:56px;padding-top:24px;border-top:1px solid var(--rule);color:var(--muted);font-size:.8125rem}
.site-footer__bottom nav{display:flex;flex-wrap:wrap;gap:20px}
@media (min-width:900px){.site-footer__top{grid-template-columns:6fr 3fr 3fr}}
.not-found h1{max-width:18ch}
.not-found .lede{margin-top:24px}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}
  .exhibit.is-pending .mark{transform:none}
  .exhibit.is-pending .mark-line{stroke-dashoffset:0}
}
@media print{
  .site-header,.site-footer,.close,.crumbs,.actions,.article-aside,.skip-link{display:none!important}
  body{font-size:11pt}
  .section{padding-block:16px}
  input,textarea{display:none}
}
```

- [ ] **Step 2: Check the size budget**

Run: `node -e "console.log(require('fs').statSync('assets/styles.css').size)"`
Expected: a number below 36000.

- [ ] **Step 3: Commit**

```bash
git add assets/styles.css
git commit -m "feat(styles): board-pack visual system"
```

---

### Task 14: Client script

**Files:**
- Modify: `assets/site.js`

- [ ] **Step 1: Remove the web-font swap.** Delete lines 4–8 (the `const webfonts = …` block through its closing `}`).

- [ ] **Step 2: Remove the journal filter.** Delete from `// Journal filtering:` through the line ending `search.focus(); });` (the `[data-reset-filters]` listener).

- [ ] **Step 3: Add the exhibit reveal** immediately before `document.documentElement.dataset.enamplifyReady = 'true';`:

```js
  // Exhibits below the first viewport draw their marks once on arrival; anything already in view never waits.
  const later = $$('.exhibit').filter(ex => ex.getBoundingClientRect().top > innerHeight);
  if (later.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-pending');
      io.unobserve(entry.target);
    }), {rootMargin: '0px 0px -12% 0px'});
    later.forEach(ex => { ex.classList.add('is-pending'); io.observe(ex); });
  }
```

- [ ] **Step 4: Check syntax and size**

Run: `node --check assets/site.js && node -e "console.log(require('fs').statSync('assets/site.js').size)"`
Expected: no syntax error, then a number below 12000.

- [ ] **Step 5: Commit**

```bash
git add assets/site.js
git commit -m "feat(js): exhibit reveal; drop web-font swap and journal filter"
```

---

### Task 15: Built-site tests

**Files:**
- Rewrite: `tests/site.test.mjs`

- [ ] **Step 1: Replace `tests/site.test.mjs`**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildInfo = JSON.parse(await fs.readFile(path.join(root, 'qa/build.json'), 'utf8'));
const routes = JSON.parse(await fs.readFile(path.join(root, 'qa/routes.json'), 'utf8'));
const read = url => fs.readFile(path.join(root, 'dist', url, 'index.html'), 'utf8');
const all = await Promise.all(routes.map(r => read(r.url)));
const css = await fs.readFile(path.join(root, 'assets/styles.css'), 'utf8');
const js = await fs.readFile(path.join(root, 'assets/site.js'), 'utf8');
const ld = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const types = html => ld(html).flatMap(d => d['@graph'].map(n => n['@type']));

test('20 pages are built', () => assert.equal(routes.length, 20));
test('one H1 and one main per page, British English', () => { for (const [i, h] of all.entries()) { assert.equal([...h.matchAll(/<h1(?:\s|>)/g)].length, 1, routes[i].url); assert.equal([...h.matchAll(/<main(?:\s|>)/g)].length, 1); assert.ok(h.includes('lang="en-GB"')); } });
test('titles and descriptions are unique', () => { for (const p of [/<title>(.*?)<\/title>/s, /<meta name="description" content="([^"]*)"/]) { const v = all.map(h => h.match(p)?.[1]); assert.ok(v.every(Boolean)); assert.equal(new Set(v).size, v.length); } });
test('every internal link resolves', async () => { for (const h of all) for (const m of h.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) { const link = m[1].split('?')[0]; const file = path.join(root, 'dist', link, link.endsWith('/') ? 'index.html' : ''); assert.ok(await fs.access(file).then(() => true, () => false), `Missing ${link}`); } });
test('structured data: practice everywhere, FAQ on approach, articles marked up', async () => {
  for (const h of all) { assert.ok(types(h).includes('ProfessionalService')); assert.ok(!JSON.stringify(ld(h)).includes('aggregateRating')); }
  assert.ok(types(await read('/approach/')).includes('FAQPage'));
  for (const r of routes.filter(r => /^\/insights\/(?!guides\/)[^/]+\/$/.test(r.url))) assert.ok(types(await read(r.url)).includes('Article'), r.url);
  for (const r of routes.filter(r => r.url !== '/' && r.url !== '/404/')) assert.ok(types(await read(r.url)).includes('BreadcrumbList'), r.url);
});
test('llms.txt, sitemap and feed list the new URLs', async () => {
  const llms = await fs.readFile(path.join(root, 'dist/llms.txt'), 'utf8');
  const sitemap = await fs.readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
  for (const r of routes.filter(r => r.index)) assert.ok(sitemap.includes(`${r.url}</loc>`), r.url);
  assert.ok(llms.startsWith('# Enamplify') && llms.includes('/approach/') && llms.includes('/insights/'));
  assert.ok(!(await fs.readFile(path.join(root, 'dist/feed.xml'), 'utf8')).includes('/perspectives/'));
});
test('performance budgets', () => {
  assert.ok(buildInfo.cssBytes <= 36000, `CSS ${buildInfo.cssBytes}`);
  assert.ok(buildInfo.jsBytes <= 12000, `JS ${buildInfo.jsBytes}`);
  for (const [i, h] of all.entries()) {
    for (const img of h.match(/<img[^>]*>/g) || []) assert.ok(/\swidth="\d+"/.test(img) && /\sheight="\d+"/.test(img), `${routes[i].url}: ${img}`);
    assert.ok(!/<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(h), routes[i].url);
    assert.ok(h.includes('rel="preload" href="/fonts/public-sans-latin.woff2"'), routes[i].url);
    assert.ok(!/\sstyle="/.test(h), `${routes[i].url} has an inline style attribute`);
  }
});
test('fonts are self-hosted WOFF2 with their OFL licences', async () => {
  const files = await fs.readdir(path.join(root, 'dist/fonts'));
  assert.ok(files.filter(f => f.endsWith('.woff2')).length === 2);
  assert.ok(files.every(f => /\.(woff2|txt)$/.test(f)));
  for (const f of files.filter(f => f.endsWith('.woff2'))) assert.ok(files.includes(f.replace('-latin.woff2', '-OFL.txt')), f);
  assert.ok(css.includes('font-display:optional'));
});
test('no placeholders or private identifiers in output', () => { const t = all.join('\n'); for (const p of ['Lorem ipsum', 'TODO', 'TBD', 'collection://', 'muhammad.gulubayli.25@', 'amirgulubayli@gmail.com', 'RESEND_API_KEY', 'TURNSTILE_SECRET_KEY', '10×', '10x productivity']) assert.ok(!t.includes(p), p); });
test('worksheet PDFs exist', async () => { for (const n of ['ai-pilot-acceptance-checklist', 'ai-opportunity-canvas', 'team-ai-readiness']) { const b = await fs.readFile(path.join(root, 'dist/downloads', `${n}.pdf`)); assert.equal(b.subarray(0, 5).toString(), '%PDF-'); } });
test('enquiry composer states nothing has been sent', async () => { const h = await read('/contact/'); if (buildInfo.enquiryMode === 'email') { assert.ok(h.includes('Nothing is sent until you choose to send it.')); assert.ok(h.includes('data-mode="email"')); } else { assert.ok(h.includes('data-mode="server"')); assert.ok(h.includes('cf-turnstile')); } assert.ok(!h.includes('Your enquiry has been sent.')); });
test('no trackers or browser storage in client code', () => assert.ok(!/localStorage\.|sessionStorage\.|document\.cookie\s*=|googletagmanager|fbq\(/.test(js)));
test('accessibility fallbacks', () => { assert.ok(css.includes('prefers-reduced-motion')); assert.ok(css.includes(':focus-visible')); for (const h of all) { assert.ok(h.includes('Skip to content')); assert.ok(h.includes('<noscript>')); } });
test('house style: no em dashes, no preheaders, no uppercase', () => {
  for (const [i, h] of all.entries()) { assert.ok(!/[\u2014]|&mdash;|&#(?:8212|x2014);/i.test(h), routes[i].url); assert.ok(!/class="[^"]*\b(?:eyebrow|section-label|service-kicker|visual-overline)\b/.test(h), routes[i].url); }
  assert.ok(!/text-transform\s*:\s*uppercase/i.test(css));
  assert.ok(!js.includes('\u2014'));
});
```

- [ ] **Step 2: Run the full check**

Run: `npm run check`
Expected: `Built 20 pages…`, then every test file passes (content, exhibits, components, seo, routes, site, markdown, enquiry). Fix any failure at its source (not by loosening the test) and rerun.

- [ ] **Step 3: Commit**

```bash
git add tests/site.test.mjs
git commit -m "test: built-site checks for the redesign, SEO and budgets"
```

---

### Task 16: Open Graph image

**Files:**
- Create: `scripts/make_og.py`
- Replace: `public/images/social-card.png`

- [ ] **Step 1: Write `scripts/make_og.py`**

```python
"""Renders public/images/social-card.png (1200x630) in the Board Pack style with Playwright."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / "public/fonts"
HTML = f"""<!doctype html><html><head><style>
@font-face{{font-family:D;src:url('{(FONTS/'schibsted-grotesk-latin.woff2').as_uri()}')}}
@font-face{{font-family:T;src:url('{(FONTS/'public-sans-latin.woff2').as_uri()}')}}
body{{margin:0;width:1200px;height:630px;background:#fff;font-family:T;color:#1a2633}}
.f{{box-sizing:border-box;height:630px;padding:64px 72px;display:grid;grid-template-rows:auto 1fr auto}}
.w{{font:700 34px D;color:#0a1f33;letter-spacing:-.02em}}
h1{{align-self:center;margin:0;font:650 84px/1.02 D;letter-spacing:-.03em;color:#0a1f33}}
h1 span{{display:block;color:#556474}}
.b{{display:flex;justify-content:space-between;align-items:end;border-top:2px solid #0a1f33;padding-top:18px;font-size:22px}}
.bar{{display:flex;width:420px;height:22px;gap:3px}}.bar i{{display:block}}
</style></head><body><div class="f"><div class="w">Enamplify</div>
<h1>AI your team builds.<span>Not AI you buy.</span></h1>
<div class="b"><span>AI enablement for mid-sized organisations · London · Baku</span>
<div class="bar"><i style="flex:41;background:#0a1f33"></i><i style="flex:50;background:#1f5eff"></i><i style="flex:9;background:#a8b4c0"></i></div></div></div></body></html>"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630})
    page.set_content(HTML)
    page.wait_for_timeout(300)
    page.screenshot(path=str(ROOT / "public/images/social-card.png"))
    browser.close()
print("wrote public/images/social-card.png")
```

(Inline styles here are fine: this HTML is rendered locally to a PNG and never served.)

- [ ] **Step 2: Run it**

Run: `python scripts/make_og.py`
Expected: `wrote public/images/social-card.png`. If Chromium is missing, run `python -m playwright install chromium` first.

- [ ] **Step 3: Look at it**

Open `public/images/social-card.png` and confirm: wordmark top-left, two-line headline, footer line and bar, nothing clipped.

- [ ] **Step 4: Record provenance and commit**

```bash
echo "Rendered by scripts/make_og.py from HTML with self-hosted fonts; no generative model." > og-prompt.txt
"C:/Users/amirg/.claude/plugins/cache/impeccable/impeccable/4.3.1/skills/impeccable/scripts/impeccable" embed-prompt public/images/social-card.png --prompt-file og-prompt.txt
rm og-prompt.txt
git add scripts/make_og.py public/images/social-card.png
git commit -m "feat(seo): board-pack Open Graph image"
```

---

### Task 17: Visual QA and Impeccable finish

**Files:**
- Create: `.impeccable/review/desktop.png`, `.impeccable/review/mobile.png` (and per-page captures)

- [ ] **Step 1: Serve the build**

Run (background): `npm start`
Expected: server on `http://localhost:3000`.

- [ ] **Step 2: Capture every page type at 1440 and 390**

Create `scripts/capture.py` in the scratchpad (not the repo):

```python
from playwright.sync_api import sync_playwright
from pathlib import Path
out = Path(".impeccable/review"); out.mkdir(parents=True, exist_ok=True)
pages = {"home": "/", "approach": "/approach/", "work": "/work/", "about": "/about/", "insights": "/insights/", "article": "/insights/beyond-the-ai-demo/", "guide": "/insights/guides/ai-opportunity-canvas/", "contact": "/contact/"}
with sync_playwright() as p:
    b = p.chromium.launch()
    for label, width, height in [("desktop", 1440, 900), ("mobile", 390, 844)]:
        pg = b.new_page(viewport={"width": width, "height": height}, reduced_motion="reduce")
        for name, url in pages.items():
            pg.goto("http://localhost:3000" + url, wait_until="networkidle")
            pg.screenshot(path=str(out / (f"{label}.png" if name == "home" else f"{label}-{name}.png")), full_page=True)
    b.close()
```

Run it from the repo root. Open every file once and confirm none are blank or half-loaded.

- [ ] **Step 3: Critique against the direction contract, fix in one batch**

Check: first viewport matches the FIRST VIEWPORT block (H1 left, Exhibit 1 right on desktop; stacked on mobile with the button visible without scrolling at 390×844); exactly one blue primary button per viewport; no horizontal scroll at 390; exhibits readable; navy close band present on every page except 404. Batch every fix, rebuild (`npm run build`), recapture once.

- [ ] **Step 4: Run the Impeccable detector once**

Run: `"C:/Users/amirg/.claude/plugins/cache/impeccable/impeccable/4.3.1/skills/impeccable/scripts/impeccable" detect --json assets/styles.css src/pages src/components.mjs src/exhibits.mjs`
Fix mechanical findings; keep the rest for the reviewer.

- [ ] **Step 5: Finish review**

Spawn the `impeccable:impeccable-finish-reviewer` agent with: the original request (premium outcome-led copy, Board Pack styling, trust-building, SEO and CWV), the confirmed answers (PRODUCT.md), artifact path `dist/`, screenshot paths from Step 2 (desktop and mobile required), the direction contract `.impeccable/surfaces/src-pages-home-mjs.md`, the detector output, QUALITY BAR: none (code-led, no comp), and the craft-floor reference `C:/Users/amirg/.claude/plugins/cache/impeccable/impeccable/4.3.1/skills/impeccable/reference/craft-floor.md`. Act on its disposition word (ship / fix / rebuild / recapture) exactly as `reference/new-work.md` §7 describes; two fix rounds at most.

- [ ] **Step 6: Document the system**

Spawn `impeccable:impeccable-documenter` with the project root, `dist/`, the direction contract, `PRODUCT.md`, and `reference/document.md`. Verify `DESIGN.md` and `.impeccable/design.json` exist and carry tokens.

- [ ] **Step 7: Commit**

```bash
git add DESIGN.md .impeccable PRODUCT.md docs/superpowers
git commit -m "docs: DESIGN.md, product record and review evidence for the redesign"
```

---

### Task 18: Preview deploy and redirect verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README.** Replace the opening description and the "Run it" section's page count, and add a "Structure" section listing `src/content.mjs`, `src/routes.mjs`, `src/seo.mjs`, `src/exhibits.mjs`, `src/components.mjs`, `src/pages/*` with one line each (copy the table from this plan's File map). Remove references to `/solutions/`, `/perspectives/`, `/resources/` and Google Fonts.

- [ ] **Step 2: Commit and push the branch**

```bash
git add README.md
git commit -m "docs: README for the redesigned site"
git push -u origin redesign/board-pack
```

- [ ] **Step 3: Verify redirects on the Vercel preview**

Once Vercel posts the preview URL for the branch, run for each old URL:

```bash
curl -sI https://<preview-host>/perspectives/the-handoff-gap/ | grep -i -E "^(HTTP|location)"
```

Expected for each: a `308` (or `301`) with `location: /insights/the-handoff-gap/`. Repeat for `/solutions/ai-training/`, `/for/operations/`, `/start/pilot-review/`, `/resources/team-ai-readiness/`, `/work/pripitch/`, `/credits/`. If a source without a trailing slash does not match, add a second entry per rule without the trailing slash (e.g. `/perspectives/:slug`), update `src/routes.mjs` `redirects` to match, rerun `npm run check`, and push.

- [ ] **Step 4: Measure Core Web Vitals on the preview**

Run PageSpeed Insights (mobile) against the preview home, approach and an article. Expected: LCP < 2.5 s, CLS < 0.1, INP green. Record the numbers in the PR description.

- [ ] **Step 5: Open the PR** with `gh pr create --base master --title "Board Pack redesign" --body "<summary, CWV numbers, open items from spec §11>\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)"`.
