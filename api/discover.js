/*
 * Receives discovery-flow events from the site and forwards them to the tracking service on the
 * VPS (server/discovery/server.mjs). The browser only ever talks to this same-origin endpoint,
 * so the VPS address and its shared key stay out of the page. With no upstream configured the
 * event is accepted and dropped: the flow itself never depends on tracking.
 */
const EVENTS = ['view', 'answer', 'book'];
const FIELDS = ['work', 'size', 'stage', 'data', 'timing', 'workOwn', 'sizeOwn', 'stageOwn', 'dataOwn', 'timingOwn', 'name', 'email', 'company', 'note'];
const text = (v, max) => typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max) : '';

export function validateEvent(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error: 'A valid event is required.'};
  if (input.website) return {error: 'The event could not be accepted.'};
  const sid = text(input.sid, 64), event = text(input.event, 12), step = text(input.step, 24);
  if (!/^[A-Za-z0-9-]{8,64}$/.test(sid) || !EVENTS.includes(event) || !/^[a-z]{2,24}$/.test(step)) return {error: 'The event is not valid.'};
  const index = Number(input.index), total = Number(input.total);
  if (!Number.isInteger(index) || index < 0 || index > 20 || !Number.isInteger(total) || total < 1 || total > 21) return {error: 'The event is not valid.'};
  const answers = {};
  const given = input.answers && typeof input.answers === 'object' && !Array.isArray(input.answers) ? input.answers : {};
  for (const key of FIELDS) {
    const v = given[key];
    if (Array.isArray(v)) answers[key] = v.slice(0, 12).map(x => text(x, 40)).filter(Boolean);
    else if (text(v, 2000)) answers[key] = text(v, key === 'note' ? 2000 : 254);
  }
  return {data: {sid, event, step, index, total, answers, locale: text(input.locale, 12) || 'en'}};
}

const LABELS = [['work', 'Wants off the plate'], ['size', 'Team size'], ['stage', 'AI today'], ['data', 'Plan around'], ['timing', 'Timing']];

/** The plain-text email for one completed set of answers: choices first, then the visitor's own words. */
export function leadEmail(a) {
  const show = v => Array.isArray(v) ? v.join(', ') : v;
  const lines = [['Name', a.name], ['Email', a.email], ['Company', a.company], ...LABELS.map(([k, label]) => [label, [show(a[k]), a[`${k}Own`]].filter(v => v?.length).join(' · ')]), ['Note', a.note]].filter(([, v]) => v?.length);
  return {subject: `Discovery answers: ${a.name || 'someone'}${a.company ? `, ${a.company}` : ''}`, text: `${lines.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nThey have reached the booking step. Check the calendar for a slot.`};
}

export async function processDiscovery({method, headers, body}, {env = process.env, fetcher = fetch, now = Date.now()} = {}) {
  if (method !== 'POST') return {status: 405, body: {error: 'Use POST.'}};
  if (env.CONTACT_ALLOWED_ORIGIN) {
    const origin = headers.origin || headers.Origin;
    if (!origin || !env.CONTACT_ALLOWED_ORIGIN.split(',').map(x => x.trim()).includes(origin)) return {status: 403, body: {error: 'This origin is not allowed.'}};
  }
  const {data, error} = validateEvent(body);
  if (error) return {status: 400, body: {error}};
  // Once the visitor has left their details, email the answers straight from here when mail is
  // configured, so a lead is never lost for want of the tracking service. One email per session.
  let mailed = false;
  if (data.event === 'answer' && data.step === 'details' && data.answers.email && env.RESEND_API_KEY && env.CONTACT_FROM && env.CONTACT_TO) {
    try {
      const res = await fetcher('https://api.resend.com/emails', {
        method: 'POST',
        headers: {Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `discovery-${data.sid}`},
        body: JSON.stringify({from: env.CONTACT_FROM, to: [env.CONTACT_TO], reply_to: data.answers.email, ...leadEmail(data.answers)}),
        signal: AbortSignal.timeout(5000)
      });
      mailed = res.ok;
    } catch { /* the visitor still reaches the calendar */ }
  }
  if (!env.DISCOVERY_UPSTREAM || !env.DISCOVERY_KEY) return {status: 202, body: {stored: false, ...(mailed && {mailed})}};
  try {
    const res = await fetcher(`${env.DISCOVERY_UPSTREAM.replace(/\/$/, '')}/events`, {
      method: 'POST',
      headers: {'content-type': 'application/json', 'x-discovery-key': env.DISCOVERY_KEY},
      body: JSON.stringify({...data, at: new Date(now).toISOString()}),
      signal: AbortSignal.timeout(4000)
    });
    return {status: 202, body: {stored: res.ok}};
  } catch {
    return {status: 202, body: {stored: false}};
  }
}

export default async function handler(req, res) {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    else if (body === undefined) {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 8192) { res.statusCode = 413; res.end(JSON.stringify({error: 'The request is too large.'})); return; }
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }
    const response = await processDiscovery({method: req.method, headers: req.headers, body});
    res.statusCode = response.status;
    res.end(JSON.stringify(response.body));
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({error: 'The request could not be read.'}));
  }
}
