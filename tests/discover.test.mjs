import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateEvent, processDiscovery} from '../api/discover.js';
import {summarise, dashboard, bookingEmail, createServer, STEPS} from '../server/discovery/server.mjs';
import {DISCOVER_STEPS} from '../src/pages/discover.mjs';

const event = (over = {}) => ({sid: 'abcd1234-ef', event: 'answer', step: 'work', index: 0, total: 7, answers: {work: ['reporting']}, locale: 'en', ...over});

test('the flow, the proxy and the service agree on the steps', () => {
  assert.deepEqual([...DISCOVER_STEPS.map(s => s.key), 'details', 'book'], STEPS);
});

test('events are validated and trimmed to known fields', () => {
  assert.ok(validateEvent(event()).data);
  assert.ok(validateEvent(event({website: 'spam'})).error, 'honeypot');
  assert.ok(validateEvent(event({event: 'drop'})).error);
  assert.ok(validateEvent(event({sid: 'x'})).error);
  const {data} = validateEvent(event({answers: {work: ['reporting', 7], name: ' Ada ', secret: 'no', note: 'x'.repeat(5000)}}));
  assert.deepEqual(data.answers.work, ['reporting']);
  assert.equal(data.answers.name, 'Ada');
  assert.equal(data.answers.secret, undefined);
  assert.equal(data.answers.note.length, 2000);
});

test('the proxy accepts and drops without an upstream, and forwards with the shared key when configured', async () => {
  const req = {method: 'POST', headers: {}, body: event()};
  assert.deepEqual(await processDiscovery(req, {env: {}}), {status: 202, body: {stored: false}});
  assert.equal((await processDiscovery({...req, method: 'GET'}, {env: {}})).status, 405);
  assert.equal((await processDiscovery(req, {env: {CONTACT_ALLOWED_ORIGIN: 'https://enamplify.com'}})).status, 403);
  let sent;
  const fetcher = async (url, init) => { sent = {url, init}; return {ok: true}; };
  const res = await processDiscovery(req, {env: {DISCOVERY_UPSTREAM: 'https://vps.example/', DISCOVERY_KEY: 'k'}, fetcher, now: 0});
  assert.deepEqual(res, {status: 202, body: {stored: true}});
  assert.equal(sent.url, 'https://vps.example/events');
  assert.equal(sent.init.headers['x-discovery-key'], 'k');
  assert.equal(JSON.parse(sent.init.body).at, '1970-01-01T00:00:00.000Z');
  const down = await processDiscovery(req, {env: {DISCOVERY_UPSTREAM: 'https://vps.example', DISCOVERY_KEY: 'k'}, fetcher: async () => { throw new Error('down'); }});
  assert.deepEqual(down, {status: 202, body: {stored: false}}, 'a tracking outage never fails the visitor');
});

test('with mail configured, the answers are emailed once the visitor leaves their details, without the tracking service', async () => {
  const env = {RESEND_API_KEY: 'r', CONTACT_FROM: 'Enamplify <a@b.co>', CONTACT_TO: 'c@d.co'};
  const sent = [];
  const fetcher = async (url, init) => { sent.push({url, init}); return {ok: true}; };
  const details = {method: 'POST', headers: {}, body: event({step: 'details', index: 5, answers: {name: 'Ada', email: 'ada@example.com', company: 'Lovelace Ltd', work: ['reporting'], workOwn: 'Month-end close', size: '11-50'}})};
  assert.deepEqual(await processDiscovery(details, {env, fetcher}), {status: 202, body: {stored: false, mailed: true}});
  assert.equal(sent.length, 1);
  const mail = JSON.parse(sent[0].init.body);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(sent[0].init.headers['Idempotency-Key'], 'discovery-abcd1234-ef', 'one email per session');
  assert.deepEqual([mail.to, mail.reply_to, mail.subject], [['c@d.co'], 'ada@example.com', 'Discovery answers: Ada, Lovelace Ltd']);
  assert.ok(mail.text.includes('Wants off the plate: reporting · Month-end close') && mail.text.includes('Team size: 11-50'));
  await processDiscovery({method: 'POST', headers: {}, body: event()}, {env, fetcher});
  assert.equal(sent.length, 1, 'earlier steps send nothing');
  const failing = await processDiscovery(details, {env, fetcher: async () => { throw new Error('down'); }});
  assert.deepEqual(failing, {status: 202, body: {stored: false}}, 'a mail outage never fails the visitor');
});

test('sessions are summarised into a funnel with drop-off, and the dashboard escapes what visitors typed', () => {
  const events = [
    {sid: 'a', at: '2026-11-12T10:00:00Z', event: 'view', step: 'work', index: 0, answers: {}, locale: 'en'},
    {sid: 'a', at: '2026-11-12T10:01:00Z', event: 'view', step: 'size', index: 1, answers: {work: ['reporting']}, locale: 'en'},
    {sid: 'b', at: '2026-11-12T11:00:00Z', event: 'view', step: 'work', index: 0, answers: {}, locale: 'az'},
    {sid: 'b', at: '2026-11-12T11:05:00Z', event: 'book', step: 'book', index: 6, answers: {name: '<b>Ada</b>', email: 'ada@example.com', work: ['documents'], size: '11-50'}, locale: 'az'}
  ];
  const s = summarise(events);
  assert.equal(s.started, 2);
  assert.equal(s.booked, 1);
  assert.deepEqual(s.funnel.map(f => f.reached), [2, 2, 1, 1, 1, 1, 1]);
  assert.equal(s.rows[0].sid, 'b');
  assert.equal(s.rows[1].step, 'size');
  const html = dashboard(s);
  assert.ok(html.includes('&lt;b&gt;Ada&lt;/b&gt;') && !html.includes('<b>Ada</b>'));
  assert.ok(html.includes('Left at 2. size') && html.includes('Went to book'));
  const mail = bookingEmail(s.rows[0]);
  assert.ok(mail.subject.includes('Ada') && mail.text.includes('Team size: 11-50') && mail.text.includes('Email: ada@example.com'));
});

test('the service stores keyed events, guards the dashboard and emails answers once on booking', async () => {
  const file = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'discovery-')), 'events.jsonl');
  const mails = [];
  const env = {DATA_FILE: file, DISCOVERY_KEY: 'k', ADMIN_USER: 'admin', ADMIN_PASSWORD: 'pw', RESEND_API_KEY: 'r', MAIL_FROM: 'a@b.co', MAIL_TO: 'c@d.co'};
  const server = createServer({env, fetcher: async (url, init) => { mails.push(JSON.parse(init.body)); return {ok: true}; }});
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body, key = 'k') => fetch(`${base}/events`, {method: 'POST', headers: {'content-type': 'application/json', 'x-discovery-key': key}, body: JSON.stringify(body)});
  try {
    assert.equal((await post(event(), 'wrong')).status, 401);
    assert.equal((await post(event())).status, 202);
    assert.equal(validateEvent(event({answers: {workOwn: ' Month-end close ', stage: ''}})).data.answers.workOwn, 'Month-end close');
    const book = event({event: 'book', step: 'book', index: 6, answers: {name: 'Ada', email: 'ada@example.com', work: ['reporting'], workOwn: 'Month-end close'}});
    assert.equal((await post(book)).status, 202);
    assert.equal((await post(book)).status, 202);
    assert.equal(mails.length, 1, 'one email per session');
    assert.equal(mails[0].reply_to, 'ada@example.com');
    assert.ok(mails[0].text.includes('Wants off the plate: reporting · Month-end close'));
    assert.equal((await fs.readFile(file, 'utf8')).trim().split('\n').length, 3);
    assert.equal((await fetch(`${base}/admin`)).status, 401);
    const admin = await fetch(`${base}/admin`, {headers: {authorization: `Basic ${Buffer.from('admin:pw').toString('base64')}`}});
    assert.equal(admin.status, 200);
    assert.ok((await admin.text()).includes('ada@example.com'));
  } finally {
    await new Promise(r => server.close(r));
  }
});
