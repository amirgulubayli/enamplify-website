import {esc, pageHead, closeBand, portrait, textLink} from '../components.mjs';
import {commitments} from './shared.mjs';

export function about({site}) {
  return `${pageHead({title: 'Founder-led, between London and Baku.', lede: site.definition, crumbs: [['About']]})}
<section class="section wrap founder" aria-labelledby="amir-title">
${portrait(site, {eager: true})}
<div class="prose"><h2 id="amir-title">Amir Gulubayli</h2>
<p>Amir advises leadership teams on where AI can create measurable value, how it should reshape workflows, and what people need to adopt it successfully. His work spans AI strategy, operating model design, implementation and capability building across travel, marketing, education, finance and clinical technology.</p>
<p>Before Enamplify, Amir built AI systems for clients under the RAG Medium name, from outbound growth engines to clinical trial management software, and launched two AI products of his own, grademy and pripitch. His team won a Google hackathon with a $10,000 winning build.</p>
${textLink('Amir on LinkedIn', site.linkedin, 'target="_blank" rel="noopener noreferrer"')}</div>
</section>
<section class="section section--wash" aria-labelledby="why-title"><div class="wrap split">
<h2 id="why-title" class="section__title">Why Enamplify exists.</h2>
<div class="prose"><p>Most organisations don’t need another AI tool. They need their own people to be able to use the ones they have, safely, on the work that matters.</p><p>Enamplify exists to make that normal: AI your team builds, not AI you buy.</p></div>
</div></section>
<section class="section wrap" aria-labelledby="markets-title">
<div class="split"><h2 id="markets-title" class="section__title">Two markets, one standard.</h2>
<div class="prose"><p>We work from London across the UK and Europe, and from Baku across Azerbaijan. The standard is the same in both: your data stays where you decide, and the capability stays with your people.</p></div></div>
</section>
<section class="section wrap" aria-labelledby="how-title">
<h2 id="how-title" class="section__title">How we work.</h2>
<div class="commitments"><div><h3>We won’t</h3><ul class="ticks ticks--no">${commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>We will</h3><ul class="ticks">${commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>
</section>
${closeBand()}`;
}
