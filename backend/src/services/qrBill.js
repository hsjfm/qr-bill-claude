import PDFDocument from 'pdfkit';
import { SwissQRBill } from 'swissqrbill/pdf';
import { PDFDocument as PdfLib } from 'pdf-lib';

const LANGUAGES = new Set(['DE', 'FR', 'IT', 'EN']);
const CURRENCIES = new Set(['CHF', 'EUR']);
const REF_TYPES = new Set(['QRR', 'SCOR', 'NON']);

export function validatePayload(body) {
  const errors = [];

  if (!body.creditor) errors.push('creditor is required');
  else {
    if (!body.creditor.account) errors.push('creditor.account (IBAN) is required');
    if (!body.creditor.name) errors.push('creditor.name is required');
    if (!body.creditor.street) errors.push('creditor.street is required');
    if (!body.creditor.city) errors.push('creditor.city is required');
    if (!body.creditor.postalCode) errors.push('creditor.postalCode is required');
    if (!body.creditor.country) errors.push('creditor.country is required');
  }

  if (!body.payment) errors.push('payment is required');
  else {
    const { currency, referenceType } = body.payment;
    if (!CURRENCIES.has(currency)) errors.push('payment.currency must be CHF or EUR');
    if (referenceType && !REF_TYPES.has(referenceType)) {
      errors.push('payment.referenceType must be QRR, SCOR, or NON');
    }
  }

  return errors;
}

export async function generateQrBillBuffer(payload) {
  const { creditor, debtor, payment, language = 'EN' } = payload;

  const lang = LANGUAGES.has(language?.toUpperCase()) ? language.toUpperCase() : 'EN';
  const refType = payment.referenceType || 'NON';

  const data = {
    currency: payment.currency,
    creditor: {
      account: creditor.account.replace(/\s/g, ''),
      name: creditor.name,
      address: creditor.street,
      buildingNumber: creditor.buildingNumber || '',
      city: creditor.city,
      zip: parseInt(creditor.postalCode, 10) || creditor.postalCode,
      country: creditor.country,
    },
  };

  if (payment.amount != null && payment.amount !== '') {
    data.amount = parseFloat(payment.amount);
  }

  if (refType !== 'NON' && payment.reference) {
    data.reference = payment.reference;
  }

  if (payment.unstructuredMessage) {
    data.message = payment.unstructuredMessage;
  }

  if (debtor?.name) {
    data.debtor = {
      name: debtor.name,
      address: debtor.street || '',
      buildingNumber: debtor.buildingNumber || '',
      city: debtor.city || '',
      zip: parseInt(debtor.postalCode, 10) || debtor.postalCode || 0,
      country: debtor.country || 'CH',
    };
  }

  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({ size: 'A4', autoFirstPage: false });
    const chunks = [];
    pdf.on('data', (c) => chunks.push(c));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    try {
      const qrBill = new SwissQRBill(data, { language: lang });
      qrBill.attachTo(pdf);
      pdf.end();
    } catch (err) {
      reject(err);
    }
  });
}

export async function mergeQrBillIntoInvoice(invoiceBuffer, qrBillBuffer) {
  const invoice = await PdfLib.load(invoiceBuffer);
  const qr = await PdfLib.load(qrBillBuffer);
  const [qrPage] = await invoice.copyPages(qr, [0]);
  invoice.addPage(qrPage);
  return Buffer.from(await invoice.save());
}
