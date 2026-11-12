(() => {
  const root = document.querySelector('[data-flow]');
  if (!root) return;
  const q = s => root.querySelector(s);
  const form = q('[data-flow-form]'), steps = [...root.querySelectorAll('[data-step]')];
  const bar = q('[data-flow-bar]'), count = q('[data-flow-count]'), back = q('[data-flow-back]'), next = q('[data-flow-next]'), error = q('[data-flow-error]');
  const answers = {};
  let i = 0, sid;
  try { sid = sessionStorage.getItem('flow-sid') || crypto.randomUUID(); sessionStorage.setItem('flow-sid', sid); } catch { sid = `s${Date.now()}${Math.random().toString(36).slice(2)}`; }

  // Fire-and-forget: tracking must never block or break the flow.
  function send(event) {
    try {
      fetch(root.dataset.endpoint, {method: 'POST', headers: {'content-type': 'application/json'}, keepalive: true,
        body: JSON.stringify({sid, event, step: steps[i].dataset.step, index: i, total: steps.length, answers, locale: document.documentElement.lang, website: answers.website || ''})}).catch(() => {});
    } catch { /* offline or blocked */ }
  }

  function read() {
    const step = steps[i], key = step.dataset.step;
    if (key === 'details') {
      for (const el of step.querySelectorAll('input,textarea')) answers[el.name] = el.value.trim();
      if (!answers.name || !/^\S+@[^\s@]+\.[^\s@]+$/.test(answers.email)) { error.textContent = error.dataset.details; return false; }
      return true;
    }
    const picked = [...step.querySelectorAll('input:checked')].map(el => el.value);
    if (!picked.length) { error.textContent = error.dataset.choice; return false; }
    answers[key] = step.hasAttribute('data-multi') ? picked : picked[0];
    return true;
  }

  function summary() {
    const list = q('[data-flow-summary]');
    list.textContent = '';
    for (const step of steps) {
      const labels = [...step.querySelectorAll('input:checked')].map(el => el.parentElement.textContent.trim());
      if (!labels.length) continue;
      const li = document.createElement('li'), b = document.createElement('strong');
      b.textContent = step.querySelector('legend').textContent;
      li.append(b, ` ${labels.join(', ')}`);
      list.append(li);
    }
  }

  function show(n, focus = true) {
    i = n;
    const last = n === steps.length - 1;
    steps.forEach((s, k) => { s.hidden = k !== n; });
    back.hidden = n === 0 || last;
    next.hidden = last;
    error.hidden = true;
    count.textContent = root.dataset.count.replace('{n}', n + 1).replace('{total}', steps.length);
    bar.style.transform = `scaleX(${(n + 1) / steps.length})`;
    if (last) summary();
    if (focus) (steps[n].querySelector('h2') || steps[n].querySelector('input'))?.focus({preventScroll: true});
    send('view');
  }

  next.addEventListener('click', () => {
    if (!read()) { error.hidden = false; return; }
    send('answer');
    show(i + 1);
  });
  back.addEventListener('click', () => show(i - 1));
  // A single-choice question moves on as soon as it is answered.
  form.addEventListener('change', e => { if (e.target.type === 'radio') setTimeout(() => next.click(), 220); });
  form.addEventListener('submit', e => { e.preventDefault(); next.click(); });
  q('[data-flow-book]').addEventListener('click', () => send('book'));

  form.hidden = false;
  q('[data-flow-top]').hidden = false;
  show(0, false);
})();
