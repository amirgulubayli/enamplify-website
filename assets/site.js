/* Enamplify · progressive enhancement, no trackers or persistent browser storage. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Visible strings come from the page (<script id="ui-strings">) in its own language; English if absent.
  const T = {menu: 'Menu', close: 'Close', copied: 'Copied', copyFallback: 'Select and copy this text', printPlaceholder: '_'.repeat(64),
    clearConfirm: 'Clear the notes on this page? This cannot be undone.', errName: 'Please add your name.', errEmail: 'Please add a valid email address.',
    errMessage: 'Please add at least 20 characters about the work.', errHeading: 'A few details need your attention:', mailSubject: 'Enamplify enquiry · {interest}',
    mailGreeting: 'Hello Amir,', mailName: 'Name', mailEmail: 'Email', mailOrganisation: 'Organisation', mailInterest: 'Interested in', mailNotSupplied: 'Not supplied',
    readyTitle: 'Your note is ready. You choose when to send it.', readyBody: 'Open the message in your email app, or copy it into your preferred email service. It has not been sent by this website.',
    openMail: 'Open my email app', copyMessage: 'Copy the message', sending: 'Sending your enquiry…', sentTitle: 'Your enquiry has been sent.',
    sentBody: 'Thank you for the context. Amir will review your note and reply personally.', timeout: 'The request timed out. Please email us directly rather than submitting twice.',
    unconfirmed: 'The enquiry could not be confirmed as sent.', reachDirect: 'You can reach Amir directly at {email}.'};
  try { Object.assign(T, JSON.parse($('#ui-strings')?.textContent || '{}')); } catch { /* keep English */ }
  const fill = (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));

  // Navigation is a standard document navigation, not a simulated application router.
  const toggle = $('.menu-toggle');
  const menu = $('#mobile-menu');
  let previousFocus;
  function setMenu(open) {
    if (!menu || !toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    menu.inert = !open;
    document.body.classList.toggle('menu-open', open);
    $('.menu-label').textContent = open ? T.close : T.menu;
    if (open) {
      previousFocus = document.activeElement;
      requestAnimationFrame(() => $('a', menu)?.focus());
    } else if (previousFocus && document.activeElement && menu.contains(document.activeElement)) {
      toggle.focus();
    }
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { e.preventDefault(); setMenu(false); toggle.focus(); }
    if (e.key === 'Tab') {
      const focusables = [toggle, ...$$('a[href],button:not([disabled])', menu)];
      const first = focusables[0], last = focusables.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width: 1001px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  // A missing remote asset never substitutes a generated likeness or fake evidence.
  $$('.remote-image').forEach(img => {
    const loaded = () => {
      const good = img.complete && img.naturalWidth > 0;
      img.classList.toggle('is-loaded', good);
      img.classList.toggle('is-unavailable', !good);
      img.closest('figure')?.classList.toggle('image-unavailable', !good);
      img.closest('figure')?.classList.toggle('has-image', good);
    };
    img.addEventListener('load', loaded);
    img.addEventListener('error', loaded);
    if (img.complete) loaded();
  });

  // Clipboard enhancement has a visible, selectable fallback instead of a silent failure.
  async function copyText(text, trigger) {
    const previous = trigger?.textContent;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (trigger) { trigger.textContent = T.copied; setTimeout(() => { trigger.textContent = previous; }, 2200); }
      return true;
    } catch {
      const existing = $('#copy-fallback');
      existing?.remove();
      const box = document.createElement('textarea');
      box.id = 'copy-fallback'; box.className = 'copy-fallback'; box.value = text;
      box.setAttribute('aria-label', T.copyFallback);
      trigger?.insertAdjacentElement('afterend', box);
      box.focus(); box.select();
      return false;
    }
  }
  $('[data-copy-link]')?.addEventListener('click', e => copyText(document.querySelector('link[rel="canonical"]')?.href || location.href, e.currentTarget));

  // Notes are ephemeral. Print lays them out as text so long answers are not clipped.
  function preparePrint() {
    $$('.worksheet input, .worksheet textarea').forEach(field => {
      if (field.nextElementSibling?.classList.contains('print-value')) return;
      const value = document.createElement('div');
      value.className = 'print-value';
      value.textContent = field.value || T.printPlaceholder;
      field.insertAdjacentElement('afterend', value);
    });
  }
  function finishPrint() { $$('.print-value').forEach(n => n.remove()); }
  window.addEventListener('beforeprint', preparePrint);
  window.addEventListener('afterprint', finishPrint);
  $$('[data-print]').forEach(btn => btn.addEventListener('click', () => { preparePrint(); window.print(); }));
  $('[data-clear-notes]')?.addEventListener('click', () => {
    const fields = $$('.worksheet input, .worksheet textarea');
    if (fields.some(f => f.value) && !window.confirm(T.clearConfirm)) return;
    fields.forEach(f => f.value = '');
    fields[0]?.focus();
  });

  const form = $('#enquiry-form');
  if (form) {
    const startedAt = $('[name="startedAt"]', form);
    startedAt.value = String(Date.now());
    const wanted = new URLSearchParams(location.search).get('interest');
    const select = $('#interest');
    if (wanted && [...select.options].some(o => o.value === wanted)) select.value = wanted;
    const errors = $('#form-errors');
    const result = $('#enquiry-result');
    const submit = $('button[type="submit"]', form);
    form.addEventListener('input', e => e.target.removeAttribute('aria-invalid'));
    form.addEventListener('submit', async e => {
      e.preventDefault();
      result.hidden = true; errors.hidden = true; errors.replaceChildren();
      const data = Object.fromEntries(new FormData(form));
      const problems = [];
      for (const [name,message] of [['name',T.errName],['email',T.errEmail],['message',T.errMessage]]) {
        const field = $(`[name="${name}"]`, form);
        const trimmed = field.value.trim();
        const bad = !trimmed || !field.validity.valid || (name === 'message' && trimmed.length < 20) || (name === 'email' && !/^\S+@[^\s@]+\.[^\s@]+$/.test(trimmed));
        if (bad) { problems.push([field, message]); field.setAttribute('aria-invalid','true'); }
        data[name] = trimmed;
      }
      if (problems.length) {
        const heading = document.createElement('p'); heading.textContent = T.errHeading; errors.append(heading);
        const list = document.createElement('ul');
        problems.forEach(([field,message]) => { const li=document.createElement('li'); const a=document.createElement('a'); a.href=`#${field.id}`; a.textContent=message; a.addEventListener('click',()=>field.focus()); li.append(a); list.append(li); });
        errors.append(list); errors.hidden=false; problems[0][0].focus(); return;
      }
      const subject = fill(T.mailSubject, {interest: data.interest});
      const body = `${T.mailGreeting}\n\n${data.message}\n\n${T.mailName}: ${data.name}\n${T.mailEmail}: ${data.email}\n${T.mailOrganisation}: ${data.organisation || T.mailNotSupplied}\n${T.mailInterest}: ${data.interest}\n`;
      if (form.dataset.mode !== 'server') {
        const heading = document.createElement('h3'); heading.textContent = T.readyTitle;
        const paragraph = document.createElement('p'); paragraph.textContent = T.readyBody;
        const mail = document.createElement('a'); mail.className = 'btn btn--primary'; mail.textContent = T.openMail; mail.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'link-arrow'; copy.textContent = T.copyMessage; copy.addEventListener('click',()=>copyText(`To: ${form.dataset.email}\nSubject: ${subject}\n\n${body}`,copy));
        const preview = document.createElement('pre'); preview.className = 'message-preview'; preview.textContent = body;
        result.replaceChildren(heading, paragraph, preview, mail, copy); result.hidden = false;
        result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
        return;
      }
      const originalLabel = submit.innerHTML;
      submit.disabled = true; submit.textContent = T.sending;
      try {
        const response = await fetch('/api/enquiry', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(16000)});
        const payload = await response.json();
        if (!response.ok || payload.ok !== true) throw new Error(payload.error || 'The enquiry could not be sent.');
        const h = document.createElement('h3'); h.textContent = T.sentTitle;
        const p = document.createElement('p'); p.textContent = T.sentBody;
        result.replaceChildren(h,p); result.hidden=false; form.reset(); startedAt.value=String(Date.now());
      } catch (error) {
        errors.textContent = `${error.name === 'TimeoutError' ? T.timeout : T.unconfirmed} ${fill(T.reachDirect, {email: form.dataset.email})}`;
        errors.hidden=false;
      } finally { submit.disabled=false; submit.innerHTML=originalLabel; window.turnstile?.reset(); }
    });
  }
  // Exhibits below the first viewport draw their marks once on arrival; anything already in view never waits.
  const later = $$('.exhibit').filter(ex => ex.getBoundingClientRect().top > innerHeight);
  if (later.length && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('is-pending');
      io.unobserve(entry.target);
    }), {rootMargin: '0px 0px -12% 0px'});
    later.forEach(ex => { ex.classList.add('is-pending'); io.observe(ex); });
  }

  document.documentElement.dataset.enamplifyReady = 'true';
})();
