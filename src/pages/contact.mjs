import {esc, arrow, button, breadcrumb} from '../components.mjs';

const interests = ['A diagnostic call', 'Team AI enablement', 'A custom AI build', 'Something else'];

export function contact({site, enquiryMode = 'email'}) {
  const server = enquiryMode === 'server';
  return `${breadcrumb([['Book a call']])}
<section class="contact wrap">
<div class="contact__intro"><h1>Book a diagnostic call.</h1>
<p class="lede">Thirty minutes with Amir, the founder, about your team and the work you’d like to change. No pitch deck, and no automated follow-up sequence.</p>
<h2>What we’ll cover</h2><ul class="ticks"><li>Where your team’s time goes today</li><li>Where AI is already being used, officially or not</li><li>Whether a diagnostic would be worth it, and what it would look at</li></ul>
<h2>What happens after</h2><p>If there’s a fit, you get a short written proposal for a diagnostic. If there isn’t, we’ll say so and point you somewhere useful.</p>
<div class="actions">${button('Choose a time', site.bookingUrl, 'primary', 'target="_blank" rel="noopener noreferrer"')}</div><p class="small">Opens our booking calendar in a new tab.</p></div>
<div class="contact__form"><h2>Prefer to write?</h2>
<form id="enquiry-form" action="mailto:${esc(site.email)}" method="post" enctype="text/plain" data-mode="${enquiryMode}" data-email="${esc(site.email)}" novalidate>
<div class="form-row"><label for="name">Your name<input id="name" name="name" autocomplete="name" required maxlength="100"></label><label for="email">Work email<input id="email" name="email" type="email" autocomplete="email" required maxlength="254"></label></div>
<label for="organisation">Organisation<input id="organisation" name="organisation" autocomplete="organization" maxlength="160"></label>
<label for="interest">What would you like to talk about?<select id="interest" name="interest"><option value="Not sure yet">Not sure yet</option>${interests.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('')}</select></label>
<label for="message">A little about the work<textarea id="message" name="message" rows="5" minlength="20" maxlength="4000" required></textarea></label>
<div class="hp-field" aria-hidden="true"><label for="website">Leave this blank<input id="website" name="website" tabindex="-1" autocomplete="off"></label></div>
<input name="startedAt" type="hidden">
<p class="small">Please don’t include confidential information. Read our <a href="/privacy/">privacy note</a>.</p>
<div id="form-errors" class="form-errors" role="alert" hidden></div>
<button class="btn btn--secondary" type="submit">${server ? 'Send your note' : 'Prepare your note'}${arrow}</button>
<p class="small">${server ? 'Your note goes straight to Amir. You are not subscribed to anything.' : 'This prepares a message in your email app. Nothing is sent until you choose to send it.'}</p>
<div id="enquiry-result" class="enquiry-result" role="status" aria-live="polite" hidden></div>
</form><noscript><p>Please email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p></noscript></div>
</section>`;
}
