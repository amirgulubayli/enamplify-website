import {esc, pageHead, closeBand} from '../components.mjs';
import {stages} from './shared.mjs';

const control = [
  ['Your sign-in, your roles', 'People sign in with their company accounts. Roles decide who can build, who approves and who uses.'],
  ['Reviewed before it runs', 'No workflow goes live without a named owner and a review step.'],
  ['A complete record', 'Every run is logged, so you can see what happened, when, and on whose authority.'],
  ['Data routed by sensitivity', 'Sensitive information only goes to models that run in your environment. Nobody has to make that call by hand.'],
  ['Spending you can see', 'Usage limits per team, and a clear view of what AI is costing you.'],
  ['Hosted where you decide', 'On your own infrastructure, or in UK or EU hosting.']
];
const leaves = ['Workflows your people use every week', 'People who can build the next ones', 'A playbook for how your organisation uses AI', 'A measured baseline, and the evidence of what changed'];

export function approach({faqs}) {
  return `${pageHead({title: 'Start small. Prove it. Then scale.', lede: 'Every engagement begins with a small, fixed piece of work and a clear decision point. You only go further when the evidence says it’s worth it.', crumbs: [['Approach']]})}
<section class="section wrap" aria-label="Stages">
<ol class="stage-detail">${stages.map(s => `<li><div class="stage-detail__head"><span class="stages__n">${s.n}</span><h2>${esc(s.name)}</h2><p class="stages__time">${esc(s.time)}</p></div><div><p>${esc(s.what)}</p><h3>What you get</h3><ul class="ticks">${s.get.map(g => `<li>${esc(g)}</li>`).join('')}</ul><p class="small">${esc(s.note)}</p></div></li>`).join('')}</ol>
</section>
<section class="section section--wash" aria-labelledby="control-title"><div class="wrap">
<h2 id="control-title" class="section__title">What “in control” means in practice.</h2>
<ul class="grid-list">${control.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
</div></section>
<section class="section wrap" aria-labelledby="leaves-title">
<div class="split"><h2 id="leaves-title" class="section__title">What your team is left with.</h2><ul class="ticks ticks--large">${leaves.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>
</section>
<section class="section wrap" aria-labelledby="faq-title">
<div class="split"><h2 id="faq-title" class="section__title">Questions leaders ask.</h2>
<div class="faq">${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div></div>
</section>
${closeBand()}`;
}
