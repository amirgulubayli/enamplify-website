import {esc, arrowNE, pageHead, closeBand, exhibit} from '../components.mjs';
import {ledger} from '../exhibits.mjs';

export function work(ctx) {
  const {work, copy} = ctx;
  const c = copy.work;
  return `${pageHead({title: c.title, lede: c.lede, crumbs: [[copy.routes.work.crumb]], band: 'band-work'}, ctx)}
<section class="section wrap" aria-label="${esc(c.deliveredLabel)}">
${exhibit({n: 1, topic: c.delivered.topic, title: c.delivered.title, cls: 'exhibit--record',
  chart: ledger({caption: c.delivered.caption, columns: c.delivered.columns, rows: work.delivered}),
  source: c.delivered.source}, ctx)}
</section>
<section class="section section--wash" aria-labelledby="products-title"><div class="wrap">
<h2 id="products-title" class="section__title">${esc(c.productsTitle)}</h2>
<ul class="products">${work.products.map(p => `<li><h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ${arrowNE}</a>` : esc(p.name)}</h3><p>${esc(p.status)}. ${esc(p.line)}</p></li>`).join('')}</ul>
</div></section>
${closeBand(ctx)}`;
}
