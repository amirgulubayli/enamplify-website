import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {overlay, REQUIRED} from '../src/content.mjs';
import {localePath, basePath} from '../src/i18n.mjs';

const merge = (base, over, opts) => { const missing = []; return {value: overlay(base, over, missing, opts), missing}; };

test('localePath is idempotent and handles root query and hash', () => {
  assert.equal(localePath('az', '/az/approach/'), '/az/approach/');
  assert.equal(localePath('az', localePath('az', '/work/')), '/az/work/');
  assert.equal(localePath('az', '/az/'), '/az/');
  assert.equal(localePath('en', '/az/approach/'), '/approach/');
  assert.equal(localePath('az', '/?x=1'), '/az/?x=1');
  assert.equal(localePath('az', '/#top'), '/az/#top');
  assert.equal(localePath('az', '/az/?x=1'), '/az/?x=1');
  assert.equal(localePath('az', '/az/feed.xml'), '/az/feed.xml');
  assert.equal(localePath('az', '/images/az/x.jpg'), '/images/az/x.jpg');
  assert.equal(basePath('/az/?x=1'), '/?x=1');
  assert.equal(basePath('/az#top'), '/#top');
});

test('objects merge, unknown keys are reported and ignored', () => {
  const {value, missing} = merge({title: 'T', body: 'B'}, {title: 'Tə', titel: 'typo'});
  assert.deepEqual(value, {title: 'Tə', body: 'B'});
  assert.deepEqual(missing, ['titel (unknown key)']);
});

test('required keys are reported when absent or null, other absent keys are not', () => {
  const {value, missing} = merge({description: 'D', definition: 'F', email: 'a@b'}, {description: null}, {required: ['description', 'definition']});
  assert.deepEqual(value, {description: 'D', definition: 'F', email: 'a@b'});
  assert.deepEqual(missing, ['description', 'definition']);
});

test('required keys apply to each item of a slugged list; missing and unknown items are reported', () => {
  const base = [{slug: 'a', title: 'A', summary: 'S', isoDate: '2026-01-01'}, {slug: 'b', title: 'B', summary: 'S'}];
  const {value, missing} = merge(base, [{slug: 'a', title: 'Ə'}, {slug: 'c', title: 'C'}], {required: ['title', 'summary']});
  assert.deepEqual(value[0], {slug: 'a', title: 'Ə', summary: 'S', isoDate: '2026-01-01'});
  assert.deepEqual(value.map(v => v.slug), ['a', 'b'], 'the base decides which items exist');
  assert.deepEqual(missing, ['[c] (unknown item)', '[a].summary', '[b]']);
});

test('replaced arrays must keep the base length; null counts as missing', () => {
  const base = {delivered: [['x', 'y'], ['z', 'w']], cities: ['London', 'Baku'], products: [{name: 'p', line: 'L'}]};
  const {value, missing} = merge(base, {delivered: [['ə', 'ı']], cities: null, products: [{line: 'Lə'}, {line: 'extra'}]}, {required: ['delivered', 'cities', 'products']});
  assert.deepEqual(value.delivered, [['ə', 'ı']]);
  assert.deepEqual(value.cities, ['London', 'Baku']);
  assert.deepEqual(value.products, [{name: 'p', line: 'Lə'}]);
  assert.deepEqual(missing, ['delivered (1 items, expected 2)', 'cities', 'products[1] (unknown item)']);
});

test('a whole-file list (faqs) reports a length mismatch at the root', () => {
  assert.deepEqual(merge([['Q?', 'A.'], ['Q2?', 'A2.']], [['S?', 'C.']]).missing, ['(root) (1 items, expected 2)']);
  assert.deepEqual(merge([['Q?', 'A.']], null).missing, ['(root)']);
});

test('strict copy overlays report every absent key and array length mismatches', () => {
  const base = {common: {menu: 'Menu', commitments: {wont: ['a', 'b'], will: ['c']}}, home: {title: 'T'}};
  const {missing} = merge(base, {common: {menu: 'Menyu', commitments: {wont: ['ə'], will: ['c'], extra: ['x']}}}, {strict: true});
  assert.deepEqual(missing, ['common.commitments.extra (unknown key)', 'common.commitments.wont (1 items, expected 2)', 'home']);
});

test('shape mismatches keep the base value', () => {
  const {value, missing} = merge({nav: [['A', '/a/']], site: {x: 'X'}}, {nav: 'Nav', site: ['x']});
  assert.deepEqual(value, {nav: [['A', '/a/']], site: {x: 'X'}});
  assert.deepEqual(missing, ['nav (expected a list)', 'site (expected an object)']);
});

test('required keys are declared for every AZ content overlay', () => {
  assert.deepEqual(Object.keys(REQUIRED).sort(), ['articles', 'faqs', 'resources', 'site', 'work']);
});

test('site.js English defaults match the client strings in the English copy', async () => {
  const js = await fs.readFile(new URL('../assets/site.js', import.meta.url), 'utf8');
  const literal = js.match(/const T = (\{[\s\S]*?\});\n/)?.[1];
  assert.ok(literal, 'site.js declares its English defaults as `const T = {…};`');
  const defaults = new Function(`return ${literal}`)();
  const copy = JSON.parse(await fs.readFile(new URL('../content/copy/en.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(defaults).sort(), Object.keys(copy.client).sort());
  assert.deepEqual(defaults, copy.client, 'the defaults are the English strings themselves');
});
