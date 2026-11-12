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

export const exhibit = ({n, topic, title, chart, note = '', cls = ''}, ctx) => `<figure class="exhibit${cls ? ` ${cls}` : ''}"><figcaption class="exhibit__cap"><span class="exhibit__label">${esc(fill(ctx.copy.common.exhibitLabel, {n, topic}))}</span> <span class="exhibit__title">${esc(title)}</span></figcaption><div class="exhibit__chart">${chart}</div>${note ? `<p class="exhibit__note">${esc(note)}</p>` : ''}</figure>`;

/**
 * The two main actions lead to the existing enquiry form, with the offering preselected when scripts
 * run (the values match INTEREST_VALUES in pages/contact.mjs). Without scripts the form says which to choose.
 */
export const ME_ENQUIRY = '/contact/?interest=Enamplify%20Me#enquiry';
export const US_ENQUIRY = '/contact/?interest=Enamplify%20for%20a%20team#enquiry';

/** The reciprocal line under a main action: Us invites individuals to Me, Me invites teams to Us. */
export const crossLink = (text, href) => `<p class="cross"><a href="${esc(href)}">${esc(text)}${arrow}</a></p>`;

/**
 * The Us · Me switch: native links to the two landing pages in the reader's language. `current` is
 * the offering this page belongs to ('us' or 'me'); `isPage` marks the link as the current page.
 */
export function audienceToggle(ctx, current = 'us', {isPage = false, cls = '', hrefs = ['/', '/me/']} = {}) {
  const c = ctx.copy.common;
  const item = (key, label, hint, href) => `<a href="${esc(L(ctx, href))}"${key === current ? ` class="is-on"${isPage ? ' aria-current="page"' : ''}` : ''}>${esc(label)}<span class="sr-only">, ${esc(hint)}</span></a>`;
  return `<nav class="audience${cls ? ` ${cls}` : ''}" aria-label="${esc(c.audienceNav)}">${item('us', c.us, c.usHint, hrefs[0])}${item('me', c.me, c.meHint, hrefs[1])}</nav>`;
}

export const closeBand = (ctx, {title = ctx.copy.common.closeTitle, body = ctx.copy.common.closeBody, action = [ctx.copy.common.bookDiagnostic, '/contact/'], cross} = {}) => `<section class="close" aria-labelledby="close-title"><div class="wrap close__inner"><h2 id="close-title">${esc(title)}</h2><div class="close__body"><p>${esc(body)}</p>${button(action[0], L(ctx, action[1]), 'inverse')}${cross ? crossLink(cross[0], L(ctx, cross[1])) : ''}</div></div></section>`;

export const articleCard = (a, ctx) => `<article class="card"><h3 class="card__title"><a href="${L(ctx, `/insights/${esc(a.slug)}/`)}">${esc(a.title)}</a></h3><p class="card__meta">${esc(a.category)} · ${esc(fill(ctx.copy.common.minRead, {n: a.readingTime}))}</p><p>${esc(a.summary)}</p></article>`;
export const guideCard = (g, ctx) => `<article class="card card--guide"><h3 class="card__title"><a href="${L(ctx, `/insights/guides/${esc(g.slug)}/`)}">${esc(g.name)}</a></h3><p class="card__meta">${esc(ctx.copy.common.fieldGuide)} · ${esc(g.time)}</p><p>${esc(g.description)}</p></article>`;

export const portrait = (ctx, {caption = true, eager = false} = {}) => `<figure class="portrait"><img class="remote-image" src="${esc(ctx.site.portrait)}" alt="${esc(ctx.copy.common.portraitAlt)}" width="320" height="400" loading="${eager ? 'eager' : 'lazy'}" decoding="async">${caption ? `<figcaption>${esc(ctx.copy.common.portraitCaption)}</figcaption>` : ''}</figure>`;

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
  // On Me the header action is Me's own; everywhere else it is the conversation about a team.
  const isMe = route.key === 'me';
  const contact = isMe ? L(ctx, ME_ENQUIRY) : L(ctx, '/contact/');
  const ctaText = isMe ? c.meCta : c.bookCall;
  const links = nav.map(([t, h]) => `<a href="${esc(h)}"${navAttr(path, h)}>${esc(t)}</a>`).join('');
  const bookAttr = navAttr(path, contact);
  const audience = audienceToggle(ctx, isMe ? 'me' : 'us', {isPage: isMe || route.key === 'home'});
  return `<a class="skip-link" href="#main">${esc(c.skipLink)}</a><header class="site-header"><div class="wrap site-header__inner"><a class="wordmark" href="${L(ctx, '/')}" aria-label="${esc(c.homeLabel)}">Enamplify</a>${audience}<nav class="site-nav" aria-label="${esc(c.mainNav)}">${links}</nav>${toggle}<a class="btn btn--quiet site-header__cta" href="${esc(contact)}"${bookAttr}>${esc(ctaText)}</a><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false"><span class="menu-label">${esc(c.menu)}</span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="${esc(c.mobileNav)}" inert hidden><div class="wrap">${audience}${links}<a href="${esc(contact)}"${bookAttr}>${esc(ctaText)}</a>${toggle}</div></nav></header><noscript><nav class="noscript-nav wrap" aria-label="${esc(c.noscriptNav)}">${links}<a href="${esc(contact)}">${esc(ctaText)}</a></nav></noscript>`;
}

export function footer(ctx, {photos = []} = {}) {
  const {site, copy: {common: c}} = ctx;
  const legal = ['privacy', 'cookies', 'terms', 'accessibility'].map(k => [c.legalLinks[k], L(ctx, `/${k}/`)]);
  return `<footer class="site-footer"><div class="wrap"><div class="site-footer__top"><div class="site-footer__brand"><a class="wordmark" href="${L(ctx, '/')}">Enamplify</a><p>${esc(site.definition)}</p><p class="site-footer__cities">${site.cities.map(esc).join(' · ')}</p></div><nav aria-label="${esc(c.footerNav)}"><h2>${esc(c.footerPages)}</h2>${[[c.teamsLink, '/'], [c.meLink, '/me/'], ...site.nav, [c.careersLink, '/careers/'], [c.bookCall, '/contact/']].map(([t, h]) => `<a href="${esc(L(ctx, h))}">${esc(t)}</a>`).join('')}</nav><div><h2>${esc(c.footerContact)}</h2><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer">${esc(c.linkedin)} ${arrowNE}</a><a href="${L(ctx, '/feed.xml')}">${esc(c.feedLink)}</a></div></div><div class="site-footer__bottom"><p>© ${new Date().getFullYear()} Enamplify</p>${photoCredits(ctx, photos)}<nav aria-label="${esc(c.legalNav)}">${legal.map(([t, h]) => `<a href="${esc(h)}">${esc(t)}</a>`).join('')}</nav></div></div></footer>`;
}

/**
 * Editorial conversion popup + floating launcher for the unlisted executive briefing on structuring
 * AI and agent work inside a company. Rendered outside <main> on visitor content pages.
 */
export function briefingGate(ctx, route) {
  const p = ctx.copy?.popup;
  if (!p || !route?.key || route.notFound || route.contact || ['briefing', 'portfolio', 'careers', 'discover'].includes(route.key) || route.key.startsWith('legal:')) return '';
  const targetUrl = L(ctx, '/briefing/');
  return `<aside class="briefing-gate" aria-label="${esc(p.ariaLabel)}" data-briefing-gate data-briefing-url="${esc(targetUrl)}"><button class="briefing-pill" type="button" data-briefing-open aria-expanded="false" aria-controls="briefing-dialog" hidden><span class="briefing-pill__tag">${esc(p.pillTag)}</span><span class="briefing-pill__text">${esc(p.pillText)}</span></button><div id="briefing-dialog" class="briefing-popup" role="dialog" aria-modal="false" aria-labelledby="briefing-popup-title" hidden><div class="briefing-popup__head"><p class="briefing-popup__kicker">${esc(p.kicker)}</p><button class="briefing-popup__close" type="button" data-briefing-close aria-label="${esc(ctx.copy.client.close)}">×</button></div><h2 id="briefing-popup-title" class="briefing-popup__title">${esc(p.title)}</h2><ul class="ticks briefing-popup__ticks">${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul><form class="briefing-popup__form" action="${esc(targetUrl)}" method="get" data-briefing-form novalidate><div class="briefing-popup__row"><label for="briefing-email"><span class="sr-only">${esc(p.emailLabel)}</span><input id="briefing-email" name="email" type="email" autocomplete="email" placeholder="${esc(p.emailPlaceholder)}" required maxlength="254"></label><button class="btn btn--primary" type="submit">${esc(p.submit)}${arrow}</button></div><div class="hp-field" aria-hidden="true"><label for="briefing-website">${esc(ctx.copy.contact.honeypot)}<input id="briefing-website" name="website" tabindex="-1" autocomplete="off"></label></div><p class="briefing-popup__err" data-briefing-error role="alert" hidden></p></form></div></aside>`;
}

/** Inline Kit newsletter and unlisted executive briefing signup band. */
export function kitBand(ctx, idPrefix = 'kit') {
  const k = ctx.copy?.homeNew?.kit, p = ctx.copy?.popup;
  if (!k || !p) return '';
  const targetUrl = L(ctx, '/briefing/');
  return `<section class="section wrap kit-band" aria-labelledby="${esc(idPrefix)}-title"><div class="kit-band__box"><div class="kit-band__copy"><h2 id="${esc(idPrefix)}-title">${esc(k.title)}</h2></div><form class="kit-band__form" action="${esc(targetUrl)}" method="get" data-briefing-form novalidate><div class="briefing-popup__row"><label for="${esc(idPrefix)}-email"><span class="sr-only">${esc(p.emailLabel)}</span><input id="${esc(idPrefix)}-email" name="email" type="email" autocomplete="email" placeholder="${esc(k.emailPlaceholder)}" required maxlength="254"></label><button class="btn btn--primary" type="submit">${esc(k.submit)}${arrow}</button></div><div class="hp-field" aria-hidden="true"><label for="${esc(idPrefix)}-website">${esc(ctx.copy.contact.honeypot)}<input id="${esc(idPrefix)}-website" name="website" tabindex="-1" autocomplete="off"></label></div><p class="briefing-popup__err" data-briefing-error role="alert" hidden></p></form></div></section>`;
}
