(() => {
  const el = document.querySelector('[data-live]');
  if (!el) return;
  const q = s => el.querySelector(s), qa = s => [...el.querySelectorAll(s)];
  const D = JSON.parse(q('[data-lv-data]').textContent);
  const lv = q('.lv'), body = q('.lv-body'), tabs = qa('[data-lv-tab]'), typed = q('[data-lv-type]');
  const btn = q('.lv-approve'), btnText = q('[data-lv-btn]'), cur = q('.lv-cursor'), state = q('[data-lv-state]'), pause = q('[data-lv-pause]');
  const agents = qa('.lv-agents li'), boards = qa('[data-lv-board]'), add = q('.lv-add'), addText = q('[data-lv-add]');
  const L = lv.dataset, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let token = 0, halt = false, seen = true, i = 0;

  const wait = (ms, t) => new Promise((res, rej) => {
    let left = ms, last = performance.now();
    const iv = setInterval(() => {
      const now = performance.now();
      if (t !== token) { clearInterval(iv); rej(); return; }
      if (!halt && seen && !document.hidden) left -= now - last;
      last = now;
      if (left <= 0) { clearInterval(iv); res(); }
    }, 16);
  });

  function select(n) {
    i = n;
    tabs.forEach((tab, k) => { tab.setAttribute('aria-selected', String(k === n)); tab.tabIndex = k === n ? 0 : -1; });
  }
  function fill(m) {
    q('[data-lv-msg]').textContent = m.d;
    agents.forEach((li, k) => { li.querySelector('img').src = `/images/icons/${m.a[k][0]}.svg`; li.querySelector('span').textContent = m.a[k][1]; });
    q('[data-lv-title]').textContent = m.v;
    boards.forEach((b, k) => { b.hidden = k !== i; });
    q('[data-lv-tip]').textContent = m.s;
    q('[data-lv-artifact]').textContent = m.r;
    q('[data-lv-approver]').textContent = m.p;
  }
  function rest() {
    lv.className = 'lv';
    agents.forEach(li => li.classList.add('is-done'));
    state.textContent = L.approved; btnText.textContent = L.approved; addText.textContent = add.dataset.added; typed.textContent = '';
  }
  const done = k => agents[k].classList.add('is-done');

  async function play(t) {
    try {
      for (;;) {
        const m = D[i];
        lv.classList.add('is-swap');
        await wait(280, t);
        fill(m);
        lv.className = 'lv is-live';
        agents.forEach(li => li.classList.remove('is-done'));
        state.textContent = L.working; btnText.textContent = L.approve; addText.textContent = add.dataset.add; typed.textContent = '';
        const o = body.getBoundingClientRect();
        cur.style.transform = `translate(${o.width * .5}px,${o.height + 30}px)`;
        await wait(450, t);
        lv.classList.add('s0');
        for (let k = 2; k < m.d.length + 2; k += 2) { typed.textContent = m.d.slice(0, k); await wait(26, t); }
        await wait(420, t);
        typed.textContent = ''; lv.classList.remove('s0'); lv.classList.add('s1');
        await wait(520, t); lv.classList.add('s2');
        await wait(1000, t); lv.classList.add('s3'); done(0);
        await wait(800, t); done(1);
        await wait(700, t); done(2);
        await wait(600, t); done(3); lv.classList.add('s4'); state.textContent = L.ready;
        await wait(900, t);
        const b = btn.getBoundingClientRect(), r = body.getBoundingClientRect();
        cur.style.transform = `translate(${b.left - r.left + b.width / 2}px,${b.top - r.top + b.height / 2}px)`;
        lv.classList.add('s5');
        await wait(950, t);
        lv.classList.add('s6'); state.textContent = L.approved; btnText.textContent = L.approved;
        await wait(900, t);
        lv.classList.add('s7'); addText.textContent = add.dataset.added;
        await wait(3400, t);
        select((i + 1) % D.length);
      }
    } catch { /* superseded by a newer run */ }
  }

  function go(n, focus) {
    select(n);
    if (focus) tabs[n].focus({preventScroll: true});
    token++;
    if (reduced) { fill(D[n]); rest(); return; }
    play(token);
  }
  tabs.forEach((tab, k) => {
    tab.addEventListener('click', () => go(k));
    tab.addEventListener('keydown', e => {
      const n = {ArrowRight: k + 1, ArrowLeft: k - 1, Home: 0, End: tabs.length - 1}[e.key];
      if (n === undefined) return;
      e.preventDefault();
      go((n + tabs.length) % tabs.length, true);
    });
  });
  if (reduced) return;
  pause.hidden = false;
  pause.addEventListener('click', () => {
    halt = !halt;
    lv.classList.toggle('is-halted', halt);
    pause.setAttribute('aria-pressed', String(halt));
    pause.setAttribute('aria-label', halt ? pause.dataset.play : pause.dataset.pause);
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { seen = es.some(x => x.isIntersecting); }, {threshold: .2}).observe(lv);
  play(token);
})();

(() => {
  const scenes = [...document.querySelectorAll('[data-fx]')];
  if (!scenes.length || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const timers = new Map();
  const play = el => { el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on'); };
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const el = e.target, every = +el.dataset.fx;
    clearInterval(timers.get(el));
    if (!e.isIntersecting) return;
    play(el);
    if (every) timers.set(el, setInterval(() => { if (!document.hidden) play(el); }, every));
    else io.unobserve(el);
  }), {threshold: .35});
  scenes.forEach(el => io.observe(el));
})();

// Me waitlist. A form confirms only once the endpoint says the address reached the list.
(() => {
  const forms = [...document.querySelectorAll('[data-waitlist-form]')];
  forms.forEach(f => {
    const q = s => f.querySelector(s), email = q('[name=email]'), msg = q('[data-waitlist-msg]'), btn = q('button');
    const say = (text, bad) => { msg.textContent = text; msg.hidden = false; msg.classList.toggle('is-error', bad); };
    email.oninput = () => { email.removeAttribute('aria-invalid'); msg.hidden = true; };
    f.onsubmit = async e => {
      e.preventDefault();
      if (q('[name=website]').value) return;
      const val = email.value.trim();
      if (!/^\S+@[^\s@]+\.[^\s@]+$/.test(val)) { say(f.dataset.errEmail, true); email.setAttribute('aria-invalid', 'true'); email.focus(); return; }
      btn.disabled = true;
      let ok = false;
      try {
        const res = await fetch('/api/subscribe/', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: val, locale: document.documentElement.lang, source: location.pathname, list: 'me-waitlist'}), signal: AbortSignal.timeout(10000)});
        const d = res.ok && await res.json();
        ok = d && d.ok && d.configured;
      } catch {}
      if (!ok) { btn.disabled = false; return say(f.dataset.fail, true); }
      forms.forEach(g => { g.querySelector('.waitlist__row').hidden = true; const m = g.querySelector('[data-waitlist-msg]'); m.textContent = g.dataset.done; m.className = 'waitlist__msg'; m.hidden = false; });
    };
  });
})();
