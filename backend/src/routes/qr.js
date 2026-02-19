import { Router } from 'express';
import multer from 'multer';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';
import {
  validatePayload,
  generateQrBillBuffer,
  mergeQrBillIntoInvoice,
} from '../services/qrBill.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'));
    }
  },
});

// Helper — shared response logic once we have an output buffer
async function sendResponse(req, res, outputBuffer, filename) {
  const useBase64 = req.query.format === 'base64';

  if (useBase64) {
    return res.json({
      pdf: outputBuffer.toString('base64'),
      filename,
      mimeType: 'application/pdf',
      size: outputBuffer.length,
      encoding: 'base64',
    });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(outputBuffer);
}

// ─── POST /api/generate (multipart/form-data) ────────────────────────────────
// Original endpoint — accepts a JSON string in the `data` field + optional PDF
// Used for: direct API calls, Postman, PDF append use case
router.post('/generate', apiKeyAuth, upload.single('pdf'), async (req, res) => {
  let payload;

  try {
    const raw = req.body.data;
    if (!raw) {
      return res.status(400).json({ error: '\'data\' field (JSON string) is required' });
    }
    payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON in \'data\' field' });
  }

  const errors = validatePayload(payload);
  if (errors.length > 0) {
    return res.status(422).json({ error: 'Validation failed', details: errors });
  }

  try {
    const qrBuffer = await generateQrBillBuffer(payload);
    let outputBuffer, filename;

    if (req.file) {
      outputBuffer = await mergeQrBillIntoInvoice(req.file.buffer, qrBuffer);
      filename = 'qr-bill-invoice.pdf';
    } else {
      outputBuffer = qrBuffer;
      filename = 'qr-bill.pdf';
    }

    await sendResponse(req, res, outputBuffer, filename);
  } catch (err) {
    if (err.name === 'ValidationError' || err.code?.startsWith('CREDITOR') || err.code?.startsWith('DEBTOR') || err.code?.startsWith('AMOUNT') || err.code?.startsWith('REFERENCE')) {
      return res.status(422).json({ error: 'QR bill validation failed', details: err.message });
    }
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate QR bill' });
  }
});

// ─── POST /api/generate/json ──────────────────────────────────────────────────
// Structured JSON endpoint for Salesforce External Services / Flow
// Accepts application/json with fully typed nested fields
// Always returns base64 JSON — no binary PDF, no file upload
router.post('/generate/json', apiKeyAuth, async (req, res) => {
  // Map the flat Salesforce-friendly structure into our internal payload format
  const b = req.body;

  const payload = {
    creditor: {
      account:        b.creditorAccount,
      name:           b.creditorName,
      street:         b.creditorStreet,
      buildingNumber: b.creditorBuildingNumber,
      postalCode:     b.creditorPostalCode,
      city:           b.creditorCity,
      country:        b.creditorCountry,
    },
    payment: {
      amount:               b.amount,
      currency:             b.currency,
      referenceType:        b.referenceType || 'NON',
      reference:            b.reference,
      unstructuredMessage:  b.unstructuredMessage,
    },
    language: b.language || 'EN',
  };

  // Debtor is optional — only include if name provided
  if (b.debtorName) {
    payload.debtor = {
      name:           b.debtorName,
      street:         b.debtorStreet,
      buildingNumber: b.debtorBuildingNumber,
      postalCode:     b.debtorPostalCode,
      city:           b.debtorCity,
      country:        b.debtorCountry,
    };
  }

  const errors = validatePayload(payload);
  if (errors.length > 0) {
    return res.status(422).json({ error: 'Validation failed', details: errors });
  }

  try {
    const qrBuffer = await generateQrBillBuffer(payload);

    let outputBuffer, filename;

    // Optional: if a base64-encoded invoice PDF is provided, append the QR slip to it
    if (b.pdfBase64) {
      try {
        const invoiceBuffer = Buffer.from(b.pdfBase64, 'base64');
        outputBuffer = await mergeQrBillIntoInvoice(invoiceBuffer, qrBuffer);
        filename = 'invoice-with-qr-bill.pdf';
      } catch {
        return res.status(400).json({ error: 'Invalid base64 PDF in pdfBase64 field' });
      }
    } else {
      outputBuffer = qrBuffer;
      filename = 'qr-bill.pdf';
    }

    // Always return base64 JSON for this endpoint
    return res.json({
      pdf: outputBuffer.toString('base64'),
      filename,
      mimeType: 'application/pdf',
      size: outputBuffer.length,
      encoding: 'base64',
    });
  } catch (err) {
    if (err.name === 'ValidationError' || err.code?.startsWith('CREDITOR') || err.code?.startsWith('DEBTOR') || err.code?.startsWith('AMOUNT') || err.code?.startsWith('REFERENCE')) {
      return res.status(422).json({ error: 'QR bill validation failed', details: err.message });
    }
    console.error('Generate JSON error:', err);
    res.status(500).json({ error: 'Failed to generate QR bill' });
  }
});

export default router;
