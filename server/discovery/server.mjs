/*
 * Discovery-flow tracking service. Runs on the VPS; no dependencies (Node 22+).
 *
 *   POST /events   one funnel event from the site's /api/discover proxy (x-discovery-key required)
 *   GET  /admin    funnel and sessions dashboard (HTTP Basic auth)
 *   GET  /health   liveness
 *
 * Events are appended to a JSON-lines file, one per line, and the dashboard is computed from it.
 * When a visitor clicks through to book, their answers are emailed once via Resend.
 *
 * Environment: DISCOVERY_KEY, ADMIN_USER, ADMIN_PASSWORD (all required); PORT (8787),
 * HOST (127.0.0.1), DATA_FILE (./discovery-events.jsonl); RESEND_API_KEY, MAIL_FROM, MAIL_TO
 * (optional, for the booking email).
 */
import http from 'node:http';
import fs from 'node:fs/promises';
import {timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const STEPS = ['work', 'size', 'stage', 'data', 'timing', 'details', 'book'];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const show = v => Array.isArray(v) ? v.join(', ') : v;
// A question's answer: the choices picked, then anything the visitor typed in their own words.
const both = (a, k) => [show(a[k]), a[`${k}Own`]].filter(v => v?.length).join(' · ');

/** One row per visitor session: how far they got, what they answered, whether they went to book. */
export function summarise(events) {
  const sessions = new Map();
  for (const e of events) {
    const s = sessions.get(e.sid) ?? {sid: e.sid, first: e.at, last: e.at, reached: 0, step: e.step, answers: {}, booked: false, locale: e.locale};
    s.last = e.at;
    if (e.index >= s.reached) { s.reached = e.index; s.step = e.step; }
    Object.assign(s.answers, e.answers);
    if (e.event === 'book') s.booked = true;
    sessions.set(e.sid, s);
  }
  const rows = [...sessions.values()].sort((a, b) => String(b.last).localeCompare(String(a.last)));
  const funnel = STEPS.map((step, i) => ({step, reached: rows.filter(s => s.reached >= i).length}));
  return {rows, funnel, started: rows.length, booked: rows.filter(s => s.booked).length};
}

export function dashboard({rows, funnel, started, booked}) {
  const top = Math.max(1, started);
  const bars = funnel.map((f, i) => {
    const pct = Math.round(f.reached / top * 100), lost = i ? funnel[i - 1].reached - f.reached : 0;
    return `<tr><th>${i + 1}. ${esc(f.step)}</th><td><meter min="0" max="${top}" value="${f.reached}"></meter></td><td>${f.reached}</td><td>${pct}%</td><td>${lost ? `−${lost}` : ''}</td></tr>`;
  }).join('');
  const sessions = rows.map(s => `<tr><td>${esc(String(s.last).replace('T', ' ').slice(0, 16))}</td><td>${s.booked ? 'Went to book' : `Left at ${s.reached + 1}. ${esc(s.step)}`}</td><td>${esc(s.answers.name)}<br>${esc(s.answers.email)}<br>${esc(s.answers.company)}</td><td>${['work', 'size', 'stage', 'data', 'timing', 'note'].filter(k => both(s.answers, k)).map(k => `<b>${k}</b> ${esc(both(s.answers, k))}`).join('<br>')}</td><td>${esc(s.locale)}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Discovery funnel</title><style>
body{margin:0;padding:32px 20px;background:#f3eee5;color:#242321;font:15px/1.5 system-ui,sans-serif}main{max-width:1100px;margin:auto}h1{font:400 34px/1.1 Georgia,serif;margin:0 0 4px}h2{font:400 22px Georgia,serif;margin:40px 0 12px}
table{width:100%;border-collapse:collapse;background:#faf7f1}th,td{padding:10px 12px;border-bottom:1px solid #d6ccbf;text-align:left;vertical-align:top}th{font-weight:500}meter{width:100%;min-width:160px;height:14px}
.k{display:flex;gap:32px;margin:20px 0}.k b{display:block;font:400 30px Georgia,serif}.scroll{overflow-x:auto}
</style></head><body><main><h1>Discovery funnel</h1><p>Every visitor who opened the flow, newest first.</p>
<div class="k"><p><b>${started}</b>started</p><p><b>${funnel[5]?.reached ?? 0}</b>reached details</p><p><b>${booked}</b>went to book</p></div>
<h2>Where people stop</h2><div class="scroll"><table><thead><tr><th>Step</th><th>Reached</th><th>Count</th><th>Of started</th><th>Lost here</th></tr></thead><tbody>${bars}</tbody></table></div>
<h2>Sessions</h2><div class="scroll"><table><thead><tr><th>Last seen (UTC)</th><th>Outcome</th><th>Contact</th><th>Answers</th><th>Lang</th></tr></thead><tbody>${sessions || '<tr><td colspan="5">No sessions yet.</td></tr>'}</tbody></table></div>
</main></body></html>`;
}

export function bookingEmail(session) {
  const a = session.answers;
  const lines = [['Name', a.name], ['Email', a.email], ['Company', a.company], ['Wants off the plate', both(a, 'work')], ['Team size', both(a, 'size')], ['AI today', both(a, 'stage')], ['Plan around', both(a, 'data')], ['Timing', both(a, 'timing')], ['Note', a.note]].filter(([, v]) => v?.length);
  return {subject: `Discovery answers: ${a.name || 'someone'}${a.company ? `, ${a.company}` : ''} went to book`, text: `${lines.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nThey clicked through to the booking calendar at ${session.last}. Check the calendar for the slot.`};
}

export function createServer({env = process.env, fetcher = fetch} = {}) {
  const file = env.DATA_FILE || './discovery-events.jsonl';
  const load = async () => (await fs.readFile(file, 'utf8').catch(() => '')).split('\n').filter(Boolean).flatMap(l => { try { return [JSON.parse(l)]; } catch { return []; } });
  const mailed = new Set();

  return http.createServer(async (req, res) => {
    const send = (status, body, type = 'application/json; charset=utf-8', headers = {}) => { res.writeHead(status, {'content-type': type, 'cache-control': 'no-store', ...headers}); res.end(body); };
    try {
      const url = new URL(req.url, 'http://x');
      if (url.pathname === '/health') return send(200, '{"ok":true}');
      if (url.pathname === '/events' && req.method === 'POST') {
        if (!env.DISCOVERY_KEY || !same(req.headers['x-discovery-key'] ?? '', env.DISCOVERY_KEY)) return send(401, '{"error":"unauthorised"}');
        let raw = '';
        for await (const chunk of req) { raw += chunk; if (raw.length > 16384) return send(413, '{"error":"too large"}'); }
        const e = JSON.parse(raw);
        if (typeof e.sid !== 'string' || !STEPS.includes(e.step)) return send(400, '{"error":"invalid"}');
        const event = {at: e.at || new Date().toISOString(), sid: e.sid.slice(0, 64), event: String(e.event).slice(0, 12), step: e.step, index: Number(e.index) || 0, answers: e.answers && typeof e.answers === 'object' ? e.answers : {}, locale: String(e.locale || 'en').slice(0, 12)};
        await fs.appendFile(file, `${JSON.stringify(event)}\n`);
        if (event.event === 'book' && !mailed.has(event.sid) && env.RESEND_API_KEY && env.MAIL_FROM && env.MAIL_TO) {
          mailed.add(event.sid);
          const session = summarise(await load()).rows.find(s => s.sid === event.sid);
          const {subject, text} = bookingEmail(session);
          await fetcher('https://api.resend.com/emails', {method: 'POST', headers: {authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json'}, body: JSON.stringify({from: env.MAIL_FROM, to: [env.MAIL_TO], reply_to: session.answers.email || undefined, subject, text})}).catch(() => {});
        }
        return send(202, '{"stored":true}');
      }
      if (url.pathname === '/admin' && req.method === 'GET') {
        const [user, ...rest] = Buffer.from((req.headers.authorization || '').replace(/^Basic /, ''), 'base64').toString().split(':');
        if (!env.ADMIN_PASSWORD || !same(user, env.ADMIN_USER || 'admin') || !same(rest.join(':'), env.ADMIN_PASSWORD)) return send(401, 'Sign in required.', 'text/plain; charset=utf-8', {'www-authenticate': 'Basic realm="Discovery funnel"'});
        return send(200, dashboard(summarise(await load())), 'text/html; charset=utf-8');
      }
      send(404, '{"error":"not found"}');
    } catch {
      send(400, '{"error":"bad request"}');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const key of ['DISCOVERY_KEY', 'ADMIN_PASSWORD']) if (!process.env[key]) { console.error(`${key} is required.`); process.exit(1); }
  const port = Number(process.env.PORT) || 8787, host = process.env.HOST || '127.0.0.1';
  createServer().listen(port, host, () => console.log(`Discovery service on http://${host}:${port}`));
}
