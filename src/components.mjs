import {locales, localePath, fill} from './i18n.mjs';

export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const arrow = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>`;
export const arrowNE = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>`;

export const button = (text, href, variant = 'primary', extra = '') => `<a class="btn btn--${variant}" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;
export const textLink = (text, href, extra = '') => `<a class="link-arrow" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;

// Components receive the render context: `{locale, copy, site, ...}` as returned by loadContent.
const L = (ctx, path) => localePath(ctx.locale, path);

export const breadcrumb = (crumbs, ctx) => `<nav class="crumbs wrap" aria-label="${esc(ctx.copy.common.breadcrumb)}"><ol><li><a href="${L(ctx, '/')}">${esc(ctx.copy.common.home)}</a></li>${crumbs.map(([t, h]) => `<li>${h ? `<a href="${esc(L(ctx, h))}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;

export const pageHead = ({title, lede = '', crumbs}, ctx) => `${breadcrumb(crumbs, ctx)}<header class="page-head wrap"><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>`;

export const exhibit = ({n, topic, title, chart, source, note = '', cls = ''}, ctx) => `<figure class="exhibit${cls ? ` ${cls}` : ''}"><figcaption class="exhibit__cap"><span class="exhibit__label">${esc(fill(ctx.copy.common.exhibitLabel, {n, topic}))}</span> <span class="exhibit__title">${esc(title)}</span></figcaption><div class="exhibit__chart">${chart}</div>${note ? `<p class="exhibit__note">${esc(note)}</p>` : ''}<p class="exhibit__source">${esc(fill(ctx.copy.common.exhibitSource, {source}))}</p></figure>`;

export const closeBand = (ctx, {title = ctx.copy.common.closeTitle, body = ctx.copy.common.closeBody} = {}) => `<section class="close" aria-labelledby="close-title"><div class="wrap close__inner"><h2 id="close-title">${esc(title)}</h2><div class="close__body"><p>${esc(body)}</p>${button(ctx.copy.common.bookDiagnostic, L(ctx, '/contact/'), 'inverse')}</div></div></section>`;

export const articleCard = (a, ctx) => `<article class="card"><h3 class="card__title"><a href="${L(ctx, `/insights/${esc(a.slug)}/`)}">${esc(a.title)}</a></h3><p class="card__meta">${esc(a.category)} · ${esc(fill(ctx.copy.common.minRead, {n: a.readingTime}))}</p><p>${esc(a.summary)}</p></article>`;
export const guideCard = (g, ctx) => `<article class="card card--guide"><h3 class="card__title"><a href="${L(ctx, `/insights/guides/${esc(g.slug)}/`)}">${esc(g.name)}</a></h3><p class="card__meta">${esc(ctx.copy.common.fieldGuide)} · ${esc(g.time)}</p><p>${esc(g.description)}</p></article>`;

export const portrait = (ctx, {caption = true, eager = false} = {}) => `<figure class="portrait"><img class="remote-image" src="${esc(ctx.site.portrait)}" alt="${esc(ctx.copy.common.portraitAlt)}" width="304" height="380" loading="${eager ? 'eager' : 'lazy'}" decoding="async">${caption ? `<figcaption>${esc(ctx.copy.common.portraitCaption)}</figcaption>` : ''}</figure>`;

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

export function footer(ctx) {
  const {site, copy: {common: c}} = ctx;
  const legal = ['privacy', 'cookies', 'terms', 'accessibility'].map(k => [c.legalLinks[k], L(ctx, `/${k}/`)]);
  return `<footer class="site-footer"><div class="wrap"><div class="site-footer__top"><div class="site-footer__brand"><a class="wordmark" href="${L(ctx, '/')}">Enamplify</a><p>${esc(site.definition)}</p><p class="site-footer__cities">${site.cities.map(esc).join(' · ')}</p></div><nav aria-label="${esc(c.footerNav)}"><h2>${esc(c.footerPages)}</h2>${[...site.nav, [c.bookCall, '/contact/']].map(([t, h]) => `<a href="${esc(L(ctx, h))}">${esc(t)}</a>`).join('')}</nav><div><h2>${esc(c.footerContact)}</h2><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(c.linkedin)} ${arrowNE}</a><a href="${L(ctx, '/feed.xml')}">${esc(c.feedLink)}</a></div></div><div class="site-footer__bottom"><p>© ${new Date().getFullYear()} Enamplify</p><nav aria-label="${esc(c.legalNav)}">${legal.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('')}</nav></div></div></footer>`;
}
