import {esc, arrow, photo, button, ME_ENQUIRY, US_ENQUIRY} from '../components.mjs';
import {fill} from '../i18n.mjs';
import {workspaceDemo, setupWalkthrough} from './workspace-demo.mjs';

/* Nine visual chapters shared by Us and Me. All demonstrations are illustrative, not live
 * product controls. Replay restarts a bounded explanatory sequence; scenario tabs reveal original
 * workspace concepts. Contextual enquiry links use the real, offering-specific contact form.
 * No JavaScript and reduced-motion states show complete content without animation. */

const DOCS = {us: 'consulting-delivery', me: 'me-career'};
const SIZES = {
  main: '(min-width: 1360px) 980px, (min-width: 900px) 72vw, 90vw',
  doc: '(min-width: 1360px) 760px, (min-width: 900px) 56vw, calc(100vw - 56px)'
};
const file = (id, w) => `/images/workspaces/${id}-${w}.webp`;
// Local icon files (Lucide, wine stroke; provider-* are official marks). Each sits beside visible text.
const ico = name => `<img class="v-ico" src="/images/icons/${name}.svg" width="24" height="24" alt="" loading="lazy" decoding="async">`;
const bar = w => `<span class="v-bar" aria-hidden="true"><i class="v-w${w}"></i></span>`;
const st = (kind, text) => `<span class="v-st v-st--${kind}"><i aria-hidden="true"></i>${esc(text)}</span>`;

// Icons per connect group, aligned with copy groups[i].items[j].
const GROUPS = {
  us: [['calendar-days', 'mail', 'bell-ring'], ['files', 'folder-open', 'hard-drive'], ['contact-round', 'chart-no-axes-combined', 'network'], ['bot', 'brain-circuit', 'plug-zap']],
  me: [['calendar-days', 'mail', 'bell-ring'], ['files', 'folder-open', 'hard-drive'], ['globe', 'search', 'file-text'], ['bot', 'brain-circuit', 'plug-zap']]
};
const CORE = {us: 'users', me: 'lock-keyhole'};
// Repeated providers remain distinct accounts; show routing as a story, not an account ledger.
const PROVIDERS = [['openai', 'OpenAI'], ['openai', 'OpenAI'], ['anthropic', 'Anthropic'], ['gemini', 'Gemini']];
const MORE = [['deepseek', 'DeepSeek'], ['qwen', 'Qwen']];
const RAIL = {us: ['files', 'bot', 'brain-circuit', 'users'], me: ['files', 'bot', 'brain-circuit', 'lock-keyhole']};
const SOURCES = ['file-text', 'file-text', 'bot'];
const LANES = ['search', 'globe', 'folder-open', 'code-xml'];
const LANE_ST = ['ready', 'ready', 'running', 'queued'];
const PROGRESS = [100, 100, 70, 15];
const TRIGGERS = {us: ['bell-ring', 'clock-3', 'users'], me: ['bell-ring', 'clock-3', 'bot']};
const RUN_ST = ['running', 'approval', 'paused'];
const CONTROLS = ['shield-check', 'lock-keyhole', 'chart-no-axes-combined', ''];

/** An original workspace concept as a lazy responsive image with its localised descriptive alt. */
function shot(ctx, id, sizes) {
  const g = ctx.copy.common.gallery;
  const x = ctx.concepts.find(c => c.id === id);
  if (!x) throw new Error(`Unknown workspace concept: ${id}`);
  const srcset = [480, 960, 1536].map(w => `${file(id, w)} ${w}w`).join(', ');
  return `<img src="${file(id, 960)}" srcset="${srcset}" sizes="${sizes}" width="1536" height="1024" alt="${esc(fill(g.alt, {role: x.role, title: x.title, tabs: x.tabs.join(', ')}))}" loading="lazy" decoding="async">`;
}

const chapter = (key, v, body) => `<section class="visual visual--${key}" aria-labelledby="visual-${key}-title"><div class="wrap visual__grid"><div class="visual__head"><h2 id="visual-${key}-title">${esc(v.title)}</h2><p class="lede">${esc(v.sub)}</p></div>${body}</div></section>`;
const tag = (text, cls = '') => `<span class="v-tag${cls}">${esc(text)}</span>`;
const list = (items, fn, cls = '') => `<ul${cls ? ` class="${cls}"` : ''}>${items.map(fn).join('')}</ul>`;

export function workspaceStory(ctx, audience) {
  const who = audience === 'me' ? 'me' : 'us';
  const v = (who === 'me' ? ctx.copy.me : ctx.copy.home).visual;
  if (!v) return '';
  const doc = DOCS[who];
  const e = v.extension;
  const replay = `<button class="v-replay" type="button" data-demo-replay hidden>${ico('rotate-ccw')}<span>${esc(e.replay)}</span></button>`;
  const action = i => `<div class="v-action">${button(e.cta[i], ctx.href(who === 'me' ? ME_ENQUIRY : US_ENQUIRY), i === 2 ? 'inverse' : 'primary', 'data-enquiry')}</div>`;
  const withAction = (html, i) => html.replace('</div></section>', `${action(i)}</div></section>`);
  const {adapt: a, connect: n, accounts: m, context: c, agents: g, operate: o, place: p} = v;

  const adapt = chapter('adapt', a, workspaceDemo(ctx, v));

  // Constellation: the branded workspace at the centre, connected groups at the corners.
  const groups = list(n.groups, (x, i) => `<li class="v-con__g"><p>${esc(x.name)}</p>${list(x.items, (t, j) => `<li>${ico(GROUPS[who][i][j])}<span>${esc(t)}</span></li>`)}</li>`, 'v-con__groups');
  const connect = chapter('connect', n, `<figure class="v-con" data-demo><div class="v-con__map"><svg class="v-con__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M12 16C12 50 50 26 50 50M88 16C88 50 50 26 50 50M12 84C12 50 50 74 50 50M88 84C88 50 50 74 50 50" vector-effect="non-scaling-stroke"/></svg><p class="v-core">${ico(CORE[who])}<span><b>Enamplify</b><small>${esc(n.core)}</small></span></p>${groups}</div><figcaption class="v-note">${esc(n.note)}${replay}</figcaption></figure>`);

  // A constrained account hands the job to another; other accounts remain visible, without a table.
  const provider = (i, cls = '') => {const [id, name] = PROVIDERS[i];return `<div class="v-provider ${cls}">${ico(`provider-${id}`)}<p><strong>${name}</strong><small>${esc(m.kinds[i])}</small></p>${st(i === 2 ? 'limit' : 'ready', m.states[i === 2 ? 1 : 0])}</div>`;};
  const more = `<p class="v-more">${esc(m.more)}${MORE.map(([id, name]) => `<span>${ico(`provider-${id}`)}${name}</span>`).join('')}</p>`;
  const accounts = chapter('accounts', m, `<figure class="v-acct" data-demo><p class="v-routing-job">${esc(m.jobs[2])}</p><div class="v-routing">${provider(2, 'is-limit')}<svg class="v-routing__line" viewBox="0 0 160 40" aria-hidden="true"><path d="M2 20C55 -5 105 45 154 20M144 14L154 20 144 28"/></svg>${provider(1, 'is-fallback')}</div><p class="v-routing-caption">${esc(m.jobs[1])}${arrow}</p><div class="v-acct__others">${[0,3].map(i => `<div>${provider(i)}<p>${esc(m.jobs[i])}</p></div>`).join('')}</div>${more}<figcaption class="v-note">${esc(m.note)}${replay}</figcaption></figure>`);

  // Project window: what the workspace holds, and a draft whose lines point at their sources.
  const rail = list(c.rail, (t, i) => `<li${i ? '' : ' class="is-on"'}>${ico(RAIL[who][i])}${esc(t)}</li>`, 'v-rail');
  const lines = `<ul class="v-lines" aria-hidden="true">${[100, 70, 40].map((w, i) => `<li><i class="v-w${w}"></i><sup>${i + 1}</sup></li>`).join('')}</ul>`;
  const sources = `<ol class="v-src">${c.sources.map((s, i) => `<li>${ico(SOURCES[i])}${esc(s)}</li>`).join('')}</ol>`;
  const io = `<p class="v-io">${tag(c.status, ' v-tag--wine')}<span>${ico('check')}${esc(c.io[0])}</span><span>${ico('file-text')}${esc(c.io[1])}</span></p>`;
  const memory = chapter('context', c, `<figure class="v-ctx" data-demo><div class="v-win"><p class="v-win__bar"><span>${ico('folder-open')}${esc(c.project)}</span>${tag(v.concept)}</p><div class="v-win__body">${rail}<div class="v-page"><p class="v-page__t">${esc(c.doc)}</p>${lines}${sources}${io}</div></div></div><figcaption class="v-note">${esc(c.note)}${replay}</figcaption></figure>`);

  // Agent team: one objective, specialists in parallel, merged into a draft that waits for review.
  const lanes = list(g.lanes, ([role, task], i) => `<li class="v-lane">${ico(LANES[i])}<span><strong>${esc(role)}</strong>${esc(task)}</span>${st(LANE_ST[i], g.states[i])}${bar(PROGRESS[i])}</li>`, 'v-lanes');
  const agents = chapter('agents', g, `<figure class="v-team" data-demo><div class="v-team__work"><p class="v-obj">${ico('workflow')}<span><small>${esc(g.objectiveLabel)}</small>${esc(g.objective)}</span></p>${lanes}<p class="v-hand">${ico('git-branch')}${esc(g.handoff)}</p></div><div class="v-doc">${shot(ctx, doc, SIZES.doc)}${tag(v.concept)}${tag(g.result, ' v-tag--wine v-doc__ready')}</div>${replay}</figure>`);

  // Operations console: three kinds of start, a queue, a review step, and the controls around them.
  const col = (h, body, cls = '') => `<div class="v-ops__col${cls}"><p class="v-ops__h">${esc(h)}</p>${body}</div>`;
  const to = `<span class="v-ops__to" aria-hidden="true">${arrow}</span>`;
  const starts = list(o.triggers, ([k, t], i) => `<li>${ico(TRIGGERS[who][i])}<span><small>${esc(k)}</small>${esc(t)}</span></li>`);
  const queue = list(o.runs, ([job, s], i) => `<li><span>${esc(job)}</span>${st(RUN_ST[i], s)}</li>`);
  const review = `${tag(o.result, ' v-tag--wine')}<p class="v-ops__who">${ico('shield-check')}${esc(o.approver)}</p>`;
  const controls = list(o.controls, (t, i) => `<li>${CONTROLS[i] ? ico(CONTROLS[i]) : '<i class="v-pause" aria-hidden="true"></i>'}${esc(t)}${i === 2 ? bar(40) : ''}</li>`, 'v-ctl');
  const operate = chapter('operate', o, `<figure class="v-ops" data-demo>${tag(v.concept)}<div class="v-ops__flow">${col(o.cols[0], starts)}${to}${col(o.cols[1], queue)}${to}${col(o.cols[2], review, ' v-ops__out')}</div>${controls}${replay}</figure>`);

  // One retained environment: browser research and code produce files for a person to review.
  const b = e.sandbox;
  const pane = (icon, title, contents, cls) => `<div class="v-sandbox__pane ${cls}"><h3>${ico(icon)}${esc(title)}</h3>${contents}</div>`;
  const browser = `<div class="v-browser">${list(b.browser, (t, i) => `<li>${ico(i === 0 ? 'search' : 'check')}<span>${esc(t)}</span></li>`)}</div>`;
  const code = `<ol class="v-code">${b.code.map((t, i) => `<li><code>${esc(t)}</code></li>`).join('')}</ol>`;
  const files = list(b.files, (t, i) => `<li${i === 2 ? ' class="v-sandbox__result"' : ''}>${ico(i === 2 ? 'folder-check' : 'file-text')}<span>${esc(t)}</span></li>`, 'v-sandbox__files');
  const sandbox = chapter('sandbox', b, `<figure class="v-sandbox" data-demo><div class="v-sandbox__frame"><p class="v-sandbox__task"><span>${esc(b.task)}</span>${tag(v.concept)}</p><div class="v-sandbox__panes">${pane('globe', b.views[0], browser, 'v-sandbox__browser')}${pane('terminal', b.views[1], code, 'v-sandbox__code')}${pane('files', b.views[2], files, 'v-sandbox__output')}</div><ol class="v-retain">${b.states.map((t, i) => `<li>${ico(['pause', 'hard-drive', 'play'][i])}<span>${esc(t)}</span></li>`).join('')}</ol></div><figcaption class="v-note">${esc(b.note)}${replay}</figcaption></figure>`);

  const x = e.examples;
  const tabs = x.items.map((item, i) => `<button type="button" role="tab" id="example-tab-${i}" aria-controls="example-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-example-tab>${esc(item.label)}</button>`).join('');
  const panels = x.items.map((item, i) => `<div class="v-example" id="example-panel-${i}" role="tabpanel" aria-labelledby="example-tab-${i}" tabindex="0" data-example-panel${i ? ' hidden' : ''}><div class="v-example__image">${shot(ctx, item.id, SIZES.main)}${tag(v.concept)}</div><div class="v-example__story"><h3>${esc(item.request)}</h3><ol>${item.steps.map(t => `<li>${esc(t)}${arrow}</li>`).join('')}</ol><p class="v-example__result">${ico('check')}${esc(item.result)}</p></div></div>`).join('');
  const proofSlugs = ['marketing-agency-workflows', 'pr-agency-workflows', 'clinical-trial-operations'];
  const proof = who === 'us' ? `<div class="v-proof"><h3>${esc(x.proof)}</h3><ul>${proofSlugs.map(slug => {const c = ctx.cases.find(c => c.slug === slug); return `<li><a href="${ctx.href(`/work/${slug}/`)}"><span>${esc(c.sector)}</span><span>${esc(x.proofLink)}${arrow}</span></a></li>`;}).join('')}</ul></div>` : '';
  const examples = chapter('examples', x, `<div class="v-examples" data-examples><div class="v-example-tabs" role="tablist" aria-label="${esc(x.label)}" hidden>${tabs}</div>${panels}<p class="v-note">${esc(x.concept)}</p>${proof}</div>`);

  const place = chapter('place', p, `<div class="v-city">${photo('hero-london', ctx, {sizes: '(min-width: 1360px) 490px, (min-width: 900px) 38vw, 56vw', cls: 'visual-city__photo'})}${photo('hero-baku', ctx, {sizes: '(min-width: 1360px) 350px, (min-width: 900px) 27vw, 40vw', cls: 'visual-city__photo'})}</div>`);

  const story = who === 'us'
    ? [withAction(adapt, 0), setupWalkthrough(ctx, who), withAction(examples, 3), agents, operate, connect, withAction(accounts, 1), memory, withAction(sandbox, 2), place]
    : [withAction(adapt, 0), setupWalkthrough(ctx, who), withAction(examples, 3), connect, withAction(accounts, 1), memory, agents, withAction(sandbox, 2), operate, place];
  return story.join('\n');
}

