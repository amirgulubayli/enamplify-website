export const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

export const arrow = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 8h11M9 4l4 4-4 4"/></svg>`;
export const arrowNE = `<svg class="icon" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 12 4M5 4h7v7"/></svg>`;

export const button = (text, href, variant = 'primary', extra = '') => `<a class="btn btn--${variant}" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;
export const textLink = (text, href, extra = '') => `<a class="link-arrow" href="${esc(href)}" ${extra}>${esc(text)}${extra.includes('_blank') ? arrowNE : arrow}</a>`;

export const breadcrumb = crumbs => `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li>${crumbs.map(([t, h]) => `<li>${h ? `<a href="${esc(h)}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>`;

export const pageHead = ({title, lede = '', crumbs}) => `${breadcrumb(crumbs)}<header class="page-head wrap"><h1>${esc(title)}</h1>${lede ? `<p class="lede">${esc(lede)}</p>` : ''}</header>`;

export const exhibit = ({n, title, chart, source, note = '', cls = ''}) => `<figure class="exhibit${cls ? ` ${cls}` : ''}"><figcaption class="exhibit__cap"><span class="exhibit__label">Exhibit ${n}</span><span class="exhibit__title">${esc(title)}</span></figcaption><div class="exhibit__chart">${chart}</div>${note ? `<p class="exhibit__note">${esc(note)}</p>` : ''}<p class="exhibit__source">Source: ${esc(source)}</p></figure>`;

export const closeBand = ({title = 'When the timing is right, start with a conversation.', body = 'Thirty minutes about your team and the work you’d like to change. If we’re not the right fit, we’ll say so.'} = {}) => `<section class="close" aria-labelledby="close-title"><div class="wrap close__inner"><h2 id="close-title">${esc(title)}</h2><div class="close__body"><p>${esc(body)}</p>${button('Book a diagnostic call', '/contact/', 'inverse')}</div></div></section>`;

export const articleCard = a => `<article class="card"><p class="card__meta">${esc(a.category)} · ${a.readingTime} min read</p><h3 class="card__title"><a href="/insights/${a.slug}/">${esc(a.title)}</a></h3><p>${esc(a.summary)}</p></article>`;
export const guideCard = g => `<article class="card card--guide"><p class="card__meta">Field guide · ${esc(g.time)}</p><h3 class="card__title"><a href="/insights/guides/${g.slug}/">${esc(g.name)}</a></h3><p>${esc(g.description)}</p></article>`;

export const portrait = site => `<figure class="portrait"><img class="remote-image" src="${esc(site.portrait)}" alt="Amir Gulubayli, founder of Enamplify" width="640" height="800" loading="lazy" decoding="async"><figcaption>Amir Gulubayli, Founder</figcaption></figure>`;

export function header(site, path) {
  const links = site.nav.map(([t, h]) => `<a href="${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${esc(t)}</a>`).join('');
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><div class="wrap site-header__inner"><a class="wordmark" href="/" aria-label="Enamplify home">Enamplify</a><nav class="site-nav" aria-label="Main">${links}</nav><a class="btn btn--quiet site-header__cta" href="/contact/">Book a call</a><button class="menu-toggle" type="button" aria-controls="mobile-menu" aria-expanded="false"><span class="menu-label">Menu</span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Mobile" inert hidden><div class="wrap">${site.nav.map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}<a href="/contact/">Book a call</a></div></nav></header><noscript><nav class="noscript-nav wrap" aria-label="Main without JavaScript">${links}<a href="/contact/">Book a call</a></nav></noscript>`;
}

export function footer(site) {
  const legal = [['Privacy', '/privacy/'], ['Cookies', '/cookies/'], ['Terms', '/terms/'], ['Accessibility', '/accessibility/']];
  return `<footer class="site-footer"><div class="wrap"><div class="site-footer__top"><div class="site-footer__brand"><a class="wordmark" href="/">Enamplify</a><p>${esc(site.definition)}</p><p class="site-footer__cities">${site.cities.map(esc).join(' · ')}</p></div><nav aria-label="Footer"><h2>Pages</h2>${[...site.nav, ['Book a call', '/contact/']].map(([t, h]) => `<a href="${h}">${esc(t)}</a>`).join('')}</nav><div><h2>Contact</h2><a href="mailto:${esc(site.email)}">${esc(site.email)}</a><a href="${esc(site.linkedin)}" target="_blank" rel="noopener noreferrer">Amir on LinkedIn ${arrowNE}</a><a href="/feed.xml">Insights feed</a></div></div><div class="site-footer__bottom"><p>© ${new Date().getFullYear()} Enamplify</p><nav aria-label="Legal">${legal.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}</nav></div></div></footer>`;
}
