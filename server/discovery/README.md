# Discovery funnel service

Stores the site's discovery-flow events, serves the funnel dashboard and emails a visitor's
answers when they click through to book. One file, no dependencies, Node 22 or newer.

## Run on the VPS

```bash
DISCOVERY_KEY=<long random string> ADMIN_USER=admin ADMIN_PASSWORD=<password> \
DATA_FILE=/var/lib/enamplify/discovery-events.jsonl \
RESEND_API_KEY=<key> MAIL_FROM="Enamplify <hello@enamplify.com>" MAIL_TO=<your inbox> \
node server.mjs
```

It listens on `127.0.0.1:8787` (`HOST` and `PORT` change that). Put it behind the VPS's web
server on an HTTPS hostname and keep it running with systemd or pm2. Leave the three mail
variables out to run without the booking email.

## Connect the site

Set these in the Vercel project, then redeploy:

- `DISCOVERY_UPSTREAM`: the service's HTTPS address, for example `https://funnel.example.com`
- `DISCOVERY_KEY`: the same value as on the VPS

Until both are set, `/api/discover` accepts events and discards them; the flow still works.

## Use

- Dashboard: `https://<host>/admin` (browser asks for the admin user and password)
- Health check: `https://<host>/health`
- Data: one JSON object per line in `DATA_FILE`; back that file up, or delete it to start over
