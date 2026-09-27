import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {titleFor, jsonLd, renderDocument} from '../src/seo.mjs';
import {alternatesFor} from '../src/i18n.mjs';

const copy = JSON.parse(await fs.readFile(new URL('../content/copy/en.json', import.meta.url), 'utf8'));

const site = {name: 'Enamplify', email: 'a@b.co', founder: 'Amir Gulubayli', linkedin: 'https://example.com/in', definition: 'Enamplify is an AI enablement consultancy.', cities: ['London', 'Baku'], nav: [['Work', '/work/']]};
const base = 'https://enamplify.com';
const graph = route => JSON.parse(jsonLd({base, site, route}))['@graph'];
const types = route => graph(route).map(n => n['@type']);

test('titles: home is literal, others get the brand suffix', () => {
  assert.equal(titleFor({home: true, title: 'Enamplify · AI enablement'}, site), 'Enamplify · AI enablement');
  assert.equal(titleFor({title: 'Work.'}, site), 'Work | Enamplify');
});
test('every page carries the practice, founder and website', () => {
  assert.deepEqual(types({url: '/'}), ['ProfessionalService', 'Person', 'WebSite', 'WebPage']);
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
  const html = renderDocument({base, site, route: {url: '/work/', title: 'Work', description: 'D', html: '<h1>W</h1>'}, copy, cssName: 's.css', jsName: 's.js', indexable: false});
  assert.ok(html.includes('rel="preload" href="/fonts/libre-caslon-display-400-latin.woff2"'));
  assert.ok(!/<link[^>]+rel="stylesheet"[^>]+https:/.test(html));
  assert.ok(html.includes('content="noindex,follow"'));
  assert.ok(html.includes('<link rel="canonical" href="https://enamplify.com/work/">'));
});
test('not-found document carries no canonical link', () => { const html = renderDocument({base, site, route: {url: '/404/', title: 'Not found', description: 'D', html: '<h1>N</h1>', notFound: true}, copy, cssName: 's.css', jsName: 's.js', indexable: false}); assert.ok(!html.includes('rel="canonical"')); });
test('document injects the Turnstile widget when the contact page has the form-errors anchor', () => {
  const html = renderDocument({base, site, route: {url: '/contact/', title: 'Contact', description: 'D', html: '<form><div id="form-errors"></div></form>', contact: true}, copy, cssName: 's.css', jsName: 's.js', indexable: true, turnstileKey: 'key123'});
  assert.ok(html.includes('class="cf-turnstile"'));
  assert.ok(html.includes('challenges.cloudflare.com/turnstile'));
});
test('document throws when the contact page is missing the form-errors anchor', () => {
  assert.throws(() => renderDocument({base, site, route: {url: '/contact/', title: 'Contact', description: 'D', html: '<form></form>', contact: true}, copy, cssName: 's.css', jsName: 's.js', indexable: true, turnstileKey: 'key123'}), /form-errors anchor/);
});
test('document emits the literal title for the home route', () => {
  const html = renderDocument({base, site, route: {home: true, url: '/', title: 'Enamplify · AI enablement', description: 'D', html: '<h1>Home</h1>'}, copy, cssName: 's.css', jsName: 's.js', indexable: true});
  assert.ok(html.includes('<title>Enamplify · AI enablement</title>'));
});
test('JSON-LD names both languages on the website and the page language elsewhere', () => {
  const g = graph({url: '/az/work/', locale: 'az', crumbs: [['Work']]});
  assert.deepEqual(g.find(n => n['@type'] === 'WebSite').inLanguage, ['en-GB', 'az']);
  assert.equal(g.find(n => n['@type'] === 'WebPage').inLanguage, 'az');
  assert.equal(g.find(n => n['@type'] === 'BreadcrumbList').itemListElement[0].item, 'https://enamplify.com/az/');
});
test('document declares its language, hreflang alternates and a same-language feed', () => {
  const route = {url: '/az/work/', locale: 'az', alternates: alternatesFor('/work/'), title: 'Work', description: 'D', html: '<h1>W</h1>'};
  const html = renderDocument({base, site, copy, route, cssName: 's.css', jsName: 's.js', indexable: true});
  assert.ok(html.includes('<html lang="az">'));
  assert.ok(html.includes('<link rel="alternate" hreflang="en-GB" href="https://enamplify.com/work/">'));
  assert.ok(html.includes('<link rel="alternate" hreflang="az" href="https://enamplify.com/az/work/">'));
  assert.ok(html.includes('<link rel="alternate" hreflang="x-default" href="https://enamplify.com/work/">'));
  assert.ok(html.includes('<meta property="og:locale" content="az_AZ"><meta property="og:locale:alternate" content="en_GB">'));
  assert.ok(html.includes('type="application/rss+xml" title="Enamplify Insights" href="/az/feed.xml"'));
  const strings = JSON.parse(html.match(/<script type="application\/json" id="ui-strings">(.*?)<\/script>/)[1]);
  assert.equal(strings.menu, copy.client.menu);
});
test('ui strings cannot break out of their script tag', () => {
  const html = renderDocument({base, site, copy: {...copy, client: {x: '</script><b>'}}, route: {url: '/', title: 'T', description: 'D', html: ''}, cssName: 's.css', jsName: 's.js', indexable: true});
  assert.ok(!html.includes('</script><b>'));
});
test('not-found document carries no hreflang alternates', () => {
  const html = renderDocument({base, site, copy, route: {url: '/404/', alternates: alternatesFor('/'), title: 'N', description: 'D', html: '', notFound: true}, cssName: 's.css', jsName: 's.js', indexable: false});
  assert.ok(!html.includes('hreflang="x-default"'));
});
