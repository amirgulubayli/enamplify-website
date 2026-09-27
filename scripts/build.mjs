import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {loadContent, root} from '../src/content.mjs';
import {routeTable} from '../src/routes.mjs';
import {renderDocument} from '../src/seo.mjs';
import {esc} from '../src/components.mjs';

export {root};
const out = path.join(root, 'dist');
const xml = t => esc(t).replace(/&#39;/g, '&apos;');

export async function build() {
  try { process.loadEnvFile(path.join(root, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  await fs.mkdir(path.join(root, 'qa'), {recursive: true});

  const content = await loadContent();
  const {site, articles} = content;
  const supplied = process.env.SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const normalised = /^https?:\/\//i.test(supplied) ? supplied : `https://${supplied}`;
  let base;
  try { base = new URL(normalised).origin; } catch { throw new Error(`SITE_URL is not a valid URL: ${supplied}`); }
  const isLive = (process.env.VERCEL_ENV === 'production' || process.env.INDEX_SITE === 'true') && !base.includes('localhost');
  const env = process.env;
  const enquiryMode = env.ENQUIRY_MODE === 'server' && env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO && env.CONTACT_ALLOWED_ORIGIN && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY ? 'server' : 'email';

  const routes = routeTable({...content, enquiryMode});

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
    const html = renderDocument({base, site, route: r, cssName, jsName, indexable: isLive && r.index !== false, turnstileKey: enquiryMode === 'server' ? env.TURNSTILE_SITE_KEY : ''});
    const dest = path.join(out, r.url, 'index.html');
    await fs.mkdir(path.dirname(dest), {recursive: true});
    await fs.writeFile(dest, html);
    if (r.notFound) await fs.writeFile(path.join(out, '404.html'), html);
  }

  const indexable = routes.filter(r => r.index !== false);
  const lastmod = r => r.article?.isoDate || site.launchDate;
  await fs.writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable.map(r => `<url><loc>${xml(base + r.url)}</loc><lastmod>${lastmod(r)}</lastmod></url>`).join('')}</urlset>`);
  await fs.writeFile(path.join(out, 'robots.txt'), isLive ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${base}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  await fs.writeFile(path.join(out, 'feed.xml'), `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Enamplify Insights</title><link>${xml(base)}/insights/</link><description>Practical thinking on AI adoption for operations leaders.</description><language>en-gb</language><atom:link href="${xml(base)}/feed.xml" rel="self" type="application/rss+xml"/>${articles.map(a => `<item><title>${xml(a.title)}</title><link>${xml(base)}/insights/${a.slug}/</link><guid>${xml(base)}/insights/${a.slug}/</guid><description>${xml(a.summary)}</description><pubDate>${new Date(a.isoDate).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`);
  const section = (heading, list) => `## ${heading}\n\n${list.map(r => `- [${r.home ? r.title : r.title.replace(/\.$/, '')}](${base}${r.url}): ${r.description}`).join('\n')}\n`;
  await fs.writeFile(path.join(out, 'llms.txt'), `# ${site.name}\n\n> ${site.definition}\n\n${section('Pages', indexable.filter(r => !r.article && !r.url.startsWith('/insights/guides/') && !['/privacy/', '/cookies/', '/terms/', '/accessibility/'].includes(r.url)))}\n${section('Insights', indexable.filter(r => r.article))}\n${section('Field guides', indexable.filter(r => r.url.startsWith('/insights/guides/')))}\n## Contact\n\n- Book a call: ${site.bookingUrl}\n- Email: ${site.email}\n`);

  await fs.writeFile(path.join(root, 'qa/routes.json'), JSON.stringify(routes.map(({url, title, description, index}) => ({url, title, description, index: index !== false})), null, 2));
  await fs.writeFile(path.join(root, 'qa/build.json'), JSON.stringify({pages: routes.length, base, indexing: isLive, enquiryMode, cssBytes: Buffer.byteLength(css), jsBytes: Buffer.byteLength(js), fontsSelfHosted: true}, null, 2));
  console.log(`Built ${routes.length} pages. Enquiries: ${enquiryMode}. Indexing: ${isLive}. Base: ${base}`);
  return {routes, base, enquiryMode};
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) build().catch(e => { console.error(e); process.exitCode = 1; });
