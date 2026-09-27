import {esc, header, footer, photosIn} from './components.mjs';
import {locales, defaultLocale, localePath, basePath, alternatesFor} from './i18n.mjs';

export const titleFor = (route, site) => route.home ? route.title : `${route.title.replace(/\.$/, '')} | ${site.name}`;

const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c');
const localeOf = route => locales[route.locale] || locales[defaultLocale];

export function jsonLd({base, site, route, copy}) {
  const canonical = base + route.url;
  const lang = localeOf(route).lang;
  const home = copy?.common.home ?? 'Home';
  const graph = [
    {'@type': 'ProfessionalService', '@id': `${base}/#practice`, name: site.name, url: `${base}/`, description: site.definition, email: site.email, logo: `${base}/favicon.svg`, image: `${base}/images/social-card.png`, founder: {'@id': `${base}/#founder`},
      areaServed: [{'@type': 'City', name: 'London'}, {'@type': 'City', name: 'Baku'}, {'@type': 'Country', name: 'United Kingdom'}, {'@type': 'Country', name: 'Azerbaijan'}],
      knowsAbout: ['AI enablement', 'AI training for teams', 'AI governance', 'Workflow automation'], sameAs: [site.linkedin]},
    {'@type': 'Person', '@id': `${base}/#founder`, name: site.founder, jobTitle: 'Founder', worksFor: {'@id': `${base}/#practice`}, sameAs: [site.linkedin]},
    {'@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.name, inLanguage: Object.values(locales).map(l => l.lang), publisher: {'@id': `${base}/#practice`}}
  ];
  if (!route.notFound) graph.push({'@type': 'WebPage', '@id': canonical, url: canonical, name: route.title, inLanguage: lang, isPartOf: {'@id': `${base}/#website`}});
  if (route.crumbs) graph.push({'@type': 'BreadcrumbList', itemListElement: [[home, '/'], ...route.crumbs].map(([name, url], i) => ({'@type': 'ListItem', position: i + 1, name, item: base + (url ? localePath(route.locale, url) : route.url)}))});
  if (route.faqs) graph.push({'@type': 'FAQPage', inLanguage: lang, mainEntity: route.faqs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
  if (route.article) {
    const a = route.article;
    graph.push({'@type': 'Article', headline: a.title, description: a.summary, datePublished: a.isoDate, dateModified: a.isoDate, author: {'@id': `${base}/#founder`}, publisher: {'@id': `${base}/#practice`}, mainEntityOfPage: canonical, image: `${base}/images/social-card.png`, inLanguage: lang});
  }
  return safeJson({'@context': 'https://schema.org', '@graph': graph});
}

/** hreflang alternates for every locale plus x-default (the default locale's URL). */
const alternateLinks = (base, route) => {
  if (route.notFound || !route.alternates) return '';
  const links = Object.values(locales).map(l => `<link rel="alternate" hreflang="${l.hreflang}" href="${esc(base + route.alternates[l.code])}">`);
  return links.join('') + `<link rel="alternate" hreflang="x-default" href="${esc(base + route.alternates[defaultLocale])}">`;
};

export function renderDocument({base, site, route: given, copy, images = {}, cssName, jsName, indexable, turnstileKey = ''}) {
  const route = given.alternates ? given : {...given, alternates: alternatesFor(given.notFound ? '/' : basePath(given.url))};
  const title = titleFor(route, site);
  const canonical = base + route.url;
  const loc = localeOf(route);
  const c = copy.common;
  let body = route.html;
  let turnstile = '';
  if (route.contact && turnstileKey) {
    if (!body.includes('<div id="form-errors"')) throw new Error('Contact page is missing the form-errors anchor for Turnstile');
    turnstile = '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>';
    body = body.replace('<div id="form-errors"', `<div class="cf-turnstile" data-sitekey="${esc(turnstileKey)}" data-theme="light" data-action="enquiry"></div><div id="form-errors"`);
  }
  const ctx = {locale: loc.code, site, copy, images};
  // Faces are font-display: optional, so anything the first viewport sets must be preloaded or it
  // falls back for that visit: the latin text faces everywhere, the italic for the home H1, and on
  // Azerbaijani pages the latin-ext subsets (ə, ğ, ı, İ, ş).
  const home = route.key === 'home';
  const subsets = loc.code === defaultLocale ? ['latin'] : ['latin', 'latin-ext'];
  const faces = ['libre-caslon-display-400', 'dm-sans-var', ...(home ? ['libre-caslon-text-400italic'] : [])];
  const fonts = subsets.flatMap(sub => faces.map(face => `${face}-${sub}`)).map(f => `<link rel="preload" href="/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join('');
  const ogAlternates = Object.values(locales).filter(l => l !== loc).map(l => `<meta property="og:locale:alternate" content="${l.ogLocale}">`).join('');
  return `<!doctype html>
<html lang="${loc.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#FFFFFF"><title>${esc(title)}</title><meta name="description" content="${esc(route.description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">${route.notFound ? '' : `<link rel="canonical" href="${esc(canonical)}">`}${alternateLinks(base, route)}${fonts}<link rel="stylesheet" href="/assets/${cssName}"><script src="/assets/${jsName}" defer></script>${turnstile}<meta property="og:type" content="${route.article ? 'article' : 'website'}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:locale" content="${loc.ogLocale}">${ogAlternates}<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(base)}/images/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(c.ogImageAlt)}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.png" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="${esc(c.feedTitle)}" href="${localePath(loc.code, '/feed.xml')}"><script type="application/ld+json">${jsonLd({base, site, route, copy})}</script><script type="application/json" id="ui-strings">${safeJson(copy.client)}</script></head><body id="top" class="${esc(route.bodyClass || '')}">${header(ctx, route)}<main id="main" tabindex="-1">${body}</main>${footer(ctx, {photos: photosIn(body)})}</body></html>`;
}
