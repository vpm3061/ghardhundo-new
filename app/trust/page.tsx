import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ZeroSpamBadge from '@/components/ZeroSpamBadge'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata(
  'Buyer Privacy, Verified Listings & Transparent Pricing',
  'Learn how Orenzaa protects your enquiry, verifies property listings, displays estimated charges and creates your Digital VIP Site Visit Pass.',
  '/trust',
)

export default function TrustPage() {
  return <>
    <Navbar />
    <main className="mx-auto max-w-3xl px-5 py-12 pb-28">
      <p className="mb-3 text-sm font-semibold text-orange-600">THE ORENZAA PROMISE</p>
      <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Your property search, with privacy and clarity.</h1>
      <div className="my-6"><ZeroSpamBadge /></div>
      <div className="space-y-5">
        {[
          ['One private enquiry', 'Your enquiry goes to the Orenzaa team. Your buyer contact details are not publicly listed or sold to third-party brokers. We use them to assist with your requested property search or visit.'],
          ['Verification you can identify', 'The “Orenzaa Verified & RERA Tagged” badge appears only after an Orenzaa admin checks the listing and its RERA number. A RERA number displayed without this badge does not mean the listing has been independently verified by Orenzaa.'],
          ['Understand the estimate', 'Property pages separate the base carpet rate, registry and stamp-duty estimate, GST, maintenance and other disclosed charges. Unknown amounts remain pending. A complete total and the direct-builder pricing promise appear only when the required information has been approved. Always confirm the final written quote.'],
          ['A saved Digital VIP Pass', 'Choose your preferred visit date and submit the form. Once saved, your pass includes your name, project, unique pass ID and requested date. Download it or choose to share it through WhatsApp. Our team will confirm the visit time.'],
          ['You choose WhatsApp updates', 'Consent to visit-related WhatsApp updates is optional. Manual sharing opens WhatsApp so you can choose the recipient. Submitting a visit request does not require marketing consent.'],
        ].map(([title, text]) => <section key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="mt-3 leading-relaxed text-slate-600">{text}</p>
        </section>)}
      </div>
      <Link href="/properties" className="mt-8 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white">Explore properties</Link>
    </main>
    <MobileNav />
  </>
}
