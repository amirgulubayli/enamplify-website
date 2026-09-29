import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {esc, header, footer, exhibit, breadcrumb, closeBand, portrait, articleCard, languageToggle} from '../src/components.mjs';
import {alternatesFor} from '../src/i18n.mjs';

const copy = JSON.parse(await fs.readFile(new URL('../content/copy/en.json', import.meta.url), 'utf8'));
const site = {name: 'Enamplify', email: 'a@b.co', linkedin: 'https://example.com/in', cities: ['London', 'Baku'], definition: 'Enamplify is an AI enablement consultancy.', portrait: '/images/p.jpg', nav: [['Approach', '/approach/'], ['Work', '/work/'], ['Insights', '/insights/']]};
const ctx = {locale: 'en', site, copy};
const az = {...ctx, locale: 'az'};
const at = (url, extra = {}) => ({url, alternates: alternatesFor(url), ...extra});

test('esc escapes markup', () => assert.equal(esc('<a "b">'), '&lt;a &quot;b&quot;&gt;'));
test('header marks the current section and offers a quiet booking link', () => {
  const html = header(ctx, at('/work/'));
  assert.ok(html.includes('<a href="/work/" aria-current="page">Work</a>'));
  assert.ok(!html.includes('<a href="/approach/" aria-current'));
  assert.ok(html.includes(copy.common.bookCall));
  assert.ok(html.includes(copy.common.skipLink));
});
test('header marks nothing on the home page', () => {
  const html = header(ctx, at('/')).replace(/<nav class="lang"[\s\S]*?<\/nav>/g, '');
  assert.ok(!html.includes('aria-current'));
});
test('header marks a section match with aria-current="true"', () => {
  assert.ok(header(ctx, {url: '/insights/x/', alternates: alternatesFor('/insights/x/')}).includes('<a href="/insights/" aria-current="true">Insights</a>'));
});
test('header marks Book a call current on the contact page', () => {
  assert.ok(header(ctx, at('/contact/')).includes(`aria-current="page">${copy.common.bookCall}</a>`));
});
test('Azerbaijani header links stay under /az/ and mark the current page', () => {
  const html = header(az, {url: '/az/work/', alternates: alternatesFor('/work/')});
  assert.ok(html.includes('<a href="/az/work/" aria-current="page">Work</a>'));
  assert.ok(html.includes('href="/az/contact/"'));
  assert.ok(html.includes('class="wordmark" href="/az/"'));
});
test('language toggle marks the current language and links the other with hreflang', () => {
  const html = languageToggle(ctx, alternatesFor('/work/'));
  assert.match(html, /^<nav class="lang" aria-label="Language">/);
  assert.ok(html.includes('<span aria-current="true" lang="en-GB">EN<span class="sr-only"> English</span></span>'));
  assert.ok(html.includes('<a href="/az/work/" hreflang="az" lang="az">AZ<span class="sr-only"> Azərbaycanca</span></a>'));
  const both = languageToggle(ctx, alternatesFor('/'), null);
  assert.ok(both.includes('href="/"') && both.includes('href="/az/"') && !both.includes('aria-current'));
});
test('header carries the toggle on desktop and at the end of the mobile menu', () => {
  const html = header(ctx, at('/work/'));
  assert.equal([...html.matchAll(/<nav class="lang"/g)].length, 2);
  assert.ok(html.indexOf('class="lang"') < html.indexOf('site-header__cta'));
  assert.ok(/<nav class="lang"[\s\S]*?<\/nav><\/div><\/nav><\/header>/.test(html));
});
test('footer carries the definition sentence and both cities', () => {
  const html = footer(ctx);
  assert.ok(html.includes('Enamplify is an AI enablement consultancy.'));
  assert.ok(html.includes('London · Baku'));
  assert.ok(footer(az).includes('href="/az/feed.xml"'));
});
test('exhibit caption is a run-in heading: bold label, then the action title', () => {
  const html = exhibit({n: 2, topic: 'More done', title: 'Admin falls from 14 hours to 6.', chart: '<svg></svg>'}, ctx);
  assert.match(html, /^<figure class="exhibit/);
  assert.ok(html.includes('<figcaption class="exhibit__cap"><span class="exhibit__label">Exhibit 2 · More done.</span> <span class="exhibit__title">Admin falls from 14 hours to 6.</span></figcaption>'));
  assert.ok(!html.includes('exhibit__source'), 'exhibits carry no source footnotes');
});
test('portrait caption can be left out where a quote already attributes', () => {
  assert.ok(portrait(ctx).includes(`<figcaption>${copy.common.portraitCaption}</figcaption>`));
  assert.ok(portrait(ctx).includes('width="320" height="400"'), 'never declared larger than the source');
  assert.ok(!portrait(ctx, {caption: false}).includes('<figcaption'));
});
test('article card puts its meta line below the title, not above it', () => {
  const html = articleCard({slug: 's', title: 'T', summary: 'S', category: 'Governance', readingTime: 3}, ctx);
  assert.ok(html.indexOf('card__title') < html.indexOf('card__meta'));
  assert.ok(html.includes('Governance · 3 min read'));
  assert.ok(articleCard({slug: 's', title: 'T', summary: 'S', category: 'G', readingTime: 3}, az).includes('href="/az/insights/s/"'));
});
test('breadcrumb marks the last crumb as current', () => {
  assert.ok(breadcrumb([['Insights', '/insights/'], ['Essay']], ctx).includes('<span aria-current="page">Essay</span>'));
  assert.ok(breadcrumb([['Insights', '/insights/'], ['Essay']], az).includes('<a href="/az/insights/">'));
});
test('close band links to contact', () => {
  assert.ok(closeBand(ctx).includes('href="/contact/"'));
  assert.ok(closeBand(az).includes('href="/az/contact/"'));
});
