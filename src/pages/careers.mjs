import {esc, pageHead, closeBand, button} from '../components.mjs';
import {fill} from '../i18n.mjs';

export function careers(ctx) {
  const {site, copy} = ctx;
  const c = copy.careers;
  const r = c.role;
  const list = (title, items) => `<h4>${esc(title)}</h4><ul class="ticks">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const email = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  return `${pageHead({title: c.title, lede: c.lede, crumbs: [[copy.routes.careers.crumb]]}, ctx)}
<section class="section wrap" aria-labelledby="why-title"><div class="split">
<h2 id="why-title" class="section__title">${esc(c.whyTitle)}</h2>
<ul class="ticks ticks--large">${c.why.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
</div></section>
<section class="section section--wash" aria-labelledby="roles-title"><div class="wrap">
<h2 id="roles-title" class="section__title">${esc(c.openTitle)}</h2>
<article class="role" aria-labelledby="role-title">
<div class="role__head"><h3 id="role-title">${esc(r.title)}</h3><p class="card__meta">${esc(r.type)} · ${esc(r.location)}</p><p class="lede">${esc(r.summary)}</p>
<div class="actions">${button(r.apply, site.bookingUrl, 'primary', 'target="_blank" rel="noopener noreferrer"')}</div><p class="small">${esc(r.applyNote)}</p></div>
<div class="role__body">${list(r.doTitle, r.do)}${list(r.youTitle, r.you)}${list(r.getTitle, r.get)}</div>
</article>
</div></section>
<section class="section wrap" aria-labelledby="other-title"><div class="split">
<h2 id="other-title" class="section__title">${esc(c.otherTitle)}</h2>
<div class="prose"><p>${fill(esc(c.other), {email})}</p></div>
</div></section>
${closeBand(ctx)}`;
}
