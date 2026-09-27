import {esc, arrowNE, button, textLink, pageHead, breadcrumb, closeBand, articleCard, guideCard} from '../components.mjs';
import {fill} from '../i18n.mjs';

export function insights(ctx) {
  const {articles, guides, copy} = ctx;
  const c = copy.insights;
  return `${pageHead({title: c.title, lede: c.lede, crumbs: [[copy.routes.insights.crumb]]}, ctx)}
<section class="section wrap" aria-labelledby="essays-title"><h2 id="essays-title" class="section__title">${esc(c.essays)}</h2><div class="cards">${articles.map(a => articleCard(a, ctx)).join('')}</div></section>
<section id="guides" class="section section--wash" aria-labelledby="guides-title"><div class="wrap"><h2 id="guides-title" class="section__title">${esc(c.guides)}</h2><p class="lede">${esc(c.guidesLede)}</p><div class="cards">${guides.map(g => guideCard(g, ctx)).join('')}</div></div></section>
${closeBand(ctx)}`;
}

const headingId = t => t.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');

export function article(a, ctx) {
  const {articles, guides, copy} = ctx;
  const c = copy.article;
  const L = ctx.href;
  const guide = guides.find(g => g.slug === a.resource);
  const html = a.html.replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${headingId(t)}">${t}</h2>`);
  return `${breadcrumb([[copy.routes.insights.crumb, '/insights/'], [a.title]], ctx)}
<header class="page-head page-head--article wrap"><h1>${esc(a.title)}</h1><p class="lede">${esc(a.summary)}</p><p class="byline">${esc(c.by)} <a href="${L('/about/')}">${esc(a.author || ctx.site.founder)}</a> · <time datetime="${a.isoDate}">${esc(a.date)}</time> · ${esc(a.category)} · ${esc(fill(copy.common.minRead, {n: a.readingTime}))}</p></header>
<div class="wrap article-body"><article class="prose">${html}</article>
<aside class="article-aside">${guide ? `<div class="aside-box"><h2>${esc(fill(c.guideTitle, {name: guide.name}))}</h2><p>${esc(guide.description)}</p>${textLink(c.openGuide, L(`/insights/guides/${guide.slug}/`))}</div>` : ''}<button class="link-arrow" type="button" data-copy-link>${esc(c.copyLink)} ${arrowNE}</button></aside></div>
<section class="section section--wash" aria-labelledby="more-title"><div class="wrap"><h2 id="more-title" class="section__title">${esc(c.keepReading)}</h2><div class="cards">${articles.filter(x => x.slug !== a.slug).slice(0, 3).map(x => articleCard(x, ctx)).join('')}</div></div></section>
${closeBand(ctx)}`;
}

export function guide(g, ctx) {
  const {copy} = ctx;
  const c = copy.guide;
  return `${breadcrumb([[copy.routes.insights.crumb, '/insights/'], [g.name]], ctx)}
<header class="page-head wrap"><h1>${esc(g.short)}</h1><p class="lede">${esc(g.description)}</p><div class="actions">${button(c.download, `/downloads/${g.slug}.pdf`, 'primary', 'download')}<button class="link-arrow" type="button" data-print>${esc(c.print)} ${arrowNE}</button></div><p class="small">${esc(fill(c.meta, {time: g.time, audience: g.audience}))}</p></header>
<section class="section wrap worksheet" aria-labelledby="ws-title">
<h2 id="ws-title" class="section__title">${esc(g.name)}</h2><p class="lede">${esc(g.intro)}</p><p class="small">${esc(c.notesNote)}</p>
<div class="worksheet__fields">${g.fields.map((f, i) => `<label>${esc(f)}<input type="text" name="worksheet-${i}" autocomplete="off"></label>`).join('')}</div>
<ol class="worksheet__checks">${g.checks.map(([t, p], i) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p><label class="sr-only" for="note-${i}">${esc(fill(c.notesFor, {title: t}))}</label><textarea id="note-${i}" rows="3"></textarea></li>`).join('')}</ol>
<div class="worksheet__close"><h3>${esc(c.nextDecision)}</h3><p>${esc(g.closing)}</p><label>${esc(c.whatNext)}<textarea rows="3"></textarea></label><div class="actions"><button class="btn btn--primary" type="button" data-print>${esc(c.printNotes)}</button><button class="link-arrow" type="button" data-clear-notes>${esc(c.clearNotes)}</button></div></div>
</section>
${closeBand(ctx, {title: c.closeTitle, body: c.closeBody})}`;
}
