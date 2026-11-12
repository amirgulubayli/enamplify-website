import {esc, arrow, button, textLink, photo, closeBand, kitBand, audienceToggle, crossLink, US_ENQUIRY, ME_ENQUIRY} from '../components.mjs';
import {workspaceDemo} from './workspace-demo.mjs';

/*
 * The Us homepage. It opens on a live workspace window that plays one job end to end,
 * then makes the distinction the page turns on (a right hand, not an employee) and walks through
 * what that means feature by feature, each with its own small animated scene. The existing
 * machinery chapters, the two halves, the engagement stages and delivered work follow.
 */

const CASE_ORDER = [
  'clinical-trial-operations',
  'travel-distributor-outreach',
  'pr-agency-workflows',
  'marketing-agency-workflows'
];

const LANE_ICONS = [
  ['search', 'chart-no-axes-combined', 'shield-check', 'file-text'],
  ['globe', 'cpu', 'network', 'mail'],
  ['files', 'hard-drive', 'shield-check', 'workflow'],
  ['search', 'chart-no-axes-combined', 'brain-circuit', 'file-text']
];
// Each example builds its own board: three widgets, different kinds in a different arrangement.
const BOARD_ICONS = [
  ['chart-no-axes-combined', 'file-text', 'mail'],
  ['panels-top-left', 'contact-round', 'mail'],
  ['git-branch', 'network', 'folder-check'],
  ['files', 'globe', 'file-text']
];
const BARS = [46, 62, 38, 84, 55, 71, 30, 66, 92, 48], FLAGGED = [3, 8];
const MATRIX = [['NV', [4, 3, 4, 2, 4], 94], ['AL', [3, 4, 3, 3, 4], 88], ['KT', [2, 3, 2, 4, 3], 71], ['RM', [3, 1, 2, 2, 3], 58], ['SD', [1, 2, 1, 3, 2], 44]];
const PEOPLE = ['AK', 'LM', 'RS'];
const GROUPS_US = [['calendar-days', 'mail', 'bell-ring'], ['files', 'folder-open', 'hard-drive'], ['contact-round', 'chart-no-axes-combined', 'network'], ['bot', 'brain-circuit', 'plug-zap']];
const PROVIDERS = [['openai', 'OpenAI'], ['openai', 'OpenAI'], ['anthropic', 'Anthropic'], ['gemini', 'Gemini']];
const MORE = [['deepseek', 'DeepSeek'], ['qwen', 'Qwen']];

const ico = (name, size = 18) => `<img class="v-ico" src="/images/icons/${name}.svg" width="${size}" height="${size}" alt="" decoding="async">`;
const check = '<svg class="lv-tick" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.4l2.3 2.3 4.7-5.2"/></svg>';

/**
 * The live workspace. Rendered complete (first example, approved) so it reads without scripts and
 * under reduced motion; assets/home-new.js replays it as a sequence and rotates the examples.
 * It is an authored illustration: nothing is sent, and no model is called.
 */
function liveWorkspace(cmd, ctx, kit) {
  const t = kit.live;
  const data = cmd.missions.map((m, i) => ({d: m.directive.replace(/^[“"]|[”"]$/g, ''), a: m.lanes.map(([role], j) => [kit.lanes[i][j], role]), v: m.viewName, r: m.artifact, p: m.approver, s: kit.suggest[i]}));
  const first = data[0];
  const working = kit.working;
  const tabs = cmd.missions.map((m, i) => `<button type="button" role="tab" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-lv-tab>${esc(m.tab)}</button>`).join('');
  const agents = first.a.map(([icon, role]) => `<li class="is-done">${ico(icon)}<span>${esc(role)}</span><i class="lv-status" aria-hidden="true">${check}</i></li>`).join('');
  const lines = n => '<i></i>'.repeat(n);
  const queue = `<ul class="lv-queue lv-seq">${PEOPLE.map(person => `<li><b>${person}</b><i></i><em>${check}</em></li>`).join('')}</ul>`;
  const usScenes = () => [
    [`<div class="lv-bars">${BARS.map((h, k) => `<i${FLAGGED.includes(k) ? ' class="is-flag"' : ''}></i>`).join('')}</div>`,
      `<div class="lv-doc">${lines(5)}<b>1</b><b>2</b></div>`, queue],
    [`<ul class="lv-matrix lv-seq">${MATRIX.map(([who, cells, score], k) => `<li${k < 2 ? ' class="is-top"' : ''}><b>${who}</b><span>${cells.map(n => `<i class="c${n}"></i>`).join('')}</span><em>${score}</em></li>`).join('')}</ul>`,
      `<ul class="lv-cards lv-seq">${MATRIX.slice(0, 2).map(([who]) => `<li><b>${who}</b>${lines(2)}</li>`).join('')}</ul>`,
      `<div class="lv-pipe lv-seq">${[3, 2, 1].map(n => `<ul>${'<li></li>'.repeat(n)}</ul>`).join('')}</div>`],
    [`<div class="lv-diff lv-seq"><i></i><i class="del"></i><i class="add"></i><i></i><i class="del"></i><i class="add"></i><i></i></div>`,
      `<div class="lv-sites lv-seq">${Array.from({length: 14}, (_, k) => `<i${k === 4 || k === 10 ? ' class="is-flag"' : ''}>${String(k + 1).padStart(2, '0')}</i>`).join('')}</div>`,
      `<ul class="lv-list lv-seq">${['09:20', '09:34', '09:51'].map(time => `<li><em>${check}</em><i></i><time>${time}</time></li>`).join('')}</ul>`],
    [`<ul class="lv-shelf lv-seq">${[0, 1, 2, 3].map(k => `<li${k === 1 ? ' class="is-flag"' : ''}>${lines(2)}</li>`).join('')}</ul>`,
      `<div class="lv-beats lv-seq">${lines(7)}</div>`, queue]
  ];
  const scenes = kit.scenes ? kit.scenes({lines, queue}) : usScenes();
  const boards = scenes.map((widgets, i) => `<div class="lv-grid lv-grid--${i}" data-lv-board aria-hidden="true"${i ? ' hidden' : ''}>${widgets.map((body, k) => `<div class="lv-w lv-w--${k}"><h4>${ico(kit.boards[i][k], 16)}<span>${esc(cmd.missions[i].modules[k][0])}</span></h4>${body}</div>`).join('')}</div>`).join('');
  const tip = `<div class="lv-tip">${ico('brain-circuit')}<p data-lv-tip>${esc(first.s)}</p><span class="lv-add" data-add="${esc(t.add)}" data-added="${esc(t.added)}">${check}<span data-lv-add>${esc(t.added)}</span></span></div>`;
  const pause = `<button class="lv-pause" type="button" data-lv-pause aria-pressed="false" aria-label="${esc(kit.pause)}" data-pause="${esc(kit.pause)}" data-play="${esc(kit.play)}" hidden><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path class="lv-pause__on" d="M5 3v10M11 3v10"/><path class="lv-pause__off" d="M5 3l8 5-8 5z" stroke-linejoin="round"/></svg></button>`;

  return `<section class="hn-live" aria-label="${esc(cmd.ariaLabel)}" data-live>
    <div class="hn-live__stage"><div class="hn-live__back">${photo(kit.photo, ctx, {sizes: '100vw', caption: false})}</div>
    <div class="wrap">
      <div class="lv" data-working="${esc(working)}" data-ready="${esc(t.ready)}" data-approve="${esc(t.approve)}" data-approved="${esc(t.approved)}">
        <div class="lv-bar"><span class="lv-brand">Enamplify</span><div class="lv-tabs" role="tablist" aria-label="${esc(cmd.tabsLabel)}">${tabs}</div>${pause}</div>
        <div class="lv-body">
          <div class="lv-chat">
            <div class="lv-thread">
              <p class="lv-msg" data-lv-msg>${esc(first.d)}</p>
              <ul class="lv-agents">${agents}</ul>
              ${tip}
            </div>
            <div class="lv-composer" aria-hidden="true"><p><span class="lv-placeholder">${esc(t.ask)}</span><span data-lv-type></span><i class="lv-caret"></i></p><span class="lv-send"><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5"/></svg></span></div>
          </div>
          <div class="lv-canvas">
            <div class="lv-head"><h3 data-lv-title>${esc(first.v)}</h3><span class="lv-state"><i aria-hidden="true"></i><span data-lv-state>${esc(t.approved)}</span></span></div>
            ${boards}
            <div class="lv-result">${ico('folder-check', 20)}<p><strong data-lv-artifact>${esc(first.r)}</strong><small data-lv-approver>${esc(first.p)}</small></p><span class="lv-approve">${check}<span data-lv-btn>${esc(t.approved)}</span></span></div>
          </div>
          <svg class="lv-cursor" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M4 2l11.5 8.2-5 .9 3 5.7-2.3 1.2-3-5.8L4 15.8z" fill="#242321" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div></div>
    <p class="wrap hn-live__note">${esc(ctx.copy.home.conceptNote)}</p>
    <script type="application/json" data-lv-data>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
  </section>`;
}

/*
 * Feature chapters. Each pairs a short claim with a small authored scene in the same product
 * treatment as the live workspace. Scenes are complete as rendered; assets/home-new.js adds
 * `is-on` when one scrolls into view, which plays its staggered entrance (and replays it on a
 * slow loop). The `dN` classes are the stagger steps, defined in assets/home-new.css.
 */
const done = d => `<span class="fv-done" aria-hidden="true"><i class="fv-ring fx-out d${d}"></i><i class="fv-ok fx-pop d${d}">${check}</i></span>`;

function observeScene(f, concept, icons = ['mail', 'calendar-days', 'chart-no-axes-combined', 'files']) {
  const times = ['09:12', '09:26', '09:41', '09:58'];
  const feed = f.feed.map((t, i) => `<li class="fx d${i * 2 + 1}${i === 2 ? ' fv-hit' : ''}">${ico(icons[i])}<span>${esc(t)}</span><time>${times[i]}</time></li>`).join('');
  return `<div class="fv fv-observe"><p class="fv-top"><i class="fv-live" aria-hidden="true"></i>${esc(f.status)}<span class="fv-concept">${esc(concept)}</span></p><ul class="fv-feed">${feed}</ul><div class="fv-flag fx d11">${ico('bell-ring', 20)}<p><strong>${esc(f.flagTitle)}</strong>${esc(f.flag)}</p></div></div>`;
}

function teamScene(a, concept, icons = ['search', 'globe', 'files', 'code-xml']) {
  const xs = [50, 150, 250, 350];
  const wires = (d, path) => `<svg class="fv-wires" viewBox="0 0 400 36" preserveAspectRatio="none" aria-hidden="true">${xs.map(x => `<path class="fx-draw d${d}" pathLength="1" d="${path(x)}" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
  const lanes = a.lanes.map(([name, source], i) => `<li class="fx d${i + 3}">${ico(icons[i], 20)}<strong>${esc(name)}</strong><small>${esc(source)}</small><span class="fv-prog" aria-hidden="true"><i class="fx-grow d${i * 2 + 5}"></i></span>${done(i * 2 + 8)}</li>`).join('');
  return `<div class="fv fv-team"><span class="fv-concept">${esc(concept)}</span><p class="fv-chip fx d1"><small>${esc(a.objectiveLabel)}</small>${esc(a.objective)}</p>${wires(2, x => `M200 0C200 24 ${x} 12 ${x} 36`)}<ul class="fv-lanes">${lanes}</ul>${wires(15, x => `M${x} 0C${x} 24 200 12 200 36`)}<p class="fv-chip fv-chip--result fx d16">${ico('folder-check', 20)}${esc(a.result)}</p></div>`;
}

function alwaysScene(f, o, concept) {
  const times = ['22:40', '02:15', '06:30'];
  const runs = o.runs.map(([job], i) => `<li class="fx d${i * 3 + 2}"><time>${times[i]}</time><span>${esc(job)}</span>${done(i * 3 + 4)}</li>`).join('');
  return `<div class="fv fv-night"><p class="fv-top">${ico('clock-3')}${esc(f.away)}<span class="fv-concept">${esc(concept)}</span></p><span class="fv-span" aria-hidden="true"><i class="fx-grow d1"></i></span><ol class="fv-times">${runs}</ol><div class="fv-flag fx d13"><time>07:00</time><p><strong>${esc(o.result)}</strong>${esc(o.approver)}</p></div></div>`;
}

function gateScene(g, live, concept, icons = ['file-text', 'hard-drive', 'mail']) {
  const steps = g.steps.map((t, i) => `<li class="fx d${i * 2 + 1}">${ico(icons[i])}<span>${esc(t)}</span>${i === 0
    ? `<em class="fv-tag fv-tag--ok fx-pop d3">${check}${esc(g.done)}</em>`
    : `<span class="fv-swap"><em class="fv-tag fx-out d14">${esc(g.waiting)}</em><em class="fv-tag fv-tag--ok fx-pop d14">${check}${esc(live.approved)}</em></span>`}</li>`).join('');
  return `<div class="fv fv-gate"><p class="fv-top">${ico('shield-check')}${esc(live.ready)}<span class="fv-concept">${esc(concept)}</span></p><ul class="fv-steps">${steps}</ul><div class="fv-ask fx d8"><p>${esc(g.ask)}</p><span class="fv-btn">${esc(g.hold)}</span><span class="fv-btn fv-btn--go fx-press d13">${esc(live.approve)}</span></div></div>`;
}

const feature = (key, f, scene, flip = false) => `<section class="ft${flip ? ' ft--flip' : ''}" aria-labelledby="ft-${key}-title"><div class="wrap ft__grid"><div class="ft__head"><h2 id="ft-${key}-title">${esc(f.title)} <em>${esc(f.titleAlt)}</em></h2><p class="lede">${esc(f.sub)}</p></div><div class="ft__scene" data-fx="10000">${scene}</div></div></section>`;

/** The distinction the page turns on: not an employee that waits, a right hand that anticipates. */
function handSection(h) {
  const rows = h.rows.map(([a, b], i) => `<li><span class="fx d${i * 3 + 1}">${esc(a)}</span><strong class="fx d${i * 3 + 2}">${esc(b)}</strong></li>`).join('');
  return `<section class="hn-hand" aria-labelledby="hn-hand-title" data-fx="0"><div class="wrap hn-hand__grid"><div><h2 id="hn-hand-title">${esc(h.title)} <em>${esc(h.titleAlt)}</em></h2><p class="lede">${esc(h.lede)}</p></div><div class="hn-hand__table"><p class="hn-hand__cols"><span>${esc(h.left)}</span><span>${esc(h.right)}</span></p><ol>${rows}</ol></div></div></section>`;
}

/** The existing open chapters for connected tools, model accounts and the retained sandbox. */
function machineryChapters(ctx) {
  const v = ctx.copy.home.visual;
  const e = v.extension;
  const {connect: n, accounts: m} = v;
  const b = e.sandbox;
  const list = (items, fn, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map(fn).join('')}</ul>`;
  const tag = (text, cls = '') => `<span class="v-tag${cls}">${esc(text)}</span>`;
  const st = (kind, text) => `<span class="v-st v-st--${kind}"><i aria-hidden="true"></i>${esc(text)}</span>`;
  const replay = `<button class="v-replay" type="button" data-demo-replay hidden>${ico('rotate-ccw', 20)}<span>${esc(e.replay)}</span></button>`;
  const chapter = (key, head, body, actionHtml = '') => `<section class="visual visual--${key}" aria-labelledby="visual-${key}-title"><div class="wrap visual__grid"><div class="visual__head"><h2 id="visual-${key}-title">${esc(head.title)}</h2><p class="lede">${esc(head.sub)}</p></div>${body}${actionHtml}</div></section>`;

  const groups = list(n.groups, (x, i) => `<li class="v-con__g"><p>${esc(x.name)}</p>${list(x.items, (t, j) => `<li>${ico(GROUPS_US[i][j], 24)}<span>${esc(t)}</span></li>`)}</li>`, 'v-con__groups');
  const connect = chapter('connect', n, `<figure class="v-con" data-demo><div class="v-con__map"><svg class="v-con__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M12 16C12 50 50 26 50 50M88 16C88 50 50 26 50 50M12 84C12 50 50 74 50 50M88 84C88 50 50 74 50 50" vector-effect="non-scaling-stroke"/></svg><p class="v-core">${ico('users', 24)}<span><b>Enamplify</b><small>${esc(n.core)}</small></span></p>${groups}</div><figcaption class="v-note">${esc(n.note)}${replay}</figcaption></figure>`);

  const provider = (i, cls = '') => {
    const [id, name] = PROVIDERS[i];
    return `<div class="v-provider ${cls}">${ico(`provider-${id}`, 24)}<p><strong>${name}</strong><small>${esc(m.kinds[i])}</small></p>${st(i === 2 ? 'limit' : 'ready', m.states[i === 2 ? 1 : 0])}</div>`;
  };
  const more = `<p class="v-more">${esc(m.more)}${MORE.map(([id, name]) => `<span>${ico(`provider-${id}`, 24)}${name}</span>`).join('')}</p>`;
  const accounts = chapter('accounts', m, `<figure class="v-acct" data-demo><p class="v-routing-job">${esc(m.jobs[2])}</p><div class="v-routing">${provider(2, 'is-limit')}<svg class="v-routing__line" viewBox="0 0 160 40" aria-hidden="true"><path d="M2 20C55 -5 105 45 154 20M144 14L154 20 144 28"/></svg>${provider(1, 'is-fallback')}</div><p class="v-routing-caption">${esc(m.jobs[1])}${arrow}</p><div class="v-acct__others">${[0, 3].map(i => `<div>${provider(i)}<p>${esc(m.jobs[i])}</p></div>`).join('')}</div>${more}<figcaption class="v-note">${esc(m.note)}${replay}</figcaption></figure>`);

  const pane = (icon, title, contents, cls) => `<div class="v-sandbox__pane ${cls}"><h3>${ico(icon, 24)}${esc(title)}</h3>${contents}</div>`;
  const browser = `<div class="v-browser">${list(b.browser, (t, i) => `<li>${ico(i === 0 ? 'search' : 'check', 24)}<span>${esc(t)}</span></li>`)}</div>`;
  const code = `<ol class="v-code">${b.code.map(t => `<li><code>${esc(t)}</code></li>`).join('')}</ol>`;
  const files = list(b.files, (t, i) => `<li${i === 2 ? ' class="v-sandbox__result"' : ''}>${ico(i === 2 ? 'folder-check' : 'file-text', 24)}<span>${esc(t)}</span></li>`, 'v-sandbox__files');
  const sandbox = chapter('sandbox', b, `<figure class="v-sandbox" data-demo><div class="v-sandbox__frame"><p class="v-sandbox__task"><span>${esc(b.task)}</span>${tag(v.concept)}</p><div class="v-sandbox__panes">${pane('globe', b.views[0], browser, 'v-sandbox__browser')}${pane('terminal', b.views[1], code, 'v-sandbox__code')}${pane('files', b.views[2], files, 'v-sandbox__output')}</div><ol class="v-retain">${b.states.map((t, i) => `<li>${ico(['pause', 'hard-drive', 'play'][i], 24)}<span>${esc(t)}</span></li>`).join('')}</ol></div><figcaption class="v-note">${esc(b.note)}${replay}</figcaption></figure>`, `<div class="v-action">${button(e.cta[2], ctx.href(US_ENQUIRY), 'inverse', 'data-enquiry')}</div>`);

  return `${connect}\n${accounts}\n${sandbox}`;
}

/** What you get: the system and the consulting, side by side, as icon chips rather than sentences. */
const HALF_ICONS = [['panels-top-left', 'bot', 'clock-3', 'plug-zap'], ['search', 'network', 'play', 'shield-check']];
function halvesSection(c) {
  const h = c.halves;
  const cols = h.items.map((item, i) => `<article class="hn-half">${ico(['cpu', 'users'][i], 28)}<h3>${esc(item.label)}</h3><p class="hn-half__sub">${esc(item.title)}</p><ul class="hn-chips">${h.chips[i].map((t, k) => `<li>${ico(HALF_ICONS[i][k], 20)}<span>${esc(t)}</span></li>`).join('')}</ul></article>`).join('');
  return `<section id="two-halves" class="section section--wash hn-halves" aria-labelledby="hn-halves-title"><div class="wrap">
    <h2 id="hn-halves-title">${esc(h.title)} <em>${esc(h.titleAlt)}</em></h2>
    <div class="hn-halves__grid">${cols}</div>
  </div></section>`;
}

/** How an engagement runs: three stages across, beside the two cities, then what stays yours. */
function practiceSection(c, ctx) {
  const pr = c.practice;
  const stageList = `<ol class="hn-stages">${ctx.copy.common.stages.map((s, i) => `<li>${ico(['search', 'workflow', 'shield-check'][i], 28)}<p class="hn-stages__meta"><span class="stages__n">${esc(s.n)}</span><span class="stages__time">${esc(s.time)}</span></p><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p></li>`).join('')}</ol>`;
  const cities = `<div class="hn-cities">${photo('hero-london', ctx, {sizes: '(min-width: 900px) 26vw, 56vw', cls: 'visual-city__photo'})}${photo('hero-baku', ctx, {sizes: '(min-width: 900px) 18vw, 40vw', cls: 'visual-city__photo'})}</div>`;
  return `<section class="section hn-practice" aria-labelledby="hn-practice-title"><div class="wrap">
    <div class="hn-practice__head"><div><h2 id="hn-practice-title">${esc(pr.title)} <em>${esc(pr.titleAlt)}</em></h2><p class="lede">${esc(pr.lede)}</p></div>${cities}</div>
    ${stageList}
    <div class="hn-practice__foot"><p class="hn-gov"><strong>${esc(pr.governanceTitle)}.</strong> ${esc(pr.governanceBody)}</p>${textLink(pr.approachLink, ctx.href('/approach/'))}</div>
  </div></section>`;
}

function proofSection(c, ctx) {
  const p = c.proof;
  const icons = {'clinical-trial-operations': 'shield-check', 'travel-distributor-outreach': 'globe', 'pr-agency-workflows': 'mail', 'marketing-agency-workflows': 'chart-no-axes-combined'};
  const sectors = CASE_ORDER.map(slug => ctx.cases.find(x => x.slug === slug)).filter(Boolean).map(cs => `<li>${ico(icons[cs.slug], 24)}<span>${esc(cs.sector)}</span></li>`).join('');
  return `<section class="section section--light hn-proof" aria-labelledby="hn-proof-title"><div class="wrap hn-proof__inner"><h2 id="hn-proof-title">${esc(p.trust)}</h2><ul class="hn-sectors">${sectors}</ul>${button(p.learn, ctx.href('/discover/'))}</div></section>`;
}

export function homeNew(ctx) {
  const {copy} = ctx;
  const c = copy.homeNew;
  const hero = copy.home;
  const f = c.features;
  const v = copy.home.visual;
  const L = ctx.href;

  return `<section class="hero hn-hero wrap" aria-labelledby="hero-title">${audienceToggle(ctx, 'us', {isPage: true, cls: 'audience--hero'})}<h1 id="hero-title">${esc(hero.heroTitle)} <span class="h1-alt">${esc(hero.heroTitleAlt)}</span></h1><p class="lede">${esc(hero.lede)}</p><div class="actions">${button(copy.common.usCta, L(US_ENQUIRY))}</div>${crossLink(c.cross, L('/me/'))}</section>
${liveWorkspace(c.command, ctx, {lanes: LANE_ICONS, boards: BOARD_ICONS, photo: 'band-insights', live: c.command.live, suggest: c.command.live.suggest, working: c.command.missions[0].lanes[2][2], play: c.command.play, pause: c.command.pause})}
${handSection(f.hand)}
${feature('observe', f.observe, observeScene(f.observe, v.concept))}
${feature('team', f.team, teamScene(v.agents, v.concept), true)}
${feature('always', f.always, alwaysScene(f.always, v.operate, v.concept))}
${feature('gate', f.gate, gateScene(f.gate, c.command.live, v.concept), true)}
<section class="visual visual--adapt hn-adapt" aria-labelledby="hn-adapt-title"><div class="wrap visual__grid"><div class="visual__head"><h2 id="hn-adapt-title">${esc(c.adapt.title)} <em>${esc(c.adapt.titleAlt)}</em></h2><p class="lede">${esc(v.adapt.sub)}</p></div>${workspaceDemo(ctx, v)}</div></section>
${machineryChapters(ctx)}
${halvesSection(c)}
${practiceSection(c, ctx)}
${proofSection(c, ctx)}
${kitBand(ctx, 'new-kit')}
${closeBand(ctx, {title: c.closeTitle, body: c.closeBody, action: [copy.common.usCta, US_ENQUIRY], cross: [c.cross, '/me/']})}`;
}

/*
 * Me: the same page for one person. The demo plans a week, a trip, exam prep and the week's
 * dinners, each on its own board; the chapters make the same right-hand case in everyday terms.
 * Me is in development, so the hero carries that note and every action registers interest.
 */
const ME_LANES = [['calendar-days', 'check', 'mail', 'bell-ring'], ['globe', 'hard-drive', 'search', 'chart-no-axes-combined'], ['file-text', 'brain-circuit', 'clock-3', 'users'], ['search', 'folder-open', 'folder-check', 'chart-no-axes-combined']];
const ME_BOARDS = [['calendar-days', 'check', 'bell-ring'], ['globe', 'chart-no-axes-combined', 'folder-check'], ['brain-circuit', 'clock-3', 'file-text'], ['calendar-days', 'folder-check', 'chart-no-axes-combined']];
const meScenes = ({lines}) => {
  const ticks = n => `<ul class="lv-list lv-seq">${`<li><em>${check}</em><i></i></li>`.repeat(n)}</ul>`;
  const times = list => `<div class="lv-times lv-seq">${list.map(time => `<b>${time}</b>`).join('')}</div>`;
  return [
    [`<div class="lv-week lv-seq">${[12, 13, 14, 15, 16].map((day, k) => `<div><b>${day}</b>${[0, 1, 2].slice(0, k % 2 ? 2 : 3).map(n => `<i class="k${(k + n) % 3}"></i>`).join('')}</div>`).join('')}</div>`, ticks(3), times(['07:30', '12:00', '18:45'])],
    [`<div class="lv-days lv-seq">${[1, 2, 3].map(day => `<div><b>${day}</b>${lines(3)}</div>`).join('')}</div>`,
      '<div class="lv-donut"><svg viewBox="0 0 36 36"><circle class="t" cx="18" cy="18" r="15"/><circle class="v" pathLength="100" cx="18" cy="18" r="15"/></svg><b>€560</b></div>', ticks(4)],
    [`<ul class="lv-topics lv-seq">${[92, 74, 58, 36].map(n => `<li><i><i></i></i><em>${n}%</em></li>`).join('')}</ul>`, times(['08:00', '13:00', '19:30', '08:00']), '<div class="lv-flash"><i></i><i></i><b>?</b></div>'],
    [`<div class="lv-plates lv-seq">${lines(7)}</div>`, ticks(4), `<div class="lv-bars">${lines(6)}</div>`]
  ];
};

export function meNew(ctx) {
  const {copy} = ctx;
  const us = copy.homeNew, m = us.me, hero = copy.me, f = m.features, v = copy.me.visual;
  const L = ctx.href;
  const live = {...us.command.live, ask: m.command.ask};
  const kit = {lanes: ME_LANES, boards: ME_BOARDS, scenes: meScenes, photo: 'band-work', live, suggest: m.command.suggest, working: us.command.missions[0].lanes[2][2], play: us.command.play, pause: us.command.pause};

  return `<section class="hero hn-hero wrap" aria-labelledby="hero-title">${audienceToggle(ctx, 'me', {isPage: true, cls: 'audience--hero'})}<h1 id="hero-title">${esc(hero.heroTitle)} <span class="h1-alt">${esc(hero.heroTitleAlt)}</span></h1><p class="lede">${esc(hero.lede)}</p><div class="actions">${button(copy.common.meCta, L(ME_ENQUIRY))}<p class="note">${esc(hero.note)}</p></div>${crossLink(hero.cross, L('/'))}</section>
${liveWorkspace(m.command, ctx, kit)}
${handSection(f.hand)}
${feature('observe', f.observe, observeScene(f.observe, v.concept, ['clock-3', 'calendar-days', 'shield-check', 'globe']))}
${feature('team', f.team, teamScene(f.team.scene, v.concept, ['globe', 'hard-drive', 'calendar-days', 'chart-no-axes-combined']), true)}
${feature('always', f.always, alwaysScene(f.always, f.always, v.concept))}
${feature('gate', f.gate, gateScene(f.gate, live, v.concept, ['search', 'users', 'lock-keyhole']), true)}
<section class="visual visual--adapt hn-adapt" aria-labelledby="hn-adapt-title"><div class="wrap visual__grid"><div class="visual__head"><h2 id="hn-adapt-title">${esc(m.adapt.title)} <em>${esc(m.adapt.titleAlt)}</em></h2><p class="lede">${esc(v.adapt.sub)}</p></div>${workspaceDemo(ctx, v)}</div></section>
${closeBand(ctx, {title: hero.closeTitle, body: hero.closeBody, action: [copy.common.meCta, ME_ENQUIRY], cross: [hero.cross, '/']})}`;
}
