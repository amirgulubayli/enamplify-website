import {esc, header, footer} from './components.mjs';

export const titleFor = (route, site) => route.home ? route.title : `${route.title.replace(/\.$/, '')} | ${site.name}`;

export function jsonLd({base, site, route}) {
  const canonical = base + route.url;
  const graph = [
    {'@type': 'ProfessionalService', '@id': `${base}/#practice`, name: site.name, url: `${base}/`, description: site.definition, email: site.email, logo: `${base}/favicon.svg`, image: `${base}/images/social-card.png`, founder: {'@id': `${base}/#founder`},
      areaServed: [{'@type': 'City', name: 'London'}, {'@type': 'City', name: 'Baku'}, {'@type': 'Country', name: 'United Kingdom'}, {'@type': 'Country', name: 'Azerbaijan'}],
      knowsAbout: ['AI enablement', 'AI training for teams', 'AI governance', 'Workflow automation'], sameAs: [site.linkedin]},
    {'@type': 'Person', '@id': `${base}/#founder`, name: site.founder, jobTitle: 'Founder', worksFor: {'@id': `${base}/#practice`}, sameAs: [site.linkedin]},
    {'@type': 'WebSite', '@id': `${base}/#website`, url: `${base}/`, name: site.name, inLanguage: 'en-GB', publisher: {'@id': `${base}/#practice`}}
  ];
  if (route.crumbs) graph.push({'@type': 'BreadcrumbList', itemListElement: [['Home', '/'], ...route.crumbs].map(([name, url], i) => ({'@type': 'ListItem', position: i + 1, name, item: base + (url || route.url)}))});
  if (route.faqs) graph.push({'@type': 'FAQPage', mainEntity: route.faqs.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});
  if (route.article) {
    const a = route.article;
    graph.push({'@type': 'Article', headline: a.title, description: a.summary, datePublished: a.isoDate, dateModified: a.isoDate, author: {'@id': `${base}/#founder`}, publisher: {'@id': `${base}/#practice`}, mainEntityOfPage: canonical, image: `${base}/images/social-card.png`, inLanguage: 'en-GB'});
  }
  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(/</g, '\\u003c');
}

export function renderDocument({base, site, route, cssName, jsName, indexable, turnstileKey = ''}) {
  const title = titleFor(route, site);
  const canonical = base + route.url;
  let body = route.html;
  let turnstile = '';
  if (route.contact && turnstileKey) {
    if (!body.includes('<div id="form-errors"')) throw new Error('Contact page is missing the form-errors anchor for Turnstile');
    turnstile = '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>';
    body = body.replace('<div id="form-errors"', `<div class="cf-turnstile" data-sitekey="${esc(turnstileKey)}" data-theme="light" data-action="enquiry"></div><div id="form-errors"`);
  }
  const fonts = ['schibsted-grotesk', 'public-sans'].map(f => `<link rel="preload" href="/fonts/${f}-latin.woff2" as="font" type="font/woff2" crossorigin>`).join('');
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#FFFFFF"><title>${esc(title)}</title><meta name="description" content="${esc(route.description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}">${route.notFound ? '' : `<link rel="canonical" href="${esc(canonical)}">`}${fonts}<link rel="stylesheet" href="/assets/${cssName}"><script src="/assets/${jsName}" defer></script>${turnstile}<meta property="og:type" content="${route.article ? 'article' : 'website'}"><meta property="og:site_name" content="${esc(site.name)}"><meta property="og:locale" content="en_GB"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(base)}/images/social-card.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Enamplify. AI your team builds, not AI you buy."><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.png" sizes="32x32"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="alternate" type="application/rss+xml" title="Enamplify Insights" href="/feed.xml"><script type="application/ld+json">${jsonLd({base, site, route})}</script></head><body id="top" class="${esc(route.bodyClass || '')}">${header(site, route.url)}<main id="main" tabindex="-1">${body}</main>${footer(site)}</body></html>`;
}
