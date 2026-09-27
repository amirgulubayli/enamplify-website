import {esc, button, textLink, exhibit, closeBand, articleCard, portrait, photo} from '../components.mjs';
import {stackedBar, pairedBars, lineChart, ledger} from '../exhibits.mjs';
import {trackRecord, commitmentsBlock} from './shared.mjs';

/** The illustrative week: values and tones are data; labels come from the copy, in this order. */
const WEEK = [{value: 41, tone: 'ink'}, {value: 21, tone: 'wine'}, {value: 16, tone: 'wine'}, {value: 13, tone: 'wine'}, {value: 9, tone: 'stone'}];
export const weekSegments = labels => WEEK.map((s, i) => ({...s, label: labels[i]}));

const outcomes = ctx => {
  const {moreDone: d, ownedInHouse: o, inControl: k} = ctx.copy.home;
  return [
    exhibit({n: 2, topic: d.topic, title: d.title, cls: 'exhibit--outcome',
      chart: pairedBars({unit: d.unit, max: 16, rows: [{label: d.before, value: 14, tone: 'ink'}, {label: d.after, value: 6, tone: 'wine'}]}),
      note: d.note, source: d.source}, ctx),
    exhibit({n: 3, topic: o.topic, title: o.title, cls: 'exhibit--outcome',
      chart: lineChart({xLabels: [o.start, o.end], max: 12, summary: ctx.copy.common.lineSummary, series: [
        {label: o.team, short: o.teamShort, tone: 'wine', values: [0, 1, 3, 5, 8, 10, 12]},
        {label: o.us, short: o.usShort, tone: 'ink', values: [3, 4, 4, 3, 2, 1, 1]}]}),
      note: o.note, source: o.source}, ctx),
    exhibit({n: 4, topic: k.topic, title: k.title, cls: 'exhibit--outcome',
      chart: ledger({caption: k.caption, columns: k.columns, rows: k.rows}),
      note: k.note, source: k.source}, ctx)
  ].join('');
};

export function home(ctx) {
  const {site, articles, copy} = ctx;
  const c = copy.home;
  const L = ctx.href;
  const diptych = {sizes: '(min-width: 1360px) 272px, (min-width: 1000px) 20vw, 46vw', eager: true};
  return `<section class="hero wrap" aria-labelledby="hero-title">
<div class="hero__copy"><h1 id="hero-title">${esc(c.heroTitle)} <span class="h1-alt">${esc(c.heroTitleAlt)}</span></h1>
<p class="lede">${esc(c.lede)}</p>
<div class="actions">${button(copy.common.bookDiagnostic, L('/contact/'))}${textLink(c.howWeWork, L('/approach/'))}</div>
<p class="note">${esc(c.note)}</p></div>
<div class="diptych">${photo('hero-london', ctx, diptych)}${photo('hero-baku', ctx, diptych)}</div>
</section>

<section class="section section--light" aria-labelledby="situation-title"><div class="wrap">
<h2 id="situation-title" class="section__title">${esc(c.situationTitle)}</h2>
<div class="situation">${exhibit({n: 1, topic: c.week.topic, title: c.week.title, cls: 'exhibit--lead', chart: stackedBar(weekSegments(c.week.segments)), note: c.week.note, source: c.week.source}, ctx)}
<ol class="points">${c.situation.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol></div>
<p class="marked">${esc(c.marked)}</p>
</div></section>

<section class="section section--wash" aria-labelledby="outcomes-title"><div class="wrap">
<h2 id="outcomes-title" class="section__title">${esc(c.outcomesTitle)}</h2>
<div class="outcomes">${outcomes(ctx)}</div>
</div></section>

<section class="section wrap" aria-labelledby="start-title">
<div class="split"><h2 id="start-title" class="section__title">${esc(c.startTitle)}</h2>
<div><ol class="stages">${copy.common.stages.map(s => `<li><span class="stages__n">${s.n}</span><div><h3>${esc(s.name)} <span class="stages__time">${esc(s.time)}</span></h3><p>${esc(s.short)}</p></div></li>`).join('')}</ol>
${textLink(c.moreApproach, L('/approach/'))}</div></div>
</section>

<section class="section section--light" aria-labelledby="commit-title"><div class="wrap">
<h2 id="commit-title" class="section__title">${esc(c.commitTitle)}</h2>
${commitmentsBlock(ctx)}
</div></section>

<section class="section section--wash" aria-labelledby="record-title"><div class="wrap">
<h2 id="record-title" class="section__title">${esc(c.recordTitle)}</h2>
${trackRecord(ctx, {n: 5, cls: 'exhibit--record'})}
${textLink(c.seeWork, L('/work/'))}
</div></section>

<section class="section wrap founder" aria-labelledby="founder-title">
${portrait(ctx, {caption: false})}
<div><h2 id="founder-title" class="section__title">${esc(c.founderTitle)}</h2>
<blockquote class="quote"><p>${esc(c.quote)}</p><footer>${esc(c.quoteBy)}</footer></blockquote>
${textLink(c.aboutLink, L('/about/'))}</div>
</section>

<section class="section section--light" aria-labelledby="insights-title"><div class="wrap">
<div class="section__row"><h2 id="insights-title" class="section__title">${esc(c.insightsTitle)}</h2>${textLink(c.allInsights, L('/insights/'))}</div>
<div class="cards">${articles.slice(0, 3).map(a => articleCard(a, ctx)).join('')}</div>
</div></section>
${closeBand(ctx)}`;
}
