import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const PROMPT = (content: string) => `You are a real-estate data extractor for Indian properties. Extract details from the input below and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Return this exact schema (use null for any missing field):
{
  "property_category": "flat, plot, rental, or commercial",
  "title": "Project / property name",
  "builder": "Builder or developer name",
  "sector": "Sector, locality or area name",
  "locality": "Same as sector — locality or area name",
  "city": "One of: Lucknow, Noida, Greater Noida, Ayodhya, or the actual city name",
  "price_min": 3500000,
  "price_max": 4500000,
  "bhk": "2,3",
  "status": "Under Construction or Ready to Move or New Launch",
  "rera_number": "RERA registration number if present",
  "possession_date": "Month Year e.g. Dec 2026",
  "description": "2-3 sentence summary of the project",
  "amenities": "Swimming Pool, Gym, 24hr Security",
  "youtube_url": "YouTube URL if present else null",
  "plot_area_sqyard": 200,
  "monthly_rent": 15000,
  "commercial_type": "Shop, Office, Showroom, Warehouse, or Garage",
  "confidence": 85
}

Rules:
- property_category: pick "plot" for zameen/land/plot listings, "rental" for rent/PG/room/kiraya listings, "commercial" for shop/office/showroom/warehouse listings, otherwise "flat". This must always be set, never null.
- price_min / price_max / monthly_rent must be plain integers in INR (no symbols, no commas). Convert: "45 Lakh" → 4500000, "1.5 Cr" → 15000000, "₹35L" → 3500000, "₹15,000/month" → monthly_rent 15000.
- For rental listings, put the monthly rent in monthly_rent and leave price_min/price_max null. For sale listings, use price_min/price_max and leave monthly_rent null.
- plot_area_sqyard is a plain number in square yards, only relevant when property_category is "plot".
- commercial_type only applies when property_category is "commercial".
- bhk must be a comma-separated string of numbers only, e.g. "2,3" or "3,4" — leave null for plot/commercial.
- amenities must be a comma-separated string from: Swimming Pool, Club House, Gym, 24hr Security, Power Backup, Parking, Garden, Kids Zone.
- status must be exactly one of the three values above, or null.
- confidence is an integer 0–100 reflecting how complete and certain the extraction is.

Input:
${content}`

function isUrl(s: string) {
  return s.startsWith('http://') || s.startsWith('https://')
}

async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
    signal: AbortSignal.timeout(12000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching URL`)
  const html = await res.text()
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 12000)
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in .env.local' }, { status: 500 })
  }

  let input: string
  try {
    const body = await request.json()
    input = (body?.input ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!input) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  // If it looks like a URL, fetch the page first
  let content = input
  if (isUrl(input)) {
    try {
      content = `URL: ${input}\n\n${await fetchPageText(input)}`
    } catch (err) {
      return NextResponse.json(
        { error: `Could not fetch URL: ${err instanceof Error ? err.message : err}` },
        { status: 422 }
      )
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: PROMPT(content) }],
    })

    const raw = message.content[0]
    if (raw.type !== 'text') throw new Error('Unexpected response type from Claude')

    const jsonMatch = raw.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in Claude response')

    const extracted = JSON.parse(jsonMatch[0])
    return NextResponse.json(extracted)
  } catch (err) {
    return NextResponse.json(
      { error: `Extraction failed: ${err instanceof Error ? err.message : err}` },
      { status: 500 }
    )
  }
}
