import test from 'node:test';
import assert from 'node:assert/strict';
import {esc, header, footer, exhibit, breadcrumb, closeBand} from '../src/components.mjs';

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
test('exhibit is a figure with label, title and source', () => {
  const html = exhibit({n: 2, title: 'More done', chart: '<svg></svg>', source: 'Illustrative.'});
  assert.match(html, /^<figure class="exhibit/);
  assert.ok(html.includes('Exhibit 2') && html.includes('More done') && html.includes('Source: Illustrative.'));
});
test('breadcrumb marks the last crumb as current', () => {
  assert.ok(breadcrumb([['Insights', '/insights/'], ['Essay']]).includes('<span aria-current="page">Essay</span>'));
});
test('close band links to contact', () => assert.ok(closeBand().includes('href="/contact/"')));
