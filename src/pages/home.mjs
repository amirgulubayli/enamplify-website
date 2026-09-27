import {esc, button, textLink, exhibit, closeBand, articleCard, portrait} from '../components.mjs';
import {stackedBar, pairedBars, lineChart, ledger} from '../exhibits.mjs';
import {stages, commitments, trackRecord} from './shared.mjs';

export const weekSegments = [
  {label: 'Judgement and client work', value: 41, tone: 'navy'},
  {label: 'Recurring reporting', value: 21, tone: 'signal'},
  {label: 'Finding information', value: 16, tone: 'signal'},
  {label: 'Handoffs and chasing', value: 13, tone: 'signal'},
  {label: 'Other', value: 9, tone: 'rule'}
];

const situation = [
  ['Tools were bought. The work didn’t change.', 'Licences go unused when nobody is given the permission, or the method, to change how the work is done.'],
  ['The real use is out of sight.', 'People paste work into personal accounts because the approved route is slower. Leadership can’t see it, so it can’t improve it.'],
  ['Pilots stall in month two.', 'The demo worked. Ownership, review and handoffs were never designed.']
];

const outcomes = () => [
  exhibit({n: 2, topic: 'More done', title: 'Recurring admin falls from 14 hours a week to 6.', cls: 'exhibit--outcome',
    chart: pairedBars({unit: 'hours', max: 16, rows: [{label: 'Before', value: 14, tone: 'rule'}, {label: 'After', value: 6, tone: 'signal'}]}),
    note: 'Hours come back from the work nobody chose: reporting, searching, re-keying, chasing.',
    source: 'Illustrative. Weekly hours on recurring admin for one role.'}),
  exhibit({n: 3, topic: 'Owned in-house', title: 'By month 12, your team runs most of its own workflows.', cls: 'exhibit--outcome',
    chart: lineChart({xLabels: ['Month 1', 'Month 12'], max: 12, series: [
      {label: 'Workflows maintained by your team', tone: 'signal', values: [0, 1, 3, 5, 8, 10, 12]},
      {label: 'Workflows maintained by Enamplify', tone: 'navy', values: [3, 4, 4, 3, 2, 1, 1]}]}),
    note: 'Your people learn to build and run their own workflows. When we step back, the capability stays.',
    source: 'Illustrative.'}),
  exhibit({n: 4, topic: 'In control', title: 'Every workflow has an owner, a review and a boundary.', cls: 'exhibit--outcome',
    chart: ledger({caption: 'Example workflow ledger', columns: ['Workflow', 'Owner', 'Reviewed', 'Data stays in'], rows: [
      ['Monthly board report', 'Finance', 'Yes', 'Your finance system'],
      ['Client enquiry triage', 'Operations', 'Yes', 'Your CRM'],
      ['Contract first‑read', 'Legal', 'Yes', 'Your document store']]}),
    note: 'Every workflow is visible, reviewed before it goes live, and runs inside limits you set.',
    source: 'Example ledger.'})
].join('');

export function home({site, articles}) {
  return `<section class="hero wrap" aria-labelledby="hero-title">
<div class="hero__copy"><h1 id="hero-title">AI your team builds. <span class="h1-alt">Not AI you buy.</span></h1>
<p class="lede">Enamplify helps mid-sized organisations make AI part of how their own people work. More gets done each week, the capability stays in-house, and every workflow is visible to the people accountable for it.</p>
<div class="actions">${button('Book a diagnostic call', '/contact/')}${textLink('How we work', '/approach/')}</div>
<p class="note">A 30-minute conversation with the founder. No pitch deck.</p></div>
${exhibit({n: 1, topic: 'The week', title: 'Half an operations week goes on work AI can take on.', cls: 'hero__exhibit', chart: stackedBar(weekSegments), note: 'Reporting, finding information and handoffs, shown in blue, are where AI workflows usually start.', source: 'Illustrative composite for explanation. A diagnostic replaces it with your own numbers.'})}
</section>

<section class="section wrap" aria-labelledby="situation-title">
<h2 id="situation-title" class="section__title">Your people are already using AI. The question is whether it’s working for the organisation.</h2>
<ol class="numbered">${situation.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
<p class="marked">Most AI rollouts don’t fail on technology. They fail on who owns the work afterwards.</p>
</section>

<section class="section section--wash" aria-labelledby="outcomes-title"><div class="wrap">
<h2 id="outcomes-title" class="section__title">Three things you can take to the board.</h2>
<div class="outcomes">${outcomes()}</div>
</div></section>

<section class="section wrap" aria-labelledby="start-title">
<div class="split"><h2 id="start-title" class="section__title">Start small. Prove it. Then decide.</h2>
<div><ol class="stages">${stages.map(s => `<li><span class="stages__n">${s.n}</span><div><h3>${esc(s.name)} <span class="stages__time">${esc(s.time)}</span></h3><p>${esc(s.short)}</p></div></li>`).join('')}</ol>
${textLink('More on our approach', '/approach/')}</div></div>
</section>

<section class="section wrap" aria-labelledby="commit-title">
<h2 id="commit-title" class="section__title">What we will and won’t do.</h2>
<div class="commitments"><div><h3>We won’t</h3><ul class="ticks ticks--no">${commitments.wont.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
<div><h3>We will</h3><ul class="ticks">${commitments.will.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>
</section>

<section class="section section--wash" aria-labelledby="record-title"><div class="wrap">
<h2 id="record-title" class="section__title">Built by people who ship.</h2>
${trackRecord({n: 5, cls: 'exhibit--record'})}
${textLink('See the work', '/work/')}
</div></section>

<section class="section wrap founder" aria-labelledby="founder-title">
${portrait(site, {caption: false})}
<div><h2 id="founder-title" class="section__title">Founder-led, between London and Baku.</h2>
<blockquote class="quote"><p>“The organisations getting real value from AI aren’t the ones with the biggest budgets. They’re the ones whose own people know how to use it.”</p><footer>Amir Gulubayli, Founder</footer></blockquote>
${textLink('About Enamplify', '/about/')}</div>
</section>

<section class="section wrap" aria-labelledby="insights-title">
<div class="section__row"><h2 id="insights-title" class="section__title">Recent thinking.</h2>${textLink('All insights', '/insights/')}</div>
<div class="cards">${articles.slice(0, 3).map(articleCard).join('')}</div>
</section>
${closeBand()}`;
}
