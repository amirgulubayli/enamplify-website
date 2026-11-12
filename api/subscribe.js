export function validateSubscription(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error: 'A valid subscription request is required.'};
  if (input.website) return {error: 'The request could not be accepted.'};
  const get = (key, max) => typeof input[key] === 'string' ? input[key].trim().slice(0, max + 1) : '';
  const email = get('email', 254).toLowerCase();
  const locale = get('locale', 12) || 'en';
  const source = get('source', 200) || '/';
  if (!email || email.length > 254 || !/^\S+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email)) {
    return {error: 'Please supply a valid email address.'};
  }
  if (/[\r\n]/.test(locale) || /[\r\n]/.test(source)) {
    return {error: 'Invalid request metadata.'};
  }
  return {data: {email, locale, source}};
}

/**
 * Subscribes an email to Kit (ConvertKit) API v4 when KIT_API_KEY is configured,
 * and optionally attaches the subscriber to KIT_FORM_ID and/or KIT_TAG_ID.
 */
export async function processSubscription({method, headers, body}, {env = process.env, fetcher = fetch} = {}) {
  if (method !== 'POST') return {status: 405, body: {error: 'Use POST.'}};
  if (env.CONTACT_ALLOWED_ORIGIN) {
    const origins = env.CONTACT_ALLOWED_ORIGIN.split(',').map(x => x.trim()).filter(Boolean);
    const origin = headers?.origin || headers?.Origin;
    if (origins.length && (!origin || !origins.includes(origin))) {
      return {status: 403, body: {error: 'This origin is not allowed.'}};
    }
  }
  if (!String(headers?.['content-type'] || '').includes('application/json')) {
    return {status: 415, body: {error: 'Send JSON.'}};
  }
  if (Buffer.byteLength(JSON.stringify(body || {})) > 4096) {
    return {status: 413, body: {error: 'The request is too large.'}};
  }
  const {data, error} = validateSubscription(body);
  if (error) return {status: 400, body: {error}};

  if (!env.KIT_API_KEY) {
    return {status: 202, body: {ok: true, configured: false}};
  }

  const kitHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Kit-Api-Key': env.KIT_API_KEY
  };

  try {
    const createRes = await fetcher('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: kitHeaders,
      body: JSON.stringify({
        email_address: data.email,
        state: 'active'
      }),
      signal: AbortSignal.timeout(7000)
    });
    if (!createRes.ok) {
      return {status: 502, body: {error: 'Subscription could not be confirmed.'}};
    }
    if (env.KIT_FORM_ID) {
      await fetcher(`https://api.kit.com/v4/forms/${encodeURIComponent(env.KIT_FORM_ID)}/subscribers`, {
        method: 'POST',
        headers: kitHeaders,
        body: JSON.stringify({email_address: data.email}),
        signal: AbortSignal.timeout(5000)
      }).catch(() => {});
    }
    if (env.KIT_TAG_ID) {
      await fetcher(`https://api.kit.com/v4/tags/${encodeURIComponent(env.KIT_TAG_ID)}/subscribers`, {
        method: 'POST',
        headers: kitHeaders,
        body: JSON.stringify({email_address: data.email}),
        signal: AbortSignal.timeout(5000)
      }).catch(() => {});
    }
    return {status: 202, body: {ok: true, configured: true}};
  } catch {
    return {status: 502, body: {error: 'Subscription could not be confirmed.'}};
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') res.setHeader('Allow', 'POST');
  try {
    let body = req.body;
    if (typeof body === 'string') {
      if (Buffer.byteLength(body) > 4096) {
        res.statusCode = 413;
        res.end(JSON.stringify({error: 'The request is too large.'}));
        return;
      }
      body = JSON.parse(body);
    } else if (body === undefined) {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 4096) {
          res.statusCode = 413;
          res.end(JSON.stringify({error: 'The request is too large.'}));
          return;
        }
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }
    const response = await processSubscription({method: req.method, headers: req.headers, body});
    res.statusCode = response.status;
    res.end(JSON.stringify(response.body));
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({error: 'The request could not be read.'}));
  }
}
