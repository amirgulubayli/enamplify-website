import {esc, pageHead, closeBand} from '../components.mjs';

export function approach(ctx) {
  const {faqs, copy} = ctx;
  const c = copy.approach;
  return `${pageHead({title: c.title, lede: c.lede, crumbs: [[copy.routes.approach.crumb]]}, ctx)}
<section class="section wrap" aria-label="${esc(c.stagesLabel)}">
<ol class="stage-detail">${copy.common.stages.map(s => `<li><div class="stage-detail__head"><span class="stages__n">${s.n}</span><h2>${esc(s.name)}</h2><p class="stages__time">${esc(s.time)}</p></div><div><p>${esc(s.what)}</p><h3>${esc(c.whatYouGet)}</h3><ul class="ticks">${s.get.map(g => `<li>${esc(g)}</li>`).join('')}</ul><p class="small">${esc(s.note)}</p></div></li>`).join('')}</ol>
</section>
<section class="section section--wash" aria-labelledby="control-title"><div class="wrap">
<h2 id="control-title" class="section__title">${esc(c.controlTitle)}</h2>
<ul class="grid-list">${c.control.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
</div></section>
<section class="section wrap" aria-labelledby="leaves-title">
<div class="split"><h2 id="leaves-title" class="section__title">${esc(c.leavesTitle)}</h2><ul class="ticks ticks--large">${c.leaves.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
</section>
<section class="section wrap" aria-labelledby="faq-title">
<div class="split"><h2 id="faq-title" class="section__title">${esc(c.faqTitle)}</h2>
<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>
</section>
${closeBand(ctx)}`;
}
