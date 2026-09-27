import {locales, localePath, fill} from './i18n.mjs';

export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const arrow = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>`;
export const arrowNE = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>`;

export const button = (text, href, variant = 'primary', extra = '') => `<a class="btn btn--${variant}" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;
export const textLink = (text, href, extra = '') => `<a class="link-arrow" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;

// Components receive the render context: `{locale, copy, site, ...}` as returned by loadContent.
const L = (ctx, path) => localePath(ctx.locale, path);

export const breadcrumb = (crumbs, ctx) => `<nav class="crumbs wrap" aria-label="${esc(ctx.copy.common.breadcrumb)}"><ol><li><a href="${L(ctx, '/')}">${esc(ctx.copy.common.home)}</a></li>${crumbs.map(([t, h]) => `<li>${h ? `<a href="${esc(L(ctx, h))}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;

/** Page head: breadcrumb, H1 and lede; with `band`, the page's full-width city photograph follows. */
export const pageHead = ({title, lede = '', crumbs, band = ''}, ctx) => `${breadcrumb(crumbs, ctx)}<header class="page-head page-head--split wrap"><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>${band ? photo(band, ctx, {sizes: '100vw', cls: 'band'}) : ''}`;

export const exhibit = ({n, topic, title, chart, source, note = '', cls = ''}, ctx) => `<figure class="exhibit${cls ? ` ${cls}` : ''}"><figcaption class="exhibit__cap"><span class="exhibit__label">${esc(fill(ctx.copy.common.exhibitLabel, {n, topic}))}</span> <span class="exhibit__title">${esc(title)}</span></figcaption><div class="exhibit__chart">${chart}</div>${note ? `<p class="exhibit__note">${esc(note)}</p>` : ''}<p class="exhibit__source">${esc(fill(ctx.copy.common.exhibitSource, {source}))}</p></figure>`;

export const closeBand = (ctx, {title = ctx.copy.common.closeTitle, body = ctx.copy.common.closeBody} = {}) => `<section class="close" aria-labelledby="close-title"><div class="wrap close__inner"><h2 id="close-title">${esc(title)}</h2><div class="close__body"><p>${esc(body)}</p>${button(ctx.copy.common.bookDiagnostic, L(ctx, '/contact/'), 'inverse')}</div></div></section>`;

export const articleCard = (a, ctx) => `<article class="card"><h3 class="card__title"><a href="${L(ctx, `/insights/${esc(a.slug)}/`)}">${esc(a.title)}</a></h3><p class="card__meta">${esc(a.category)} · ${esc(fill(ctx.copy.common.minRead, {n: a.readingTime}))}</p><p>${esc(a.summary)}</p></article>`;
export const guideCard = (g, ctx) => `<article class="card card--guide"><h3 class="card__title"><a href="${L(ctx, `/insights/guides/${esc(g.slug)}/`)}">${esc(g.name)}</a></h3><p class="card__meta">${esc(ctx.copy.common.fieldGuide)} · ${esc(g.time)}</p><p>${esc(g.description)}</p></article>`;

export const portrait = (ctx, {caption = true, eager = false} = {}) => `<figure class="portrait"><img class="remote-image" src="${esc(ctx.site.portrait)}" alt="${esc(ctx.copy.common.portraitAlt)}" width="304" height="380" loading="${eager ? 'eager' : 'lazy'}" decoding="async">${caption ? `<figcaption>${esc(ctx.copy.common.portraitCaption)}</figcaption>` : ''}</figure>`;

/**
 * A graded city photograph from content/images.json. `id` names the entry in `ctx.images`; the
 * srcset lists every exported width, and width/height come from the largest file. Only first
 * viewport images pass `eager`, which also raises their fetch priority. The caption names the
 * place; photographers are credited once, in the footer colophon (see `photoCredits`).
 */
export function photo(id, ctx, {sizes, eager = false, cls = '', caption = true} = {}) {
  const img = ctx.images?.[id];
  if (!img) throw new Error(`Unknown image: ${id}`);
  if (!sizes) throw new Error(`photo(${id}) needs sizes`);
  const widths = Object.keys(img.files).map(Number).sort((a, b) => a - b);
  if (!widths.length) throw new Error(`Image ${id} has no files`);
  const largest = widths.at(-1);
  const height = Math.round(img.height * largest / img.width);
  const src = img.files[widths.filter(w => w <= 1024).at(-1) ?? widths[0]];
  const srcset = widths.map(w => `${img.files[w]} ${w}w`).join(', ');
  const loc = ctx.locale;
  const alt = img.alt[loc] ?? img.alt.en;
  const place = img.caption[loc] ?? img.caption.en;
  return `<figure class="photo${cls ? ` ${cls}` : ''}"><img src="${esc(src)}" srcset="${esc(srcset)}" sizes="${esc(sizes)}" width="${largest}" height="${height}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>${caption ? `<figcaption>${esc(place)}</figcaption>` : ''}</figure>`;
}

/** Ids of the city photographs a rendered page shows, in order of first appearance. */
export const photosIn = html => [...new Set([...html.matchAll(/\/images\/city\/([a-z0-9-]+?)-\d+\.webp/g)].map(m => m[1]))];

/** "Photography: A, B" with each photographer linked once, for the photos in `ids`. */
export function photoCredits(ctx, ids = []) {
  const people = new Map();
  for (const id of ids) { const credit = ctx.images?.[id]?.credit; if (credit && !people.has(credit.name)) people.set(credit.name, credit.url); }
  if (!people.size) return '';
  const names = [...people].map(([name, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)}</a>`).join(', ');
  return `<p class="colophon">${fill(esc(ctx.copy.common.photographyCredits), {names})}</p>`;
}

function navAttr(path, href) {
  if (path === href) return ' aria-current="page"';
  if (!Object.values(locales).some(l => `${l.prefix}/` === href) && path.startsWith(href)) return ' aria-current="true"';
  return '';
}

/**
 * The EN · AZ switch. `alternates` maps locale code → URL of this page in that locale; the current
 * locale is marked, the others link to their counterpart. With `current` unset (the bilingual 404)
 * every locale is a link.
 */
export function languageToggle(ctx, alternates, current = ctx.locale) {
  const items = Object.values(locales).map(l => {
    const name = `<span class="sr-only"> ${esc(l.name)}</span>`;
    return l.code === current
      ? `<span aria-current="true" lang="${l.lang}">${l.label}${name}</span>`
      : `<a href="${esc(alternates[l.code])}" hreflang="${l.hreflang}" lang="${l.lang}">${l.label}${name}</a>`;
  });
  return `<nav class="lang" aria-label="${esc(ctx.copy.common.language)}">${items.join('<span class="lang__sep" aria-hidden="true">·</span>')}</nav>`;
}

/** Site header. `route` supplies the current URL and its language alternates. */
export function header(ctx, route) {
  const {site, copy: {common: c}} = ctx;
  const path = route.url;
  const toggle = languageToggle(ctx, route.alternates, route.notFound ? null : ctx.locale);
  const nav = site.nav.map(([t, h]) => [t, L(ctx, h)]);
  const contact = L(ctx, '/contact/');
  const links = nav.map(([t, h]) => `<a href="${esc(h)}"${navAttr(path, h)}>${esc(t)}</a>`).join('');
  const bookAttr = navAttr(path, contact);
  return `<a class="skip-link" href="#main">${esc(c.skipLink)}</a><header class="site-header"><div class="wrap site-header__inner"><a class="wordmark" href="${L(ctx, '/')}" aria-label="${esc(c.homeLabel)}">Enamplify</a><nav class="site-nav" aria-label="${esc(c.mainNav)}">${links}</nav>${toggle}<a class="btn btn--quiet site-header__cta" href="${contact}"${bookAttr}>${esc(c.bookCall)}</a><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false"><span class="menu-label">${esc(c.menu)}</span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="${esc(c.mobileNav)}" inert hidden><div class="wrap">${links}<a href="${contact}"${bookAttr}>${esc(c.bookCall)}</a>${toggle}</div></nav></header><noscript><nav class="noscript-nav wrap" aria-label="${esc(c.noscriptNav)}">${links}<a href="${contact}">${esc(c.bookCall)}</a></nav></noscript>`;
}

export function footer(ctx, {photos = []} = {}) {
  const {site, copy: {common: c}} = ctx;
  const legal = ['privacy', 'cookies', 'terms', 'accessibility'].map(k => [c.legalLinks[k], L(ctx, `/${k}/`)]);
  return `<footer class="site-footer"><div class="wrap"><div class="site-footer__top"><div class="site-footer__brand"><a class="wordmark" href="${L(ctx, '/')}">Enamplify</a><p>${esc(site.definition)}</p><p class="site-footer__cities">${site.cities.map(esc).join(' · ')}</p></div><nav aria-label="${esc(c.footerNav)}"><h2>${esc(c.footerPages)}</h2>${[...site.nav, [c.bookCall, '/contact/']].map(([t, h]) => `<a href="${esc(L(ctx, h))}">${esc(t)}</a>`).join('')}</nav><div><h2>${esc(c.footerContact)}</h2><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(c.linkedin)} ${arrowNE}</a><a href="${L(ctx, '/feed.xml')}">${esc(c.feedLink)}</a></div></div><div class="site-footer__bottom"><p>© ${new Date().getFullYear()} Enamplify</p>${photoCredits(ctx, photos)}<nav aria-label="${esc(c.legalNav)}">${legal.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('')}</nav></div></div></footer>`;
}
