import {esc, arrowNE, pageHead, closeBand} from '../components.mjs';
import {trackRecord} from './shared.mjs';

export function work({work}) {
  return `${pageHead({title: 'Systems we’ve built. Products we run.', lede: 'Before Enamplify, we built AI systems for clients under the RAG Medium name. The same people now help your team build its own.', crumbs: [['Work']]})}
<section class="section wrap" aria-label="Track record">
${trackRecord({n: 1, cls: 'exhibit--record'})}
</section>
<section class="section wrap" aria-labelledby="delivered-title">
<h2 id="delivered-title" class="section__title">What we’ve delivered.</h2>
<ul class="grid-list grid-list--four">${work.delivered.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
<p class="small">Client names are withheld by default. References are available in conversation.</p>
</section>
<section class="section section--wash" aria-labelledby="products-title"><div class="wrap">
<h2 id="products-title" class="section__title">Products we build and run.</h2>
<ul class="products">${work.products.map(p => `<li><h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ${arrowNE}</a>` : esc(p.name)}</h3><p>${esc(p.status)}. ${esc(p.line)}</p></li>`).join('')}</ul>
</div></section>
${closeBand()}`;
}
