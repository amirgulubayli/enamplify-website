import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import data from '../content/portfolio.json' with {type: 'json'};

const read = file => fs.readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');

test('both portfolio URLs work directly, remain unindexed and stay out of discovery files', async () => {
  for (const prefix of ['', 'az/']) {
    const html = await read(`${prefix}portfolio/index.html`);
    assert.match(html, /name="robots" content="noindex,follow"/);
    assert.equal((html.match(/class="portfolio-project section/g) || []).length, 12);
    for (const p of data.projects) assert.ok(html.includes(`id="${p.slug}"`));
  }
  for (const file of ['sitemap.xml', 'llms.txt', 'feed.xml', 'az/feed.xml']) {
    assert.ok(!(await read(file)).includes('/portfolio/'), file);
  }
});

test('no public page links to the unlisted portfolio', async () => {
  const routes = JSON.parse(await fs.readFile(new URL('../qa/routes.json', import.meta.url), 'utf8'));
  for (const r of routes.filter(r => r.key !== 'portfolio')) {
    const html = await read(`${r.url.slice(1)}index.html`);
    assert.ok(!/href="(?:https?:\/\/[^/]+)?\/(?:az\/)?portfolio\//.test(html), r.url);
  }
});

test('project logos are local, all entries have meaningful scope, and NDA has no identifying image or link', async () => {
  assert.equal(data.projects.length, 12);
  assert.equal(new Set(data.projects.map(p => p.slug)).size, 12);
  for (const p of data.projects) {
    if (p.logo) await fs.access(new URL(`../public/images/portfolio/${p.logo}`, import.meta.url));
    for (const lang of ['en', 'az']) {
      assert.ok(p[lang].intro.length > 100, p.slug);
      assert.ok(p[lang].bullets.length >= 5, p.slug);
      assert.ok(p[lang].bullets.every(([h, body]) => h && body.length > 40), p.slug);
    }
  }
  const nda = data.projects.find(p => p.slug === 'clinical-trials');
  assert.equal(nda.logo, null);
  assert.equal(nda.url, null);
});
