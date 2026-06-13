import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'GharDhundo — AI Powered Property Search Lucknow Noida',
    template: '%s | GharDhundo',
  },
  description: 'Find RERA verified flats in Lucknow and Noida with AI matching. 2BHK 3BHK apartments with free site visit and home loan help.',
  keywords: ['flats in Lucknow', '2BHK Noida', 'RERA verified property', 'Shalimar Mannat', 'Eldeco Lucknow', 'property dealer Lucknow', 'flats in Noida', 'property in Greater Noida'],
  openGraph: {
    title: 'GharDhundo — Find Your Perfect Home',
    description: 'AI matched RERA verified properties in Lucknow & Noida. Free site visit, home loan help.',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'en_IN',
    siteName: 'GharDhundo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GharDhundo — AI Powered Property Search',
    description: 'Find RERA verified flats in Lucknow and Noida with AI matching.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GharDhundo',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh bg-[#0A0A0F] text-[#F1F0FF] antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
