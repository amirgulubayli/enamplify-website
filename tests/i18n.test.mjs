import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {locales, localePath, basePath, otherLocale, alternatesFor, fill} from '../src/i18n.mjs';
import {loadContent, overlay} from '../src/content.mjs';
import {routeTable} from '../src/routes.mjs';

const en = await loadContent('en');
const az = await loadContent('az');
const enRoutes = routeTable({...en, enquiryMode: 'email'});
const azRoutes = routeTable({...az, enquiryMode: 'email'});

test('locales describe English and Azerbaijani', () => {
  assert.deepEqual(Object.keys(locales), ['en', 'az']);
  assert.equal(locales.en.lang, 'en-GB');
  assert.equal(locales.az.prefix, '/az');
  assert.equal(locales.az.name, 'Azərbaycanca');
  assert.equal(otherLocale('en'), 'az');
  assert.equal(otherLocale('az'), 'en');
});

test('localePath prefixes pages and the feed, never assets or external links', () => {
  assert.equal(localePath('en', '/approach/'), '/approach/');
  assert.equal(localePath('az', '/'), '/az/');
  assert.equal(localePath('az', '/approach/'), '/az/approach/');
  assert.equal(localePath('az', '/insights/guides/team-ai-readiness/'), '/az/insights/guides/team-ai-readiness/');
  assert.equal(localePath('az', '/insights/#guides'), '/az/insights/#guides');
  assert.equal(localePath('az', '/contact/?interest=x'), '/az/contact/?interest=x');
  assert.equal(localePath('az', '/feed.xml'), '/az/feed.xml');
  for (const p of ['/downloads/team-ai-readiness.pdf', '/fonts/a.woff2', '/images/a.jpg', '/assets/site.js', '/favicon.svg', 'https://example.com/', 'mailto:a@b.co', '#main'])
    assert.equal(localePath('az', p), p);
  assert.equal(basePath('/az/approach/'), '/approach/');
  assert.equal(basePath('/az/'), '/');
  assert.equal(basePath('/approach/'), '/approach/');
  assert.deepEqual(alternatesFor('/work/'), {en: '/work/', az: '/az/work/'});
});

test('fill replaces known placeholders and leaves unknown ones visible', () => {
  assert.equal(fill('{n} min read', {n: 3}), '3 min read');
  assert.equal(fill('Hi {who}', {}), 'Hi {who}');
});

test('overlay merges objects, matches slugged items and records gaps', () => {
  const missing = [];
  const merged = overlay({a: 'A', list: [{slug: 'x', t: 'X', n: 1}, {slug: 'y', t: 'Y'}], pairs: [['a', 'b']]}, {a: 'Á', list: [{slug: 'y', t: 'Ý'}], pairs: [['á', 'b́']]}, missing);
  assert.deepEqual(merged, {a: 'Á', list: [{slug: 'x', t: 'X', n: 1}, {slug: 'y', t: 'Ý'}], pairs: [['á', 'b́']]});
  assert.deepEqual(missing, ['list[x]']);
  const strict = [];
  overlay({a: 'A', b: {c: 'C'}}, {b: {}}, strict, {strict: true});
  assert.deepEqual(strict, ['a', 'b.c']);
});

test('every route has a key, a locale and both alternates', () => {
  for (const r of [...enRoutes, ...azRoutes]) {
    assert.ok(r.key && r.locale, r.url);
    assert.deepEqual(Object.keys(r.alternates), ['en', 'az'], r.url);
    if (!r.notFound) assert.equal(r.alternates[r.locale], r.url, r.url);
  }
});

test('Azerbaijani routes mirror English routes under /az', () => {
  const indexable = enRoutes.filter(r => !r.notFound);
  assert.equal(azRoutes.length, indexable.length, 'no /az/404/');
  assert.deepEqual(azRoutes.map(r => r.url), indexable.map(r => `/az${r.url}`));
  assert.deepEqual(azRoutes.map(r => r.key), indexable.map(r => r.key));
  assert.ok(azRoutes.every(r => r.locale === 'az'));
});

test('missing translations fall back to English and are recorded', () => {
  assert.deepEqual(en.missing, []);
  assert.ok(Array.isArray(az.missing));
  for (const m of az.missing) assert.match(m, /^content\/(az\/|copy\/az\.json|articles\/az\/)/);
  assert.equal(az.copy.common.menu.length > 0, true);
});

test('page modules carry no hard-coded English copy', async () => {
  const phrases = ['Book a diagnostic call', 'Start small. Prove it.', 'What we will and won', 'Skip to content', 'min read', 'Field guide', 'Keep reading', 'Prefer to write?', 'Last updated', 'This page has moved', 'Built by people who ship', 'Questions leaders ask', 'Notes stay on this page'];
  const files = ['components.mjs', 'routes.mjs', 'seo.mjs', ...(await fs.readdir(new URL('../src/pages/', import.meta.url))).map(f => `pages/${f}`)];
  for (const f of files) {
    const src = await fs.readFile(new URL(`../src/${f}`, import.meta.url), 'utf8');
    for (const p of phrases) assert.ok(!src.includes(p), `${f} contains "${p}"`);
  }
});

// Azerbaijani translation: the dictionary mirrors English exactly and nothing is left untranslated.
const readCopy = async code => JSON.parse(await fs.readFile(new URL(`../content/copy/${code}.json`, import.meta.url), 'utf8'));
const enCopy = await readCopy('en');
const azCopy = await readCopy('az');
/** Flatten to {path: leaf}; arrays and objects both contribute their shape (keys and lengths). */
const leaves = (v, at = '', out = {}) => {
  if (v !== null && typeof v === 'object') { for (const [k, x] of Object.entries(v)) leaves(x, Array.isArray(v) ? `${at}[${k}]` : at ? `${at}.${k}` : k, out); }
  else out[at] = v;
  return out;
};
const enLeaves = leaves(enCopy);
const azLeaves = leaves(azCopy);
const placeholders = s => (String(s).match(/\{[a-zA-Z]+\}/g) || []).sort();
// Values that are legitimately identical in both languages: stage numbers, a brand-only label, the print rule.
const SAME_ALLOWED = new Set(['common.stages[0].n', 'common.stages[1].n', 'common.stages[2].n', 'home.ownedInHouse.usShort', 'client.printPlaceholder']);

test('az copy has exactly the English keys, with the same array lengths', () => {
  assert.deepEqual(Object.keys(azLeaves).sort(), Object.keys(enLeaves).sort());
});

test('az copy keeps every placeholder, and no value is empty or left in English', () => {
  for (const [k, en] of Object.entries(enLeaves)) {
    const azValue = azLeaves[k];
    assert.equal(typeof azValue, 'string', k);
    assert.ok(azValue.trim(), `${k} is empty`);
    assert.deepEqual(placeholders(azValue), placeholders(en), `${k} placeholders`);
    if (SAME_ALLOWED.has(k)) assert.equal(azValue, en, k);
    else assert.notEqual(azValue, en, `${k} is untranslated`);
  }
});

test('az content is complete: no English fallbacks anywhere', () => {
  assert.deepEqual(az.missing, []);
});

test('az overlays replace arrays whole with the English lengths', async () => {
  const read = async rel => JSON.parse(await fs.readFile(new URL(`../content/${rel}`, import.meta.url), 'utf8'));
  const [enWork, azWork, enFaqs, azFaqs, enRes, azRes, enSite, azSite] = await Promise.all(['work.json', 'az/work.json', 'faqs.json', 'az/faqs.json', 'resources.json', 'az/resources.json', 'site.json', 'az/site.json'].map(read));
  assert.equal(azWork.delivered.length, enWork.delivered.length);
  assert.equal(azWork.products.length, enWork.products.length);
  assert.equal(azFaqs.length, enFaqs.length);
  assert.deepEqual(azSite.nav.map(([, h]) => h), enSite.nav.map(([, h]) => h), 'nav keeps base hrefs');
  for (const g of enRes) {
    const t = azRes.find(r => r.slug === g.slug);
    assert.ok(t, g.slug);
    assert.equal(t.fields.length, g.fields.length, `${g.slug} fields`);
    assert.equal(t.checks.length, g.checks.length, `${g.slug} checks`);
  }
});

test('az pages are in Azerbaijani, with unique titles and descriptions', () => {
  for (const r of azRoutes) assert.match(r.html, /ə/, r.url);
  const titles = azRoutes.map(r => r.title);
  const descriptions = azRoutes.map(r => r.description);
  assert.equal(new Set(titles).size, titles.length, 'titles unique');
  assert.equal(new Set(descriptions).size, descriptions.length, 'descriptions unique');
  const enTitles = new Set(enRoutes.map(r => r.title));
  for (const t of titles) assert.ok(!enTitles.has(t), `"${t}" is an English title`);
});

test('the bilingual 404 title fits', () => {
  const r = routeTable({...en, enquiryMode: 'email'}, {notFoundAlso: [az]}).find(x => x.notFound);
  assert.ok(`${r.title} | Enamplify`.length <= 70, r.title);
  assert.ok(r.description.length <= 160, r.description);
});

test('az titles and descriptions spell out "süni intellekt" rather than the abbreviation', () => {
  const seo = [...azRoutes.flatMap(r => [r.title, r.description]), az.copy.common.feedDescription, az.site.description];
  for (const s of seo) assert.ok(!s.includes('Sİ'), s);
});
