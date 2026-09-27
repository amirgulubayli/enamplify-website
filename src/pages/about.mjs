import {esc, pageHead, closeBand, portrait, textLink} from '../components.mjs';
import {commitmentsBlock} from './shared.mjs';

export function about(ctx) {
  const {site, copy} = ctx;
  const c = copy.about;
  return `${pageHead({title: c.title, lede: site.definition, crumbs: [[copy.routes.about.crumb]]}, ctx)}
<section class="section wrap founder" aria-labelledby="amir-title">
${portrait(ctx, {eager: true})}
<div class="prose"><h2 id="amir-title">${esc(site.founder)}</h2>
${c.bio.map(p => `<p>${esc(p)}</p>`).join('\n')}
${textLink(copy.common.linkedin, site.linkedin, 'target="_blank" rel="noopener noreferrer"')}</div>
</section>
<section class="section section--wash" aria-labelledby="why-title"><div class="wrap split">
<h2 id="why-title" class="section__title">${esc(c.whyTitle)}</h2>
<div class="prose">${c.why.map(p => `<p>${esc(p)}</p>`).join('')}</div>
</div></section>
<section class="section wrap" aria-labelledby="markets-title">
<div class="split"><h2 id="markets-title" class="section__title">${esc(c.marketsTitle)}</h2>
<div class="prose"><p>${esc(c.markets)}</p></div></div>
</section>
<section class="section wrap" aria-labelledby="how-title">
<h2 id="how-title" class="section__title">${esc(c.howTitle)}</h2>
${commitmentsBlock(ctx)}
</section>
${closeBand(ctx)}`;
}
