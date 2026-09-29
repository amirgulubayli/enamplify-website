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
  assert.equal(c.articles.length, 11);
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
