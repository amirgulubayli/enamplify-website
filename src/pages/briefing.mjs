import {esc, arrowNE, button, breadcrumb, closeBand, US_START} from '../components.mjs';
import {fill} from '../i18n.mjs';

const PDF_PATH = '/downloads/company-ai-agent-structuring.pdf';
const num = i => String(i + 1).padStart(2, '0');

export function briefing(ctx) {
  const {copy} = ctx;
  const b = copy.briefing;
  const g = copy.guide;
  return `${breadcrumb([[copy.routes.briefing.crumb]], ctx)}
<header class="page-head wrap">
  <h1>${esc(b.title)}</h1>
  <p class="lede">${esc(b.lede)}</p>
  <div class="actions">${button(b.download, PDF_PATH, 'primary', 'download')}<button class="link-arrow" type="button" data-print>${esc(g.print)} ${arrowNE}</button></div>
  <p class="small">${esc(b.meta)}</p>
</header>
<section class="section section--light" aria-labelledby="gap-title"><div class="wrap">
  <div class="split">
    <h2 id="gap-title" class="section__title">${esc(b.gapTitle)}</h2>
    <div class="prose">${b.gapProse.map(p => `<p>${esc(p)}</p>`).join('')}</div>
  </div>
  <dl class="control-lines briefing-contrasts">${b.contrasts.map(([dt, dd]) => `<div><dt>${esc(dt)}</dt><dd>${esc(dd)}</dd></div>`).join('')}</dl>
</div></section>
<section class="section wrap" aria-labelledby="layers-title">
  <h2 id="layers-title" class="section__title">${esc(b.layersTitle)}</h2>
  <p class="section__dek">${esc(b.layersDek)}</p>
  <ol class="stage-detail">${b.layers.map((l, i) => `<li><div class="stage-detail__head"><span class="stages__n">${num(i)}</span><h2>${esc(l.name)}</h2><p class="stages__time">${esc(l.role)}</p></div><div><p>${esc(l.what)}</p><h3>${esc(b.inPractice)}</h3><ul class="ticks">${l.points.map(pt => `<li>${esc(pt)}</li>`).join('')}</ul></div></li>`).join('')}</ol>
</section>
<section class="section section--wash" aria-labelledby="playbooks-title"><div class="wrap">
  <h2 id="playbooks-title" class="section__title">${esc(b.playbooksTitle)}</h2>
  <p class="section__dek">${esc(b.playbooksDek)}</p>
  <ul class="grid-list">${b.playbooks.map(([t, p]) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
</div></section>
<section class="section wrap worksheet" aria-labelledby="ws-title">
  <h2 id="ws-title" class="section__title">${esc(b.wsTitle)}</h2>
  <p class="lede">${esc(b.wsIntro)}</p>
  <p class="small">${esc(g.notesNote)}</p>
  <div class="worksheet__fields">${b.fields.map((f, i) => `<label>${esc(f)}<input type="text" name="worksheet-${i}" autocomplete="off"></label>`).join('')}</div>
  <ol class="worksheet__checks">${b.checks.map(([t, p], i) => `<li><h3>${esc(t)}</h3><p>${esc(p)}</p><label class="sr-only" for="note-${i}">${esc(fill(g.notesFor, {title: t}))}</label><textarea id="note-${i}" rows="3"></textarea></li>`).join('')}</ol>
  <div class="worksheet__close"><h3>${esc(g.nextDecision)}</h3><p>${esc(b.closing)}</p><label>${esc(g.whatNext)}<textarea rows="3"></textarea></label><div class="actions"><button class="btn btn--primary" type="button" data-print>${esc(g.printNotes)}</button><button class="link-arrow" type="button" data-clear-notes>${esc(g.clearNotes)}</button></div></div>
</section>
${closeBand(ctx, {title: b.closeTitle, body: b.closeBody, action: [copy.common.usCta, US_START], cross: [copy.home.cross, '/me/']})}`;
}
