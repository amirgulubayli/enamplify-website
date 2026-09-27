import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {photo, photosIn, photoCredits} from '../src/components.mjs';

const read = rel => fs.readFile(new URL(`../content/${rel}`, import.meta.url), 'utf8').then(JSON.parse);
const [copy, images] = await Promise.all([read('copy/en.json'), read('images.json')]);
const ctx = {locale: 'en', copy, images};
const az = {...ctx, locale: 'az', copy: {...copy, common: {...copy.common, photographyCredits: 'Fotoşəkillər: {names}'}}};
const attr = (html, name) => html.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

test('photo lists every exported width in srcset, without assuming the widths', () => {
  const html = photo('hero-london', ctx, {sizes: '50vw'});
  assert.equal(attr(html, 'srcset'), '/images/city/hero-london-640.webp 640w, /images/city/hero-london-958.webp 958w');
  assert.equal(attr(html, 'sizes'), '50vw');
  const band = photo('band-work', ctx, {sizes: '100vw'});
  assert.equal(attr(band, 'srcset').split(', ').length, Object.keys(images['band-work'].files).length);
  assert.match(attr(band, 'srcset'), /band-work-2400\.webp 2400w$/);
});

test('photo takes width and height from the largest file', () => {
  const html = photo('hero-london', ctx, {sizes: '50vw'});
  assert.equal(attr(html, 'width'), '958');
  assert.equal(attr(html, 'height'), '1198');
  const band = photo('band-approach', ctx, {sizes: '100vw'});
  assert.equal(attr(band, 'width'), '2400');
  assert.equal(attr(band, 'height'), String(images['band-approach'].height));
});

test('photo is lazy by default and eager with high fetch priority when asked', () => {
  const lazy = photo('about-baku', ctx, {sizes: '30vw'});
  assert.equal(attr(lazy, 'loading'), 'lazy');
  assert.equal(attr(lazy, 'decoding'), 'async');
  assert.ok(!lazy.includes('fetchpriority'));
  const eager = photo('hero-baku', ctx, {sizes: '30vw', eager: true});
  assert.equal(attr(eager, 'loading'), 'eager');
  assert.equal(attr(eager, 'fetchpriority'), 'high');
});

test('photo alt text and caption follow the locale; the caption names the place only', () => {
  const en = photo('hero-baku', ctx, {sizes: '30vw'});
  assert.equal(attr(en, 'alt'), images['hero-baku'].alt.en);
  assert.ok(en.includes(`<figcaption>${images['hero-baku'].caption.en}</figcaption>`));
  assert.ok(!en.includes('Zulfugar'));
  const inAz = photo('hero-baku', az, {sizes: '30vw'});
  assert.equal(attr(inAz, 'alt'), images['hero-baku'].alt.az);
  assert.ok(inAz.includes(`<figcaption>${images['hero-baku'].caption.az}</figcaption>`));
});

test('photosIn finds each city photo a page shows, once, in order', () => {
  const html = photo('hero-london', ctx, {sizes: '1px'}) + photo('band-work', ctx, {sizes: '1px'}) + photo('hero-london', ctx, {sizes: '1px'});
  assert.deepEqual(photosIn(html), ['hero-london', 'band-work']);
  assert.deepEqual(photosIn('<p>no photos</p>'), []);
});

test('photoCredits links each photographer once, in the locale, and is empty without photos', () => {
  const html = photoCredits(ctx, ['hero-london', 'hero-baku', 'hero-london']);
  const {credit: l} = images['hero-london'], {credit: b} = images['hero-baku'];
  assert.equal(html, `<p class="colophon">Photography: <a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.name}</a>, <a href="${b.url}" target="_blank" rel="noopener noreferrer">${b.name}</a></p>`);
  assert.ok(photoCredits(az, ['hero-baku']).startsWith('<p class="colophon">Fotoşəkillər: <a '));
  assert.equal(photoCredits(ctx, []), '');
  assert.equal(photoCredits(ctx, ['unknown']), '');
});

test('photo wraps a figure with the given class, and can drop the caption', () => {
  const html = photo('band-contact', ctx, {sizes: '100vw', cls: 'band', caption: false});
  assert.match(html, /^<figure class="photo band"><img /);
  assert.ok(!html.includes('<figcaption'));
  assert.match(photo('band-contact', ctx, {sizes: '100vw'}), /^<figure class="photo"><img /);
});

test('photo escapes text and refuses unknown ids or missing sizes', () => {
  const tricky = {...ctx, images: {x: {files: {640: '/images/city/x.webp'}, width: 640, height: 800, alt: {en: 'A "quoted" <place>'}, caption: {en: 'Here & there'}, credit: {name: 'A & B'}}}};
  const html = photo('x', tricky, {sizes: '100vw'});
  assert.equal(attr(html, 'alt'), 'A &quot;quoted&quot; &lt;place&gt;');
  assert.ok(html.includes('<figcaption>Here &amp; there</figcaption>'));
  assert.ok(photoCredits(tricky, ['x']).includes('>A &amp; B</a>'));
  assert.throws(() => photo('nope', ctx, {sizes: '100vw'}), /Unknown image/);
  assert.throws(() => photo('hero-baku', ctx), /needs sizes/);
});

test('every image in the manifest has both locales and files that exist', async () => {
  for (const [id, img] of Object.entries(images)) {
    for (const k of ['alt', 'caption']) for (const l of ['en', 'az']) assert.ok(img[k][l]?.trim(), `${id} ${k}.${l}`);
    assert.ok(img.credit.name, id);
    for (const file of Object.values(img.files)) await fs.access(new URL(`../public${file}`, import.meta.url));
  }
});
