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
