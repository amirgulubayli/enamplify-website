import {esc, arrow, breadcrumb} from '../components.mjs';

/*
 * The discovery flow: a few questions about the work, the visitor's details, then the booking
 * link. One question shows at a time (assets/discover.js); each step is reported to
 * /api/discover so drop-off and answers can be reviewed. Option values are stable English keys;
 * only the labels are translated. Without scripts the page points to the enquiry form instead.
 */
export const DISCOVER_STEPS = [
  {key: 'work', multi: true, values: ['reporting', 'followups', 'documents', 'delivery', 'operations', 'other'], icons: ['chart-no-axes-combined', 'mail', 'file-text', 'folder-check', 'workflow', 'brain-circuit']},
  {key: 'size', values: ['1-10', '11-50', '51-200', '201-2000', '2000+'], icons: ['contact-round', 'users', 'users', 'network', 'globe']},
  {key: 'stage', values: ['none', 'chat', 'pilots', 'daily'], icons: ['pause', 'bot', 'play', 'cpu']},
  {key: 'data', multi: true, values: ['regulated', 'confidential', 'onprem', 'none'], icons: ['shield-check', 'lock-keyhole', 'server', 'check']},
  {key: 'timing', values: ['now', 'soon', 'exploring'], icons: ['clock-3', 'calendar-days', 'search']}
];

const ico = name => `<img class="v-ico" src="/images/icons/${name}.svg" width="22" height="22" alt="" decoding="async">`;

export function discover(ctx) {
  const {site, copy} = ctx;
  const d = copy.discover;
  const choice = s => {
    const q = d.steps[s.key];
    const options = s.values.map((v, i) => `<label class="flow__opt"><input type="${s.multi ? 'checkbox' : 'radio'}" name="${s.key}" value="${esc(v)}">${ico(s.icons[i])}<span>${esc(q.options[i])}</span></label>`).join('');
    return `<fieldset class="flow__step" data-step="${s.key}"${s.multi ? ' data-multi' : ''} hidden><legend>${esc(q.q)}</legend>${q.hint ? `<p class="flow__hint">${esc(q.hint)}</p>` : ''}<div class="flow__opts">${options}</div></fieldset>`;
  };
  const f = d.steps.details, b = d.steps.book;
  const privacy = `<a href="${ctx.href('/privacy/')}">${esc(d.privacyLink)}</a>`;
  const details = `<fieldset class="flow__step" data-step="details" hidden><legend>${esc(f.q)}</legend><div class="flow__fields">
<label for="flow-name">${esc(f.name)}<input id="flow-name" name="name" autocomplete="name" required maxlength="100"></label>
<label for="flow-email">${esc(f.email)}<input id="flow-email" name="email" type="email" autocomplete="email" required maxlength="254"></label>
<label for="flow-company">${esc(f.company)}<input id="flow-company" name="company" autocomplete="organization" maxlength="160"></label>
<label for="flow-note">${esc(f.note)}<textarea id="flow-note" name="note" rows="3" maxlength="2000"></textarea></label>
<div class="hp-field" aria-hidden="true"><label for="flow-website">${esc(copy.contact.honeypot)}<input id="flow-website" name="website" tabindex="-1" autocomplete="off"></label></div>
</div><p class="small">${esc(d.privacy).replace('{link}', privacy)}</p></fieldset>`;
  const book = `<div class="flow__step flow__book" data-step="book" hidden><h2 tabindex="-1">${esc(b.q)}</h2><p class="lede">${esc(b.body)}</p><a class="btn btn--primary" href="${esc(site.bookingUrl)}" target="_blank" rel="noopener noreferrer" data-flow-book>${esc(b.cta)}${arrow}</a><h3>${esc(b.summary)}</h3><ul class="flow__summary" data-flow-summary></ul></div>`;

  return `${breadcrumb([[copy.routes.discover.crumb]], ctx)}
<section class="flow wrap" data-flow data-endpoint="/api/discover/" data-count="${esc(d.count)}">
<h1 class="sr-only">${esc(d.title)}</h1>
<div class="flow__top" hidden data-flow-top><p class="flow__count" data-flow-count aria-live="polite"></p><div class="flow__bar" aria-hidden="true"><i data-flow-bar></i></div></div>
<form class="flow__form" novalidate hidden data-flow-form>
${DISCOVER_STEPS.map(choice).join('\n')}
${details}
${book}
<p class="flow__error" role="alert" hidden data-flow-error data-choice="${esc(d.required)}" data-details="${esc(d.detailsError)}"></p>
<div class="flow__nav"><button class="btn btn--quiet" type="button" data-flow-back hidden>${esc(d.back)}</button><button class="btn btn--primary" type="button" data-flow-next>${esc(d.next)}${arrow}</button></div>
</form>
<noscript><p class="lede">${esc(d.noscript).replace('{link}', `<a href="${ctx.href('/contact/')}#enquiry">${esc(d.noscriptLink)}</a>`)}</p></noscript>
</section>`;
}
