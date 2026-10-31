import type { VipPass } from '@/lib/trust'

function pdfString(value: string) {
  return value.normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/([\\()])/g, '\\$1')
}

/** Creates a compact one-page PDF using the built-in Helvetica font. */
export function generateVipPassPdf(pass: VipPass): Uint8Array {
  const lines = [
    `Pass ID: ${pass.id}`, `Client: ${pass.name}`,
    `Phone: ${pass.maskedPhone || '****'}`, `Project: ${pass.project}`,
    'Micro-market: Prayagraj', `Requested visit date: ${pass.visitDate}`,
    'Tagging validity: 180 days from visit',
    ...(pass.purpose ? [`Purpose: ${pass.purpose}`] : []),
    ...(pass.costBreakdown ? [
      `Base price: ${pass.costBreakdown.base == null ? 'Pending quote' : `INR ${pass.costBreakdown.base.toLocaleString('en-IN')}`}`,
      `Stamp duty / registry: ${pass.costBreakdown.stampDuty == null ? 'Pending quote' : `INR ${pass.costBreakdown.stampDuty.toLocaleString('en-IN')}`}`,
      `Legal fees: ${pass.costBreakdown.legalFees == null ? 'Pending quote' : `INR ${pass.costBreakdown.legalFees.toLocaleString('en-IN')}`}`,
      `Estimated on-road total: ${pass.costBreakdown.onRoad == null ? 'Pending full quote' : `INR ${pass.costBreakdown.onRoad.toLocaleString('en-IN')}`}`,
    ] : []),
  ]
  const stream: string[] = []
  stream.push('1 1 1 rg 0 0 612 710 re f')
  stream.push('0.059 0.090 0.165 rg 0 710 612 82 re f')
  stream.push('1 1 1 rg BT /F1 20 Tf 42 750 Td (ORENZAA | DIGITAL VIP PASS) Tj ET')
  let y = 676
  for (const line of lines) {
    stream.push(`0.059 0.090 0.165 rg BT /F1 11 Tf 48 ${y} Td (${pdfString(line)}) Tj ET`)
    y -= 22
  }
  stream.push('0.95 0.96 0.97 rg 40 290 532 66 re f')
  stream.push('0.059 0.090 0.165 rg BT /F1 12 Tf 54 334 Td (BUYER SAFETY ADVISORY) Tj ET')
  stream.push('BT /F1 10 Tf 54 310 Td (Verify legal title and registry independently before paying any advance token money.) Tj ET')
  stream.push('0.059 0.090 0.165 rg 40 48 532 214 re f')
  stream.push('1 1 1 rg BT /F1 12 Tf 54 230 Td (ORENZAA AGGREGATOR DISCLAIMER) Tj ET')
  stream.push('BT /F1 10 Tf 54 202 Td (Orenzaa is a technology-enabled Real Estate Aggregator & Discovery Platform.) Tj ET')
  stream.push('BT /F1 10 Tf 54 180 Td (Orenzaa is not a developer, property owner, or title guarantor.) Tj ET')
  stream.push('BT /F1 10 Tf 54 158 Td (Orenzaa holds zero financial or legal liability for property disputes.) Tj ET')
  stream.push('BT /F1 10 Tf 54 136 Td (All transactions must be verified independently.) Tj ET')
  stream.push('BT /F1 10 Tf 54 114 Td (Orenzaa does not collect property booking funds; pay the seller directly.) Tj ET')
  stream.push('BT /F1 9 Tf 54 84 Td (Verify all property details and payment terms directly with the seller.) Tj ET')
  stream.push('BT /F1 9 Tf 54 64 Td (Property disputes are not Orenzaa liability. Independently verify every transaction.) Tj ET')
  const content = stream.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ]
  let document = '%PDF-1.4\n'
  const offsets = [0]
  for (const [index, object] of objects.entries()) {
    offsets.push(new TextEncoder().encode(document).length)
    document += `${index + 1} 0 obj\n${object}\nendobj\n`
  }
  const xrefOffset = new TextEncoder().encode(document).length
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new TextEncoder().encode(document)
}