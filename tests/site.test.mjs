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
test('every internal link resolves', async () => {
  for (const h of all) for (const m of h.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const raw = m[1];
    if (raw.startsWith('//')) continue;
    const link = raw.split('?')[0];
    assert.ok(link.endsWith('/') || path.extname(link), `Link is missing a trailing slash or file extension: ${link}`);
    const file = path.join(root, 'dist', link, link.endsWith('/') ? 'index.html' : '');
    assert.ok(await fs.access(file).then(() => true, () => false), `Missing ${link}`);
  }
});
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
test('mobile header CTA hiding rule has higher specificity than .btn', () => {
  assert.ok(css.includes('@media (max-width:1000px){.site-header .site-nav,.site-header .site-header__cta{display:none}'), 'the CTA-hiding selector must be more specific than .btn');
});
test('house style: no em dashes, no preheaders, no uppercase', () => {
  for (const [i, h] of all.entries()) { assert.ok(!/[—]|&mdash;|&#(?:8212|x2014);/i.test(h), routes[i].url); assert.ok(!/class="[^"]*\b(?:eyebrow|section-label|service-kicker|visual-overline)\b/.test(h), routes[i].url); }
  assert.ok(!/text-transform\s*:\s*uppercase/i.test(css));
  assert.ok(!js.includes('—'));
});
test('proof is an exhibit ledger on home and work, with no kicker lines above titles', async () => {
  const home = await read('/'), work = await read('/work/');
  assert.ok(home.includes('Exhibit 5 · Track record') && work.includes('Exhibit 1 · Track record'));
  assert.ok(!/class="(?:figures|delivered|recognition|numbered__n)"/.test(home + work));
  for (const [i, h] of all.entries()) assert.ok(!/<p class="card__meta">[^<]*<\/p>\s*<(?:h1|h2|h3)/.test(h), routes[i].url);
});
