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

/**
 * Overlay translated values onto base content. Objects merge key by key; arrays of objects merge
 * item by item (matched by `slug` when the items have one, otherwise by position); any other value,
 * including arrays of strings or pairs, is replaced whole. Anything absent keeps its base value.
 * Absent array items are recorded in `missing`; with `strict` (the copy dictionaries, where every
 * value is translatable) absent object keys are recorded too.
 */
export function overlay(base, over, missing = [], {strict = false} = {}, at = '') {
  if (over === undefined) { missing.push(at); return base; }
  if (isObject(base) && isObject(over)) {
    return Object.fromEntries(Object.keys({...base, ...over}).map(k => {
      const where = at ? `${at}.${k}` : k;
      if (k in over) return [k, overlay(base[k], over[k], missing, {strict}, where)];
      if (strict) missing.push(where);
      return [k, base[k]];
    }));
  }
  if (Array.isArray(base) && Array.isArray(over) && base.some(isObject)) {
    const bySlug = base.every(b => isObject(b) && b.slug);
    return base.map((b, i) => {
      const o = bySlug ? over.find(x => x?.slug === b.slug) : over[i];
      return overlay(b, o, missing, {strict}, `${at}[${bySlug ? b.slug : i}]`);
    });
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
    const merged = overlay(baseContent[i], over, gaps);
    missing.push(...gaps.map(g => `content/${rel}#${g}`));
    return merged;
  }));
  const [site, articles, guides, work, faqs] = localised;

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
  return {locale: localeCode, site, articles, guides, work, faqs, copy, missing, href: p => localePath(localeCode, p)};
}
