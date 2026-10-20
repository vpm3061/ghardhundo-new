import Link from 'next/link'
import Navbar from '@/components/Navbar'
import MobileNav from '@/components/MobileNav'
import ZeroSpamBadge from '@/components/ZeroSpamBadge'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata('Partner Enquiry Guidelines', 'How Orenzaa coordinates property enquiries and site visits while protecting buyer contact details.', '/cpl-terms')

export default function PartnerTermsPage() {
  return <>
    <Navbar />
    <main className="mx-auto max-w-3xl px-6 py-12 pb-28">
      <h1 className="mb-3 text-3xl font-bold text-slate-900">Partner Enquiry Guidelines</h1>
      <p className="mb-6 text-slate-600">Orenzaa manages buyer enquiries and coordinates property visits with its partner network.</p>
      <ZeroSpamBadge />
      <section className="my-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold">How enquiries are handled</h2>
        <p>Buyer names and phone numbers stay within the private Orenzaa enquiry workflow. Contact lists and phone-number unlocks are not offered for sale.</p>
        <p>Orenzaa coordinates the requested project and visit date. A Digital VIP Pass records the request; the team separately confirms the visit time.</p>
        <p>Advertising or partner service charges do not purchase access to buyer contact details. Discuss service scope and a written quote with Orenzaa before starting a campaign.</p>
        <p>AI scores help the team prioritise enquiries. They do not guarantee a sale, a visit or financing approval.</p>
      </section>
      <Link href="/advertise" className="font-semibold text-orange-700 underline">Explore advertising options</Link>
    </main>
    <MobileNav />
  </>
}
