import assert from 'node:assert/strict'
import { test } from 'node:test'
import { indiaToday, validateLead, priceBreakdown, passMessage } from '../lib/trust.ts'

const now = new Date('2026-10-20T20:00:00Z')
const base = { name: 'Test Buyer', phone: '9876543210', request_id: 'efefefef-1234-4234-8234-123456789abc', property_id: 'aaaaaaaa-1234-4234-8234-123456789abc' }

test('visit date validation uses India calendar and rejects impossible and past dates', () => {
  assert.equal(indiaToday(now), '2026-10-21')
  assert.equal(validateLead({ ...base, visit_date: '2026-10-21' }, now).phone, '+919876543210')
  for (const visit_date of ['2026-10-20', '2026-02-30', '2027-12-01', 'not-a-date']) {
    assert.throws(() => validateLead({ ...base, visit_date }, now))
  }
})
test('server input validation rejects forged IDs and non-string contact fields', () => {
  for (const patch of [{ name: '' }, { phone: '123' }, { phone: {} }, { request_id: 'bad' }, { property_id: 'bad' }]) {
    assert.throws(() => validateLead({ ...base, ...patch }, now))
  }
  assert.equal(validateLead({ ...base, user_id: 'forged', status: 'Closed', whatsapp_consent: 'yes' }, now).whatsapp_consent, false)
  assert.equal('user_id' in validateLead(base, now), false)
})
test('an unknown charge prevents a misleading zero-charge total', () => {
  assert.equal(priceBreakdown({ base_carpet_rate: 5000, carpet_area: 1000 }).total, null)
  assert.equal(priceBreakdown({ base_carpet_rate: 5000, carpet_area: 1000, government_charges_estimate: 350000, gst_estimate: 0, maintenance_estimate: 50000, other_charges_estimate: 0 }).total, 5400000)
  assert.equal(priceBreakdown({ base_carpet_rate: 5000, carpet_area: 0 }).base, null)
})
test('WhatsApp sharing includes persisted pass details without buyer phone number', () => {
  const message = passMessage({ id: 'ORZ-VIP-test', name: 'Buyer', project: 'Project', visitDate: '2026-10-21' })
  assert.ok(message.includes('ORZ-VIP-test'))
  assert.ok(message.includes('Mapped under Orenzaa Partner Network'))
  assert.ok(message.includes('confirm the visit time'))
})
