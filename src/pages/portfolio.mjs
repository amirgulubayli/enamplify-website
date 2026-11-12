import data from '../../content/portfolio.json' with {type: 'json'};
import {esc, breadcrumb, button, textLink} from '../components.mjs';

export const portfolioMeta = locale => data.ui[locale];

const number = i => String(i + 1).padStart(2, '0');
const logo = (p, ui, eager = false, decorative = false) => p.logo
  ? `<img src="/images/portfolio/${esc(p.logo)}" alt="${decorative ? '' : esc(p.name)}" width="240" height="100" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`
  : `<span class="portfolio-nda">${esc(ui.ndaMark)}</span>`;

export function portfolio(ctx) {
  const ui = portfolioMeta(ctx.locale);
  return `${breadcrumb([[ui.title]], ctx)}
<header class="portfolio-head wrap">
  <div><h1>${esc(ui.heading)}</h1><p class="lede">${esc(ui.intro)}</p></div>
  <div class="portfolio-head__aside"><p class="portfolio-head__number">12<span>${esc(ui.title)}</span></p><p class="small">${esc(ui.note)}</p></div>
</header>
<nav id="projects" class="portfolio-index section section--light" aria-labelledby="projects-title"><div class="wrap">
  <div class="portfolio-index__head"><h2 id="projects-title">${esc(ui.indexTitle)}</h2><p>${esc(ui.indexIntro)}</p></div>
  <ol class="portfolio-directory">${data.projects.map((p, i) => {
    const industry = p[ctx.locale].sector.split(' · ')[0];
    return `<li><a href="#${esc(p.slug)}" aria-label="${esc(industry)}: ${esc(p.logo ? p.name : ui.clinicalName)}"><span class="portfolio-directory__number">${number(i)}</span><span class="portfolio-directory__brand${p.logoTheme === 'dark' ? ' portfolio-brand--dark' : ''}">${logo(p, ui, true, true)}</span><span class="portfolio-directory__name">${esc(industry)}</span><span class="portfolio-directory__arrow" aria-hidden="true">↘</span></a></li>`;
  }).join('')}</ol>
</div></nav>
${data.projects.map((p, i) => {
  const t = p[ctx.locale];
  const name = p.logo ? p.name : ui.clinicalName;
  return `<article id="${esc(p.slug)}" class="portfolio-project section${i % 2 ? ' section--wash' : ''}" aria-labelledby="${esc(p.slug)}-title"><div class="wrap portfolio-project__layout">
  <aside class="portfolio-project__identity"><p class="portfolio-project__number">${number(i)} <span>/ 12</span></p><div class="portfolio-project__brand${p.logoTheme === 'dark' ? ' portfolio-brand--dark' : ''}">${logo(p, ui)}</div><p class="portfolio-project__name">${esc(name)}</p><p class="portfolio-project__sector">${esc(t.sector)}</p>${p.url ? textLink(ui.website, p.url, 'target="_blank" rel="noopener noreferrer"') : p.logo ? '' : `<p class="small">${esc(ui.nda)}</p>`}</aside>
  <div class="portfolio-project__body"><h2 id="${esc(p.slug)}-title">${esc(t.headline)}</h2><p class="portfolio-project__intro">${esc(t.intro)}</p><h3 class="portfolio-project__label">${esc(ui.details)}</h3><ul class="portfolio-deliverables">${t.bullets.map(([title, body]) => `<li><h4>${esc(title)}</h4><p>${esc(body)}</p></li>`).join('')}</ul><a class="portfolio-project__back" href="#projects">${esc(ui.back)} <span aria-hidden="true">↑</span></a></div>
  </div></article>`;
}).join('')}
<section class="close portfolio-more" aria-labelledby="more-title"><div class="wrap close__inner"><h2 id="more-title">${esc(ui.moreTitle)}</h2><div class="close__body"><p>${esc(ui.moreBody)}</p>${button(ui.contact, ctx.href('/contact/'), 'inverse')}</div></div></section>`;
}
