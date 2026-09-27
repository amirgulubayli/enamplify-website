import {esc, button, textLink, pageHead} from '../components.mjs';
import {locales, fill} from '../i18n.mjs';

export const legalKeys = ['privacy', 'cookies', 'terms', 'accessibility'];

/** A section's text is a string, or `{server, email}` when it depends on how enquiries are handled. */
const sectionText = (text, {site, enquiryMode = 'email'}) => fill(typeof text === 'string' ? text : text[enquiryMode === 'server' ? 'server' : 'email'], {email: site.email});

export const legalMeta = (key, ctx) => {
  const p = ctx.copy.legal.pages[key];
  return {title: p.title, description: p.description};
};

export function legal(key, ctx) {
  const p = ctx.copy.legal.pages[key];
  return `${pageHead({title: p.title, lede: p.lede, crumbs: [[p.title]]}, ctx)}<section class="section wrap"><div class="prose prose--legal">${p.sections.map(([h, t]) => `<h2>${esc(h)}</h2><p>${esc(sectionText(t, ctx))}</p>`).join('')}<p class="small">${esc(fill(ctx.copy.legal.lastUpdated, {date: ctx.site.launchDate}))}</p></div></section>`;
}

/**
 * The single, bilingual not-found page. `versions` is one `{locale, copy}` per language to show,
 * the default language first; links point at each language's own pages.
 */
export const notFound = versions => `<section class="section wrap not-found">${versions.map(({locale, copy: {notFound: c}}, i) => {
  const l = locales[locale];
  const inner = `${i === 0 ? `<h1>${esc(c.title)}</h1>` : `<h2>${esc(c.title)}</h2>`}<p class="lede">${esc(c.lede)}</p><div class="actions">${button(c.back, `${l.prefix}/`)}${textLink(c.browse, `${l.prefix}/insights/`)}</div>`;
  return i === 0 ? inner : `<div class="not-found__alt" lang="${l.lang}">${inner}</div>`;
}).join('')}</section>`;
