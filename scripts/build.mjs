import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {loadContent, root} from '../src/content.mjs';
import {routeTable} from '../src/routes.mjs';
import {renderDocument} from '../src/seo.mjs';
import {esc} from '../src/components.mjs';
import {locales, localeCodes, defaultLocale, localePath} from '../src/i18n.mjs';

export {root};
const out = path.join(root, 'dist');
const xml = t => esc(t).replace(/&#39;/g, '&apos;');

export async function build() {
  try { process.loadEnvFile(path.join(root, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.mkdir(path.join(root, 'qa'), {recursive: true});

  const contexts = Object.fromEntries(await Promise.all(localeCodes.map(async code => [code, await loadContent(code)])));
  const {site} = contexts[defaultLocale];
  const supplied = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const normalised = /^https?:\/\//i.test(supplied) ? supplied : `https://${supplied}`;
  let base;
  try { base = new URL(normalised).origin; } catch { throw new Error(`SITE_URL is not a valid URL: ${supplied}`); }
  const isLive = (process.env.VERCEL_ENV === 'production' || process.env.INDEX_SITE === 'true') && !base.includes('localhost');
  const env = process.env;
  const enquiryMode = env.ENQUIRY_MODE === 'server' && env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO && env.CONTACT_ALLOWED_ORIGIN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY ? 'server' : 'email';

  for (const ctx of Object.values(contexts)) ctx.enquiryMode = enquiryMode;
  // The 404 shows every other language whose copy dictionary exists (not an English fallback).
  const others = localeCodes.filter(c => c !== defaultLocale).map(c => contexts[c]);
  const notFoundAlso = others.filter(ctx => !ctx.missing.includes(`content/copy/${ctx.locale}.json`));
  const routes = localeCodes.flatMap(code => routeTable(contexts[code], {notFoundAlso}));
  const missing = others.flatMap(ctx => ctx.missing);

  await fs.rm(out, {recursive: true, force: true});
  await fs.mkdir(path.join(out, 'assets'), {recursive: true});
  await fs.cp(path.join(root, 'public'), out, {recursive: true});
  const css = await fs.readFile(path.join(root, 'assets/styles.css'), 'utf8');
  const js = await fs.readFile(path.join(root, 'assets/site.js'), 'utf8');
  const hash = v => createHash('sha256').update(v).digest('hex').slice(0, 10);
  const cssName = `styles.${hash(css)}.css`, jsName = `site.${hash(js)}.js`;
  await fs.writeFile(path.join(out, 'assets', cssName), css);
  await fs.writeFile(path.join(out, 'assets', jsName), js);

  for (const r of routes) {
    const {site, copy} = contexts[r.locale];
    const html = renderDocument({base, site, copy, route: r, cssName, jsName, indexable: isLive && r.index !== false, turnstileKey: enquiryMode === 'server' ? env.TURNSTILE_SITE_KEY : ''});
    const dest = path.join(out, r.url, 'index.html');
    await fs.mkdir(path.dirname(dest), {recursive: true});
    await fs.writeFile(dest, html);
    if (r.notFound) await fs.writeFile(path.join(out, '404.html'), html);
  }

  const indexable = routes.filter(r => r.index !== false);
  const lastmod = r => r.article?.isoDate || site.launchDate;
  const hreflang = r => [...Object.values(locales).map(l => [l.hreflang, r.alternates[l.code]]), ['x-default', r.alternates[defaultLocale]]]
    .map(([lang, url]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${xml(base + url)}"/>`).join('');
  await fs.writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${indexable.map(r => `<url><loc>${xml(base + r.url)}</loc><lastmod>${lastmod(r)}</lastmod>${hreflang(r)}</url>`).join('')}</urlset>`);
  await fs.writeFile(path.join(out, 'robots.txt'), isLive ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');

  // One feed per locale: /feed.xml and /az/feed.xml.
  for (const {locale, copy, articles} of Object.values(contexts)) {
    const L = p => localePath(locale, p);
    const feed = path.join(out, L('/feed.xml'));
    await fs.mkdir(path.dirname(feed), {recursive: true});
    await fs.writeFile(feed, `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xml(copy.common.feedTitle)}</title><link>${xml(base)}${L('/insights/')}</link><description>${xml(copy.common.feedDescription)}</description><language>${locales[locale].lang.toLowerCase()}</language><atom:link href="${xml(base)}${L('/feed.xml')}" rel="self" type="application/rss+xml"/>${articles.map(a => `<item><title>${xml(a.title)}</title><link>${xml(base)}${L(`/insights/${a.slug}/`)}</link><guid>${xml(base)}${L(`/insights/${a.slug}/`)}</guid><description>${xml(a.summary)}</description><pubDate>${new Date(a.isoDate).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
  }

  const section = (heading, list) => `## ${heading}\n\n${list.map(r => `- [${r.home ? r.title : r.title.replace(/\.$/, '')}](${base}${r.url}): ${r.description}`).join('\n')}\n`;
  const inLocale = code => indexable.filter(r => r.locale === code);
  const isLegal = r => r.key.startsWith('legal:');
  const isGuide = r => r.key.startsWith('guide:');
  const en = inLocale(defaultLocale);
  const otherSections = localeCodes.filter(c => c !== defaultLocale).map(c => `\n${section(locales[c].name, inLocale(c).filter(r => !isLegal(r)))}`).join('');
  await fs.writeFile(path.join(out, 'llms.txt'), `# ${site.name}\n\n> ${site.definition}\n\n${section('Pages', en.filter(r => !r.article && !isGuide(r) && !isLegal(r)))}\n${section('Insights', en.filter(r => r.article))}\n${section('Field guides', en.filter(isGuide))}${otherSections}\n## Contact\n\n- Book a call: ${site.bookingUrl}\n- Email: ${site.email}\n`);

  await fs.writeFile(path.join(root, 'qa/routes.json'), JSON.stringify(routes.map(({url, key, locale, alternates, title, description, index}) => ({url, key, locale, alternates, title, description, index: index !== false})), null, 2));
  await fs.writeFile(path.join(root, 'qa/build.json'), JSON.stringify({pages: routes.length, locales: localeCodes, missing, base, indexing: isLive, enquiryMode, cssBytes: Buffer.byteLength(css), jsBytes: Buffer.byteLength(js), fontsSelfHosted: true}, null, 2));
  console.log(`Built ${routes.length} pages. Enquiries: ${enquiryMode}. Indexing: ${isLive}. Base: ${base}`);
  if (missing.length) console.log(`Translation fallbacks (English used): ${missing.length}. See qa/build.json.`);
  return {routes, base, enquiryMode, missing};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build().catch(e => { console.error(e); process.exitCode = 1; });
