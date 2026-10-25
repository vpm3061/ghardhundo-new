import Link from 'next/link'

export default function Footer() {
  return <footer className="bg-slate-900 px-4 py-8 text-white sm:px-6">
    <div className="mx-auto max-w-7xl">
      <p className="text-sm leading-relaxed">Orenzaa is a technology-enabled Real Estate Aggregator &amp; Discovery Platform. Orenzaa is NOT a developer, property owner, or title guarantor. Orenzaa holds zero financial or legal liability for property disputes. All transactions must be verified independently.</p>
      <p lang="hi" className="mt-3 text-sm leading-relaxed">ओरेन्ज़ा एक तकनीक-सक्षम रियल एस्टेट एग्रीगेटर और डिस्कवरी प्लेटफ़ॉर्म है। ओरेन्ज़ा डेवलपर, संपत्ति का मालिक या टाइटल गारंटर नहीं है। संपत्ति विवादों के लिए ओरेन्ज़ा की कोई वित्तीय या कानूनी देयता नहीं है। सभी लेन-देन की स्वतंत्र रूप से जाँच करें।</p>
      <p className="mt-3 text-xs text-slate-300">Orenzaa does not collect property booking or token funds. Property payments go directly between the buyer and the dealer or builder.</p>
      <p className="mt-4 text-xs text-slate-400">© {new Date().getFullYear()} Orenzaa · <Link href="/trust" className="underline">Trust &amp; Transparency</Link></p>
    </div>
  </footer>
}
