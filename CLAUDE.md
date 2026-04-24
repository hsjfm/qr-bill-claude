# qr-bill-claude

Swiss QR-bill generator. Node/Express backend (Railway) + Next.js frontend (Vercel). Consumed by the Matpro Salesforce org as a Named Credential callout.

## Deployments

- **Backend (Railway):** https://qr-bill-claude-production.up.railway.app
  - Auto-deploys from `main` on push. Root directory: `backend/`.
  - Health: `GET /health`
  - Main endpoints: `POST /api/generate` (multipart), `POST /api/generate/json` (base64 JSON). Both require `X-Api-Key`.
- **Frontend (Vercel):** URL not yet captured — grab from Vercel dashboard and add here.
  - Auto-deploys from `main`. Root directory: `frontend/`.

## Debug credentials

A test API key lives in `.claude/debug.env` (gitignored). Source it before running curl:

```bash
set -a; source .claude/debug.env; set +a
curl -sS -H "X-Api-Key: $QR_BILL_API_KEY" https://qr-bill-claude-production.up.railway.app/health
```

If the key is missing or rotated, refresh it from the Matpro Salesforce Named Credential:

```bash
sf project retrieve start -o qr-bill-org -m NamedCredential:QRBillAPI \
  --target-metadata-dir /tmp/qrbill-nc --unzip
grep -E 'parameterValue|Url' /tmp/qrbill-nc/unpackaged/unpackaged/namedCredentials/QRBillAPI.namedCredential
```

The Salesforce org alias is `qr-bill-org` (username `sal@matpro.swiss`) — already authed via `sf`.

## Triggering a redeploy

Railway auto-deploys on push to `main`. To force a redeploy without code changes:

```bash
git commit --allow-empty -m "chore: trigger Railway redeploy" && git push origin main
```

Vercel behaves the same way.

## Billing / dashboards

- Railway: https://railway.app/account/billing
- Vercel: https://vercel.com/account/billing
