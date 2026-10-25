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
  ]
  const stream: string[] = []
  stream.push('1 1 1 rg 0 0 612 710 re f')
  stream.push('0.059 0.090 0.165 rg 0 710 612 82 re f')
  stream.push('1 1 1 rg BT /F1 20 Tf 42 750 Td (ORENZAA | DIGITAL VIP PASS) Tj ET')
  let y = 664
  for (const line of lines) {
    stream.push(`0.059 0.090 0.165 rg BT /F1 12 Tf 48 ${y} Td (${pdfString(line)}) Tj ET`)
    y -= 32
  }
  stream.push('0.95 0.96 0.97 rg 40 386 532 86 re f')
  stream.push('0.059 0.090 0.165 rg BT /F1 12 Tf 54 445 Td (BUYER SAFETY ADVISORY) Tj ET')
  stream.push('BT /F1 10 Tf 54 420 Td (Verify legal title and registry independently before paying any advance token money.) Tj ET')
  stream.push('0.059 0.090 0.165 rg 40 54 532 194 re f')
  stream.push('1 1 1 rg BT /F1 12 Tf 54 220 Td (ORENZAA AGGREGATOR DISCLAIMER) Tj ET')
  stream.push('BT /F1 10 Tf 54 190 Td (Orenzaa is a technology-enabled Real Estate Aggregator & Discovery Platform.) Tj ET')
  stream.push('BT /F1 10 Tf 54 166 Td (Orenzaa is not a developer, property owner, or title guarantor.) Tj ET')
  stream.push('BT /F1 10 Tf 54 142 Td (Orenzaa holds zero financial or legal liability for property disputes.) Tj ET')
  stream.push('BT /F1 10 Tf 54 118 Td (All transactions must be verified independently.) Tj ET')
  stream.push('BT /F1 10 Tf 54 94 Td (Orenzaa does not collect property booking funds; pay the dealer or builder directly.) Tj ET')
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
