import {esc, arrowNE, button, textLink, pageHead, breadcrumb, closeBand, articleCard, guideCard} from '../components.mjs';

export function insights({articles, guides}) {
  return `${pageHead({title: 'Insights.', lede: 'Practical thinking on AI adoption, pilots, measurement and governance, for the people who have to make it work.', crumbs: [['Insights']]})}
<section class="section wrap" aria-labelledby="essays-title"><h2 id="essays-title" class="section__title">Essays</h2><div class="cards">${articles.map(articleCard).join('')}</div></section>
<section id="guides" class="section section--wash" aria-labelledby="guides-title"><div class="wrap"><h2 id="guides-title" class="section__title">Field guides</h2><p class="lede">Free worksheets to use with your team. No email required.</p><div class="cards">${guides.map(guideCard).join('')}</div></div></section>
${closeBand()}`;
}

export function article(a, {articles, guides}) {
  const guide = guides.find(g => g.slug === a.resource);
  const html = a.html.replace(/<h2>(.*?)<\/h2>/g, (_, t) => `<h2 id="${t.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${t}</h2>`);
  return `${breadcrumb([['Insights', '/insights/'], [a.title]])}
<header class="page-head page-head--article wrap"><h1>${esc(a.title)}</h1><p class="lede">${esc(a.summary)}</p><p class="byline">By <a href="/about/">Amir Gulubayli</a> · <time datetime="${a.isoDate}">${esc(a.date)}</time> · ${esc(a.category)} · ${a.readingTime} min read</p></header>
<div class="wrap article-body"><article class="prose">${html}</article>
<aside class="article-aside">${guide ? `<div class="aside-box"><h2>Field guide: ${esc(guide.name)}</h2><p>${esc(guide.description)}</p>${textLink('Open the guide', `/insights/guides/${guide.slug}/`)}</div>` : ''}<button class="link-arrow" type="button" data-copy-link>Copy link ${arrowNE}</button></aside></div>
<section class="section section--wash" aria-labelledby="more-title"><div class="wrap"><h2 id="more-title" class="section__title">Keep reading.</h2><div class="cards">${articles.filter(x => x.slug !== a.slug).slice(0, 3).map(articleCard).join('')}</div></div></section>
${closeBand()}`;
}

export function guide(g) {
  return `${breadcrumb([['Insights', '/insights/'], [g.name]])}
<header class="page-head wrap"><h1>${esc(g.short)}</h1><p class="lede">${esc(g.description)}</p><div class="actions">${button('Download the worksheet', `/downloads/${g.slug}.pdf`, 'primary', 'download')}<button class="link-arrow" type="button" data-print>Print this guide ${arrowNE}</button></div><p class="small">Field guide · ${esc(g.time)}. Free to use with your team. Bring it to: ${esc(g.audience)}</p></header>
<section class="section wrap worksheet" aria-labelledby="ws-title">
<h2 id="ws-title" class="section__title">${esc(g.name)}</h2><p class="lede">${esc(g.intro)}</p><p class="small">Notes stay on this page. They are not sent or saved.</p>
<div class="worksheet__fields">${g.fields.map((f, i) => `<label>${esc(f)}<input type="text" name="worksheet-${i}" autocomplete="off"></label>`).join('')}</div>
<ol class="worksheet__checks">${g.checks.map(([t, p], i) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p><label class="sr-only" for="note-${i}">Notes for ${esc(t)}</label><textarea id="note-${i}" rows="3"></textarea></li>`).join('')}</ol>
<div class="worksheet__close"><h3>The next decision</h3><p>${esc(g.closing)}</p><label>What happens next?<textarea rows="3"></textarea></label><div class="actions"><button class="btn btn--primary" type="button" data-print>Print with your notes</button><button class="link-arrow" type="button" data-clear-notes>Clear my notes</button></div></div>
</section>
${closeBand({title: 'Useful on paper. Better in practice.', body: 'Bring the completed guide to a conversation about your team’s work.'})}`;
}
