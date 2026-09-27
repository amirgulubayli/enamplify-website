import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMarkdown} from './markdown.mjs';
import {locales, defaultLocale, localePath, basePath} from './i18n.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTENT = ['site', 'articles', 'resources', 'work', 'faqs'];

const readJson = async rel => JSON.parse(await fs.readFile(path.join(root, 'content', rel), 'utf8'));
const readOptional = async (rel, read) => { try { return await read(rel); } catch (e) { if (e.code === 'ENOENT') return undefined; throw e; } };
const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

/** The translatable keys each AZ content overlay must supply (per item for the slugged lists). */
export const REQUIRED = {
  site: ['description', 'definition', 'nav', 'cities'],
  work: ['delivered', 'products'],
  faqs: [],
  articles: ['title', 'summary', 'category', 'date'],
  resources: ['name', 'short', 'description', 'time', 'audience', 'intro', 'fields', 'checks', 'closing']
};

/**
 * Overlay translated values onto base content; the result always has the base's shape.
 * - Objects merge key by key. Keys the base lacks are ignored and reported as unknown (typos).
 * - Arrays of objects merge item by item: by `slug` when every base item has one, else by position.
 *   Items the base lacks are reported as unknown.
 * - Any other array (strings, pairs) is replaced whole; a different length is reported.
 * - `null` counts as absent. Absent values keep the base value; absent array items are always
 *   reported, absent keys when `strict` (every key, as in the copy dictionaries) or listed in
 *   `required` (checked on the root object, or on each item when the root is a list).
 * Reports go to `missing` as `path`, `path (unknown key)`, `path (unknown item)`,
 * `path (N items, expected M)` or `path (expected …)`.
 */
export function overlay(base, over, missing = [], {strict = false, required = []} = {}, at = '') {
  const here = at || '(root)';
  if (over === undefined || over === null) { missing.push(here); return base; }
  if (isObject(base)) {
    if (!isObject(over)) { missing.push(`${here} (expected an object)`); return base; }
    const join = k => (at ? `${at}.${k}` : k);
    for (const k of Object.keys(over)) if (!(k in base)) missing.push(`${join(k)} (unknown key)`);
    return Object.fromEntries(Object.keys(base).map(k => {
      if (over[k] !== undefined && over[k] !== null) return [k, overlay(base[k], over[k], missing, {strict}, join(k))];
      if (strict || required.includes(k)) missing.push(join(k));
      return [k, base[k]];
    }));
  }
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) { missing.push(`${here} (expected a list)`); return base; }
    if (base.some(isObject)) {
      const bySlug = base.every(b => isObject(b) && b.slug);
      const extras = bySlug ? over.filter(o => !base.some(b => b.slug === o?.slug)).map(o => o?.slug) : over.slice(base.length).map((_, i) => base.length + i);
      for (const x of extras) missing.push(`${at}[${x}] (unknown item)`);
      return base.map((b, i) => overlay(b, bySlug ? over.find(o => o?.slug === b.slug) : over[i], missing, {strict, required}, `${at}[${bySlug ? b.slug : i}]`));
    }
    if (over.length !== base.length) missing.push(`${here} (${over.length} items, expected ${base.length})`);
    return over;
  }
  return over;
}

/**
 * Load everything a locale renders from. For locales other than English, `content/<code>/*.json`
 * overlays and `content/articles/<code>/<slug>.md` essays are used where present; anything absent
 * falls back to English and is listed in `missing`.
 */
export async function loadContent(localeCode = defaultLocale) {
  if (!locales[localeCode]) throw new Error(`Unknown locale: ${localeCode}`);
  const isDefault = localeCode === defaultLocale;
  const missing = [];
  const baseContent = await Promise.all(CONTENT.map(name => readJson(`${name}.json`)));
  const localised = isDefault ? baseContent : await Promise.all(CONTENT.map(async (name, i) => {
    const rel = `${localeCode}/${name}.json`;
    const over = await readOptional(rel, readJson);
    if (over === undefined) { missing.push(`content/${rel}`); return baseContent[i]; }
    const gaps = [];
    const merged = overlay(baseContent[i], over, gaps, {required: REQUIRED[name]});
    missing.push(...gaps.map(g => `content/${rel}#${g}`));
    return merged;
  }));
  const [localSite, articles, guides, work, faqs] = localised;
  // Nav hrefs always come from the base site.json; an overlay only supplies the labels, so a
  // translator writing `/az/…` hrefs can never double-prefix or break a link.
  const site = {...localSite, nav: baseContent[0].nav.map(([label, href], i) => [localSite.nav[i]?.[0] ?? label, href])};

  const enCopy = await readJson(`copy/${defaultLocale}.json`);
  let copy = enCopy;
  if (!isDefault) {
    const rel = `copy/${localeCode}.json`;
    const over = await readOptional(rel, readJson);
    if (over === undefined) missing.push(`content/${rel}`);
    else { const gaps = []; copy = overlay(enCopy, over, gaps, {strict: true}); missing.push(...gaps.map(g => `content/${rel}#${g}`)); }
  }

  for (const item of [...articles, ...guides]) if (!SLUG.test(item.slug)) throw new Error(`Invalid content slug: ${item.slug}`);
  for (const a of articles) {
    const own = isDefault ? undefined : await readOptional(`articles/${localeCode}/${a.slug}.md`, rel => fs.readFile(path.join(root, 'content', rel), 'utf8'));
    if (!isDefault && own === undefined) missing.push(`content/articles/${localeCode}/${a.slug}.md`);
    const md = own ?? await fs.readFile(path.join(root, 'content/articles', `${a.slug}.md`), 'utf8');
    // Internal links stay inside the reader's language, whether the essay links `/x/` or `/az/x/`.
    a.html = isDefault ? renderMarkdown(md) : renderMarkdown(md).replace(/href="(\/[^"]*)"/g, (_, href) => `href="${localePath(localeCode, basePath(href))}"`);
    a.readingTime = Math.max(1, Math.ceil(md.split(/\s+/).length / 220));
  }
  articles.sort((x, y) => y.isoDate.localeCompare(x.isoDate));
  // City photography: files, alt text and captions for every locale live together in one manifest.
  const images = await readJson('images.json');
  return {locale: localeCode, site, articles, guides, work, faqs, copy, images, missing, href: p => localePath(localeCode, p)};
}
