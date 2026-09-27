import {esc, arrowNE, pageHead, closeBand, exhibit} from '../components.mjs';
import {ledger} from '../exhibits.mjs';

export function work({work}) {
  return `${pageHead({title: 'Systems we’ve built. Products we run.', lede: 'Before Enamplify, we built AI systems for clients under the RAG Medium name, and won a Google hackathon with a $10,000 winning build. The same people now help your team build its own.', crumbs: [['Work']]})}
<section class="section wrap" aria-label="Delivered systems">
${exhibit({n: 1, topic: 'Delivered', title: 'Eight kinds of client system, shipped.', cls: 'exhibit--record',
  chart: ledger({caption: 'Delivered client systems', columns: ['System', 'What it does'], rows: work.delivered}),
  source: 'RAG Medium and Enamplify delivery record. Client names withheld; references available in conversation.'})}
</section>
<section class="section section--wash" aria-labelledby="products-title"><div class="wrap">
<h2 id="products-title" class="section__title">Products we build and run.</h2>
<ul class="products">${work.products.map(p => `<li><h3>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)} ${arrowNE}</a>` : esc(p.name)}</h3><p>${esc(p.status)}. ${esc(p.line)}</p></li>`).join('')}</ul>
</div></section>
${closeBand()}`;
}
