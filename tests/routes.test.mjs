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
test('no redirect destination matches a redirect source pattern (no loops)', () => {
  const toRegExp = source => new RegExp(`^${source.replace(/:slug/g, '[^/]+')}$`);
  for (const r of redirects) {
    for (const other of redirects) {
      assert.ok(!toRegExp(other.source).test(r.destination), `${r.source} -> ${r.destination} matches ${other.source}`);
    }
  }
});
