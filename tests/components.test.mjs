import test from 'node:test';
import assert from 'node:assert/strict';
import {esc, header, footer, exhibit, breadcrumb, closeBand, portrait, articleCard} from '../src/components.mjs';

const site = {name: 'Enamplify', email: 'a@b.co', linkedin: 'https://example.com/in', cities: ['London', 'Baku'], definition: 'Enamplify is an AI enablement consultancy.', nav: [['Approach', '/approach/'], ['Work', '/work/'], ['Insights', '/insights/']]};

test('esc escapes markup', () => assert.equal(esc('<a "b">'), '&lt;a &quot;b&quot;&gt;'));
test('header marks the current section and offers a quiet booking link', () => {
  const html = header(site, '/work/');
  assert.ok(html.includes('<a href="/work/" aria-current="page">Work</a>'));
  assert.ok(!html.includes('<a href="/approach/" aria-current'));
  assert.ok(html.includes('Book a call'));
  assert.ok(html.includes('Skip to content'));
});
test('header marks nothing on the home page', () => {
  const html = header(site, '/');
  assert.ok(!html.includes('aria-current'));
});
test('header marks a section match with aria-current="true"', () => {
  const html = header(site, '/insights/x/');
  assert.ok(html.includes('<a href="/insights/" aria-current="true">Insights</a>'));
});
test('header marks Book a call current on the contact page', () => {
  const html = header(site, '/contact/');
  assert.ok(html.includes('aria-current="page">Book a call</a>'));
});
test('footer carries the definition sentence and both cities', () => {
  const html = footer(site);
  assert.ok(html.includes('Enamplify is an AI enablement consultancy.'));
  assert.ok(html.includes('London · Baku'));
});
test('exhibit is a figure with a one-line label, an action title and a source', () => {
  const html = exhibit({n: 2, topic: 'More done', title: 'Admin falls from 14 hours to 6.', chart: '<svg></svg>', source: 'Illustrative.'});
  assert.match(html, /^<figure class="exhibit/);
  assert.ok(html.includes('<figcaption class="exhibit__cap"><span class="exhibit__label">Exhibit 2 · More done</span><span class="exhibit__title">Admin falls from 14 hours to 6.</span></figcaption>'));
  assert.ok(html.includes('Source: Illustrative.'));
});
test('portrait caption can be left out where a quote already attributes', () => {
  const site = {portrait: '/images/p.jpg'};
  assert.ok(portrait(site).includes('<figcaption>Amir Gulubayli, Founder</figcaption>'));
  assert.ok(!portrait(site, {caption: false}).includes('<figcaption'));
});
test('article card puts its meta line below the title, not above it', () => {
  const html = articleCard({slug: 's', title: 'T', summary: 'S', category: 'Governance', readingTime: 3});
  assert.ok(html.indexOf('card__title') < html.indexOf('card__meta'));
});
test('breadcrumb marks the last crumb as current', () => {
  assert.ok(breadcrumb([['Insights', '/insights/'], ['Essay']]).includes('<span aria-current="page">Essay</span>'));
});
test('close band links to contact', () => assert.ok(closeBand().includes('href="/contact/"')));
