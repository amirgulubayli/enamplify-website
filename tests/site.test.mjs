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
const images = JSON.parse(await fs.readFile(path.join(root, 'content/images.json'), 'utf8'));
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const js = await fs.readFile(path.join(root, 'assets/site.js'), 'utf8');
const ld = html => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));
const types = html => ld(html).flatMap(d => d['@graph'].map(n => n['@type']));

const exists = url => fs.access(path.join(root, 'dist', url, url.endsWith('/') ? 'index.html' : '')).then(() => true, () => false);
// Links a page may make outside its own language: shared files, and the toggle / hreflang counterparts.
const SHARED = /^\/(?:assets|fonts|images|downloads)\/|^\/(?:favicon|apple-touch-icon)[^/]*$/;
const withoutCounterparts = h => h.replace(/<nav class="lang"[\s\S]*?<\/nav>/g, '').replace(/<link rel="alternate" hreflang="[^"]+" href="[^"]*">/g, '');

test('40 pages are built: 20 English (with the bilingual 404) and 19 Azerbaijani, plus 404.html', async () => {
  assert.equal(routes.length, 39);
  assert.equal(routes.filter(r => r.locale === 'en').length, 20);
  assert.equal(routes.filter(r => r.locale === 'az').length, 19);
  assert.ok(await fs.access(path.join(root, 'dist/404.html')).then(() => true));
  assert.ok(!(await exists('/az/404/')), 'no Azerbaijani 404');
});
test('one H1 and one main per page, in the page language', () => { for (const [i, h] of all.entries()) { assert.equal([...h.matchAll(/<h1(?:\s|>)/g)].length, 1, routes[i].url); assert.equal([...h.matchAll(/<main(?:\s|>)/g)].length, 1); assert.ok(h.includes(routes[i].locale === 'az' ? '<html lang="az">' : '<html lang="en-GB">'), routes[i].url); } });
test('titles and descriptions are unique within each language', () => {
  for (const locale of ['en', 'az']) for (const p of [/<title>(.*?)<\/title>/s, /<meta name="description" content="([^"]*)"/]) {
    const v = all.filter((_, i) => routes[i].locale === locale).map(h => h.match(p)?.[1]);
    assert.ok(v.every(Boolean)); assert.equal(new Set(v).size, v.length, locale);
  }
});
test('every page except the 404 has hreflang alternates to existing pages', async () => {
  for (const [i, h] of all.entries()) {
    const links = [...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map(m => [m[1], new URL(m[2]).pathname]);
    if (routes[i].url === '/404/') { assert.equal(links.length, 0); continue; }
    assert.deepEqual(links.map(([l]) => l), ['en-GB', 'az', 'x-default'], routes[i].url);
    assert.equal(links[0][1], routes[i].alternates.en); assert.equal(links[1][1], routes[i].alternates.az); assert.equal(links[2][1], routes[i].alternates.en);
    for (const [, p] of links) assert.ok(await exists(p), `${routes[i].url} → ${p}`);
  }
});
test('the language toggle is on every page, marking the current language', () => {
  for (const [i, h] of all.entries()) {
    const toggles = h.match(/<nav class="lang"[\s\S]*?<\/nav>/g) || [];
    assert.equal(toggles.length, 2, routes[i].url);
    if (routes[i].url === '/404/') { assert.ok(toggles[0].includes('href="/"') && toggles[0].includes('href="/az/"')); continue; }
    const other = routes[i].locale === 'az' ? 'en' : 'az';
    assert.ok(toggles[0].includes(`<span aria-current="true" lang="${routes[i].locale === 'az' ? 'az' : 'en-GB'}">`), routes[i].url);
    assert.ok(toggles[0].includes(`href="${routes[i].alternates[other]}"`), routes[i].url);
  }
});
test('Azerbaijani pages link within /az/ apart from shared files and counterparts', () => {
  for (const [i, h] of all.entries()) {
    if (routes[i].locale !== 'az') continue;
    for (const m of withoutCounterparts(h).matchAll(/(?:href|src)="(\/[^"#?]*)/g)) assert.ok(m[1].startsWith('/az/') || SHARED.test(m[1]), `${routes[i].url} links ${m[1]}`);
  }
});
test('English pages (bar the bilingual 404) never link into /az/ outside the toggle and hreflang', () => {
  for (const [i, h] of all.entries()) if (routes[i].locale === 'en' && routes[i].key !== 'notFound') assert.ok(!/(?:href|src)="\/az\//.test(withoutCounterparts(h)), routes[i].url);
});
test('client strings are valid JSON on every page', () => {
  for (const [i, h] of all.entries()) {
    const raw = h.match(/<script type="application\/json" id="ui-strings">(.*?)<\/script>/s)?.[1];
    assert.ok(raw, routes[i].url);
    const strings = JSON.parse(raw);
    for (const k of ['menu', 'close', 'copied', 'errName', 'readyTitle', 'sending', 'reachDirect']) assert.ok(strings[k], `${routes[i].url} ${k}`);
  }
});
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
  for (const url of ['/approach/', '/az/approach/']) assert.ok(types(await read(url)).includes('FAQPage'), url);
  for (const r of routes.filter(r => r.key.startsWith('article:'))) assert.ok(types(await read(r.url)).includes('Article'), r.url);
  for (const r of routes.filter(r => r.key !== 'home' && r.key !== 'notFound')) assert.ok(types(await read(r.url)).includes('BreadcrumbList'), r.url);
  for (const [i, h] of all.entries()) {
    const graph = ld(h).flatMap(d => d['@graph']);
    assert.deepEqual(graph.find(n => n['@type'] === 'WebSite').inLanguage, ['en-GB', 'az']);
    if (routes[i].key !== 'notFound') assert.equal(graph.find(n => n['@type'] === 'WebPage').inLanguage, routes[i].locale === 'az' ? 'az' : 'en-GB', routes[i].url);
  }
});
test('llms.txt, sitemap and feed list the new URLs', async () => {
  const llms = await fs.readFile(path.join(root, 'dist/llms.txt'), 'utf8');
  const sitemap = await fs.readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
  for (const r of routes.filter(r => r.index)) assert.ok(sitemap.includes(`${r.url}</loc>`), r.url);
  assert.ok(!sitemap.includes('/404/'));
  assert.ok(sitemap.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'));
  assert.equal([...sitemap.matchAll(/<url>/g)].length, routes.filter(r => r.index).length);
  assert.equal([...sitemap.matchAll(/<xhtml:link rel="alternate" hreflang="(?:en-GB|az|x-default)"/g)].length, 3 * routes.filter(r => r.index).length);
  assert.ok(llms.startsWith('# Enamplify') && llms.includes('/approach/') && llms.includes('/insights/'));
  assert.ok(llms.includes('## Azərbaycanca') && llms.includes('/az/approach/'));
  const feed = await fs.readFile(path.join(root, 'dist/feed.xml'), 'utf8');
  const azFeed = await fs.readFile(path.join(root, 'dist/az/feed.xml'), 'utf8');
  assert.ok(!feed.includes('/perspectives/') && !feed.includes('/az/'));
  assert.ok(azFeed.includes('<language>az</language>') && azFeed.includes('/az/insights/'));
});
test('performance budgets', () => {
  assert.ok(buildInfo.cssBytes <= 36000, `CSS ${buildInfo.cssBytes}`);
  assert.ok(buildInfo.jsBytes <= 12000, `JS ${buildInfo.jsBytes}`);
  for (const [i, h] of all.entries()) {
    for (const img of h.match(/<img[^>]*>/g) || []) assert.ok(/\swidth="\d+"/.test(img) && /\sheight="\d+"/.test(img), `${routes[i].url}: ${img}`);
    assert.ok(!/<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(h), routes[i].url);
    for (const f of ['libre-caslon-display-400-latin', 'dm-sans-var-latin']) assert.ok(h.includes(`rel="preload" href="/fonts/${f}.woff2"`), routes[i].url);
    assert.ok(!/\sstyle="/.test(h), `${routes[i].url} has an inline style attribute`);
  }
});
test('city photographs: every src and srcset file exists; only the home hero diptych loads eagerly', async () => {
  let seen = 0;
  for (const [i, h] of all.entries()) {
    const home = routes[i].key === 'home';
    const city = (h.match(/<img[^>]*>/g) || []).filter(img => img.includes('/images/city/'));
    for (const img of city) {
      const files = [img.match(/\ssrc="([^"]+)"/)[1], ...img.match(/\ssrcset="([^"]+)"/)[1].split(',').map(s => s.trim().split(/\s+/)[0])];
      for (const f of files) { assert.match(f, /^\/images\/city\/[a-z0-9-]+\.webp$/, f); assert.ok(await exists(f), `${routes[i].url}: missing ${f}`); seen++; }
      assert.match(img, /\ssizes="[^"]+"/, `${routes[i].url}: ${img}`);
      assert.match(img, /\sdecoding="async"/);
      const hero = home && /\/images\/city\/hero-/.test(img);
      if (hero) { assert.match(img, /\sloading="eager"/, img); assert.match(img, /\sfetchpriority="high"/, img); }
      else { assert.match(img, /\sloading="lazy"/, `${routes[i].url}: ${img}`); assert.ok(!img.includes('fetchpriority'), `${routes[i].url}: ${img}`); }
    }
    if (home) assert.equal(city.filter(img => img.includes('fetchpriority="high"')).length, 2, routes[i].url);
    for (const key of ['approach', 'work', 'insights', 'contact']) if (routes[i].key === key) assert.ok(h.includes(`/images/city/band-${key}-`), routes[i].url);
    if (routes[i].key === 'about') assert.ok(h.includes('/images/city/about-london-') && h.includes('/images/city/about-baku-'), routes[i].url);
    // Captions name the place; the footer colophon credits exactly the photographers shown.
    const colophon = h.match(/<p class="colophon">([\s\S]*?)<\/p>/)?.[1] ?? '';
    const shown = [...new Set(city.map(img => img.match(/\/images\/city\/([a-z0-9-]+?)-\d+\.webp/)[1]))];
    assert.equal(!!colophon, shown.length > 0, routes[i].url);
    for (const id of shown) assert.ok(colophon.includes(`rel="noopener noreferrer">${esc(images[id].credit.name)}</a>`), `${routes[i].url} credits ${id}`);
    assert.equal((colophon.match(/<a /g) || []).length, new Set(shown.map(id => images[id].credit.name)).size, routes[i].url);
    assert.ok(!/<figcaption>[^<]*(?:Photo|Foto)/.test(h), routes[i].url);
  }
  assert.ok(seen > 0);
});
test('first-viewport faces are preloaded: italic on home, latin-ext on Azerbaijani pages', () => {
  const pre = f => new RegExp(`<link rel="preload" href="/fonts/${f}\.woff2" as="font" type="font/woff2" crossorigin>`);
  for (const [i, h] of all.entries()) {
    const {key, locale, url} = routes[i];
    assert.equal(pre('libre-caslon-text-400italic-latin').test(h), key === 'home', url);
    for (const f of ['libre-caslon-display-400-latin-ext', 'dm-sans-var-latin-ext']) assert.equal(pre(f).test(h), locale === 'az', `${url} ${f}`);
  }
});
test('brand assets: oxblood icons, and each language shares its own social card', async () => {
  for (const [i, h] of all.entries()) {
    const card = routes[i].locale === 'az' ? '/images/social-card-az.png' : '/images/social-card.png';
    assert.match(h, new RegExp(`<meta property="og:image" content="[^"]+${card}">`), routes[i].url);
    assert.ok(h.includes('<meta name="theme-color" content="#f3eee5">'), routes[i].url);
  }
  for (const f of ['images/social-card.png', 'images/social-card-az.png', 'favicon.png', 'apple-touch-icon.png']) {
    const png = await fs.readFile(path.join(root, 'dist', f));
    assert.equal(png.subarray(1, 4).toString(), 'PNG', f);
    assert.ok(png.includes('tEXt') || png.includes('iTXt'), `${f} carries embedded provenance`);
  }
  for (const f of ['favicon.svg', 'brand-mark.svg']) {
    const svg = await fs.readFile(path.join(root, 'dist', f), 'utf8');
    assert.ok(svg.includes('fill="#502d36"') && svg.includes('fill="#f3eee5"') && !svg.includes('<text'), f);
  }
});
test('fonts are self-hosted WOFF2 with their OFL licences', async () => {
  const files = await fs.readdir(path.join(root, 'dist/fonts'));
  const woff2 = files.filter(f => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 2);
  assert.ok(files.every(f => /\.(woff2|txt|json)$/.test(f)), 'fonts are WOFF2 only');
  for (const [family, file] of [['Libre Caslon Display', 'libre-caslon-display'], ['DM Sans', 'dm-sans']]) {
    assert.ok(css.includes(`font-family:"${family}"`), family);
    assert.ok(files.includes(`${file}-OFL.txt`), `${file}-OFL.txt`);
  }
  const ranges = JSON.parse(await fs.readFile(path.join(root, 'public/fonts/unicode-ranges.json'), 'utf8'));
  for (const f of woff2) {
    const face = css.split('@font-face').find(rule => rule.includes(`/fonts/${f}"`))?.split('}')[0];
    assert.ok(face, `${f} has an @font-face rule`);
    assert.ok(face.includes(`unicode-range:${ranges[f].replace(/, /g, ',')}`), `${f} uses its subset's unicode-range`);
  }
  for (const f of woff2) assert.ok(files.includes(f.replace(/-(?:\d+|var)(?:italic)?-latin(?:-ext)?\.woff2$/, '-OFL.txt')), `${f} has its OFL licence`);
  assert.ok(css.includes('font-display:optional'));
});
test('no placeholders or private identifiers in output', () => { const t = all.join('\n'); for (const p of ['Lorem ipsum', 'TODO', 'TBD', 'collection://', 'muhammad.gulubayli.25@', 'amirgulubayli@gmail.com', 'RESEND_API_KEY', 'TURNSTILE_SECRET_KEY', '10×', '10x productivity']) assert.ok(!t.includes(p), p); });
test('worksheet PDFs exist', async () => { for (const n of ['ai-pilot-acceptance-checklist', 'ai-opportunity-canvas', 'team-ai-readiness']) { const b = await fs.readFile(path.join(root, 'dist/downloads', `${n}.pdf`)); assert.equal(b.subarray(0, 5).toString(), '%PDF-'); } });
test('enquiry composer states nothing has been sent', async () => { const h = await read('/contact/'); if (buildInfo.enquiryMode === 'email') { assert.ok(h.includes('Nothing is sent until you choose to send it.')); assert.ok(h.includes('data-mode="email"')); } else { assert.ok(h.includes('data-mode="server"')); assert.ok(h.includes('cf-turnstile')); } assert.ok(!h.replace(/<script[\s\S]*?<\/script>/g, '').includes('Your enquiry has been sent.')); });
test('contact form posts to mailto so a no-JS submit never uses GET', async () => { const h = await read('/contact/'); const form = h.match(/<form id="enquiry-form"[^>]*>/)?.[0]; assert.ok(form, 'enquiry form present'); assert.match(form, /\smethod="post"/); assert.match(form, /\saction="mailto:[^"]+@[^"]+"/); assert.match(form, /\senctype="text\/plain"/); });
test('no trackers or browser storage in client code', () => assert.ok(!/localStorage\.|sessionStorage\.|document\.cookie\s*=|googletagmanager|fbq\(/.test(js)));
test('accessibility fallbacks', () => { assert.ok(css.includes('prefers-reduced-motion')); assert.ok(css.includes(':focus-visible')); for (const h of all) { assert.ok(h.includes('<a class="skip-link" href="#main">')); assert.ok(h.includes('<noscript>')); } });
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
  assert.ok(home.includes('Exhibit 5 · Track record.') && work.includes('Exhibit 1 · Delivered.'));
  assert.ok(!work.includes('Track record'), 'work does not repeat the home proof exhibit');
  assert.ok(!/class="(?:figures|delivered|recognition|numbered__n|grid-list grid-list--four)"/.test(home + work));
  for (const [i, h] of all.entries()) assert.ok(!/<p class="card__meta">[^<]*<\/p>\s*<(?:h1|h2|h3)/.test(h), routes[i].url);
});
