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

    let outputBuffer;
    if (req.file) {
      outputBuffer = await mergeQrBillIntoInvoice(req.file.buffer, qrBuffer);
    } else {
      outputBuffer = qrBuffer;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-bill${req.file ? '-invoice' : ''}.pdf"`
    );
    res.send(outputBuffer);
  } catch (err) {
    if (err.name === 'ValidationError' || err.code?.startsWith('CREDITOR') || err.code?.startsWith('DEBTOR') || err.code?.startsWith('AMOUNT') || err.code?.startsWith('REFERENCE')) {
      return res.status(422).json({ error: 'QR bill validation failed', details: err.message });
    }
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Failed to generate QR bill' });
  }
});

export default router;
