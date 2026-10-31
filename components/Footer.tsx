import Link from 'next/link'

export default function Footer() {
  return <footer className="sticky bottom-0 z-40 border-t border-slate-700 bg-slate-900/95 px-4 py-4 text-white shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur sm:px-6">
    <div className="mx-auto max-w-7xl">
      <p className="text-xs leading-relaxed sm:text-sm">Orenzaa is a technology-enabled Real Estate Aggregator &amp; Discovery Platform. Orenzaa is NOT a developer, property owner, or title guarantor. Orenzaa holds zero financial or legal liability for property disputes. All transactions must be verified independently.</p>
      <p lang="hi" className="mt-2 text-xs leading-relaxed text-slate-200">ओरेन्ज़ा एक तकनीक-सक्षम रियल एस्टेट एग्रीगेटर और डिस्कवरी प्लेटफ़ॉर्म है। ओरेन्ज़ा डेवलपर, संपत्ति का मालिक या टाइटल गारंटर नहीं है। संपत्ति विवादों के लिए ओरेन्ज़ा की कोई वित्तीय या कानूनी देयता नहीं है। सभी लेन-देन की स्वतंत्र रूप से जाँच करें।</p>
      <p className="mt-2 text-xs text-slate-300">Orenzaa does not collect property booking or token funds. Property payments go directly between the buyer and the dealer or builder.</p>
      <p className="mt-2 text-[10px] text-slate-400">Ã‚Â© {new Date().getFullYear()} Orenzaa Ã‚Â· <Link href="/trust" className="underline">Trust &amp; Transparency</Link></p>
    </div>
  </footer>
}