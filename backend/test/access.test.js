import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedEmail } from '../src/access.js';

const prod = { ALLOWED_EMAILS: 'william@headswap.com', ALLOWED_DOMAINS: 'matpro.swiss' };

test('William is the only Headswap person allowed', () => {
  assert.equal(isAllowedEmail('william@headswap.com', prod), true);
  assert.equal(isAllowedEmail(' William@Headswap.com ', prod), true);
  assert.equal(isAllowedEmail('james@headswap.com', prod), false);
  assert.equal(isAllowedEmail('cipo@headswap.com', prod), false);
});

test("Matpro's people are allowed by domain, look-alikes are not", () => {
  assert.equal(isAllowedEmail('sal@matpro.swiss', prod), true);
  assert.equal(isAllowedEmail('SAL@MATPRO.SWISS', prod), true);
  assert.equal(isAllowedEmail('x@evil-matpro.swiss', prod), false);
  assert.equal(isAllowedEmail('x@matpro.swiss.evil.com', prod), false);
  assert.equal(isAllowedEmail('someone@gmail.com', prod), false);
  assert.equal(isAllowedEmail('', prod), false);
});

test('with no list set, sign-up stays open for local development', () => {
  assert.equal(isAllowedEmail('anyone@example.com', {}), true);
});
