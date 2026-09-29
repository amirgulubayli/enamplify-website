import {esc, breadcrumb, closeBand, articleCard} from '../components.mjs';

export const caseCard = (c, ctx) => `<article class="card"><h3 class="card__title"><a href="${ctx.href(`/work/${esc(c.slug)}/`)}">${esc(c.title)}</a></h3><p class="card__meta">${esc(ctx.copy.common.caseStudy)} · ${esc(c.sector)}</p><p>${esc(c.summary)}</p></article>`;

export function caseStudy(c, ctx) {
  const {cases, articles, copy} = ctx;
  const t = copy.case;
  const related = articles.find(a => a.slug === c.related);
  return `${breadcrumb([[copy.routes.work.crumb, '/work/'], [c.title]], ctx)}
<header class="page-head page-head--article wrap"><h1>${esc(c.title)}</h1><p class="lede">${esc(c.summary)}</p>
<dl class="facts" aria-label="${esc(t.facts)}">${[[t.sector, c.sector], [t.client, c.client], [t.scope, c.scope]].map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></header>
<section class="section wrap" aria-labelledby="situation-title"><div class="split">
<h2 id="situation-title" class="section__title">${esc(t.situationTitle)}</h2>
<div class="prose">${c.situation.map(p => `<p>${esc(p)}</p>`).join('')}</div>
</div></section>
<section class="section section--wash" aria-labelledby="built-title"><div class="wrap">
<h2 id="built-title" class="section__title">${esc(t.builtTitle)}</h2>
<ul class="grid-list grid-list--pair">${c.built.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
</div></section>
<section class="section wrap" aria-labelledby="changed-title">
<div class="split"><h2 id="changed-title" class="section__title">${esc(t.changedTitle)}</h2><ul class="ticks ticks--large">${c.changed.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
<p class="marked">${esc(c.principle)}</p>
<p class="small case-note">${esc(c.note)}</p>
</section>
<section class="section section--wash" aria-labelledby="more-title"><div class="wrap">
${related ? `<h2 class="section__title">${esc(t.relatedTitle)}</h2><div class="cards cards--pair">${articleCard(related, ctx)}</div>` : ''}
<h2 id="more-title" class="section__title${related ? ' section__title--next' : ''}">${esc(t.moreTitle)}</h2><div class="cards">${cases.filter(x => x.slug !== c.slug).map(x => caseCard(x, ctx)).join('')}</div>
</div></section>
${closeBand(ctx, {title: t.closeTitle, body: t.closeBody})}`;
}
