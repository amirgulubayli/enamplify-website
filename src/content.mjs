import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMarkdown} from './markdown.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const readJson = async name => JSON.parse(await fs.readFile(path.join(root, 'content', `${name}.json`), 'utf8'));

export async function loadContent() {
  const [site, articles, guides, work, faqs] = await Promise.all(['site', 'articles', 'resources', 'work', 'faqs'].map(readJson));
  for (const item of [...articles, ...guides]) if (!SLUG.test(item.slug)) throw new Error(`Invalid content slug: ${item.slug}`);
  for (const a of articles) {
    const md = await fs.readFile(path.join(root, 'content/articles', `${a.slug}.md`), 'utf8');
    a.html = renderMarkdown(md);
    a.readingTime = Math.max(1, Math.ceil(md.split(/\s+/).length / 220));
  }
  articles.sort((x, y) => y.isoDate.localeCompare(x.isoDate));
  return {site, articles, guides, work, faqs};
}
