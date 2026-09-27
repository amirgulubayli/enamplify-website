import {esc, arrow, button, breadcrumb, photo} from '../components.mjs';

// Submitted values stay stable across languages (the server and `?interest=` links rely on them);
// only the visible labels (copy.contact.interests, same order) are translated.
const INTEREST_VALUES = ['Not sure yet', 'A diagnostic call', 'Team AI enablement', 'A custom AI build', 'Something else'];

export function contact(ctx) {
  const {site, copy, enquiryMode = 'email'} = ctx;
  const c = copy.contact;
  const server = enquiryMode === 'server';
  const privacy = `<a href="${ctx.href('/privacy/')}">${esc(c.privacyLink)}</a>`;
  return `${breadcrumb([[copy.routes.contact.crumb]], ctx)}
<section class="contact wrap">
<div class="contact__intro"><h1>${esc(c.title)}</h1>
<p class="lede">${esc(c.lede)}</p>
<h2>${esc(c.coverTitle)}</h2><ul class="ticks">${c.cover.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>${esc(c.afterTitle)}</h2><p>${esc(c.after)}</p>
<div class="actions">${button(c.chooseTime, site.bookingUrl, 'primary', 'target="_blank" rel="noopener noreferrer"')}</div><p class="small">${esc(c.calendarNote)}</p></div>
<div class="contact__form"><h2>${esc(c.formTitle)}</h2>
<form id="enquiry-form" action="mailto:${esc(site.email)}" method="post" enctype="text/plain" data-mode="${enquiryMode}" data-email="${esc(site.email)}" novalidate>
<div class="form-row"><label for="name">${esc(c.name)}<input id="name" name="name" autocomplete="name" required maxlength="100"></label><label for="email">${esc(c.email)}<input id="email" name="email" type="email" autocomplete="email" required maxlength="254"></label></div>
<label for="organisation">${esc(c.organisation)}<input id="organisation" name="organisation" autocomplete="organization" maxlength="160"></label>
<label for="interest">${esc(c.interest)}<select id="interest" name="interest">${INTEREST_VALUES.map((v, i) => `<option value="${esc(v)}">${esc(c.interests[i] ?? v)}</option>`).join('')}</select></label>
<label for="message">${esc(c.message)}<textarea id="message" name="message" rows="5" minlength="20" maxlength="4000" required></textarea></label>
<div class="hp-field" aria-hidden="true"><label for="website">${esc(c.honeypot)}<input id="website" name="website" tabindex="-1" autocomplete="off"></label></div>
<input name="startedAt" type="hidden">
<p class="small">${esc(c.confidential).replace('{link}', privacy)}</p>
<div id="form-errors" class="form-errors" role="alert" hidden></div>
<button class="btn btn--secondary" type="submit">${esc(server ? c.submitServer : c.submitEmail)}${arrow}</button>
<p class="small">${esc(server ? c.noteServer : c.noteEmail)}</p>
<div id="enquiry-result" class="enquiry-result" role="status" aria-live="polite" hidden></div>
</form><noscript><p>${esc(c.noscript).replace('{email}', `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`)}</p></noscript></div>
</section>
${photo('band-contact', ctx, {sizes: '100vw', cls: 'band band--close'})}`;
}
