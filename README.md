# Swiss QR Bill API

Generate SIX Swiss Payment Standards v2.3 compliant QR payment slips via a simple REST API. Optionally append the QR slip to an existing invoice PDF.

## Architecture

```
qr-bill-claude/
├── backend/      Node.js + Express  →  Deploy on Railway
└── frontend/     Next.js 15         →  Deploy on Vercel
```

## Local development

### Prerequisites
- Node.js 20+
- PostgreSQL (local or Docker)

### Backend

```bash
cd backend
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET
npm install
npm run dev                 # starts on :3001
```

### Frontend

```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:3001
npm install
npm run dev                 # starts on :3000
```

---

## API Reference

### Authentication (dashboard users)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account → returns JWT |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Current user (JWT required) |

### API Key management (JWT required)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/keys` | List active keys |
| POST | `/api/keys` | Generate new key (returned once) |
| DELETE | `/api/keys/:id` | Revoke a key |

### Generate QR bill (`X-Api-Key` required)

```
POST /api/generate
Content-Type: multipart/form-data

data   (required)  JSON string — payment data
pdf    (optional)  PDF file — invoice to append QR slip to
```

**Response:** `application/pdf`
- Without `pdf`: standalone QR slip (A4, 105mm slip at bottom)
- With `pdf`: invoice pages + QR slip page appended

### `data` field schema

```json
{
  "creditor": {
    "account": "CH44 3199 9123 0008 8901 2",
    "name": "Headswap SA",
    "street": "Avenue de Tivoli",
    "buildingNumber": "24",
    "postalCode": "1007",
    "city": "Lausanne",
    "country": "CH"
  },
  "debtor": {
    "name": "Max Muster",
    "street": "Bahnhofstrasse",
    "buildingNumber": "1",
    "postalCode": "8001",
    "city": "Zürich",
    "country": "CH"
  },
  "payment": {
    "amount": 1250.00,
    "currency": "CHF",
    "referenceType": "NON",
    "reference": "",
    "unstructuredMessage": "Invoice 2025-001"
  },
  "language": "EN"
}
```

`referenceType`: `NON` | `QRR` | `SCOR`
`currency`: `CHF` | `EUR`
`language`: `EN` | `DE` | `FR` | `IT`
`debtor` and `amount` are optional.

### Example curl

```bash
# Standalone QR slip
curl -X POST https://YOUR_API_URL/api/generate \
  -H "X-Api-Key: YOUR_KEY" \
  -F 'data={"creditor":{"account":"CH44 3199 9123 0008 8901 2","name":"Headswap SA","street":"Avenue de Tivoli","buildingNumber":"24","postalCode":"1007","city":"Lausanne","country":"CH"},"payment":{"amount":1250,"currency":"CHF","referenceType":"NON","unstructuredMessage":"Invoice 2025-001"}}' \
  --output qr-slip.pdf

# Appended to invoice
curl -X POST https://YOUR_API_URL/api/generate \
  -H "X-Api-Key: YOUR_KEY" \
  -F 'data={"creditor":{...},"payment":{...}}' \
  -F 'pdf=@invoice.pdf' \
  --output invoice-with-qr.pdf
```

---

## Deployment

### Railway (backend)

1. Create a Railway project
2. Add **PostgreSQL** addon — `DATABASE_URL` is auto-injected
3. Add service from GitHub repo, set **Root Directory** to `backend/`
4. Set environment variables:
   ```
   JWT_SECRET=<long random string>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Railway detects `Dockerfile` and builds automatically

### Vercel (frontend)

1. Import GitHub repo on Vercel
2. Set **Root Directory** to `frontend/`
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```
4. Deploy — subsequent pushes to `main` auto-deploy

---

## QR Bill standard

- SIX Swiss Payment Standards v2.3
- Receipt section: 62mm wide
- Payment part: 148mm wide
- Total slip height: 105mm (bottom of A4)
- QR code: 46×46mm
- Perforated separator line included
- Multilingual: DE / FR / IT / EN
