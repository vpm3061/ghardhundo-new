import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://orenzaa.com'),
  title: {
    default: 'Orenzaa — Find Where Life Belongs',
    template: '%s | Orenzaa',
  },
  description: 'AI-powered property platform for Lucknow, Noida and UP. Find flats, plots, rental and commercial properties. RERA verified. Zero pressure.',
  keywords: [
    'property in Lucknow', 'flats in Noida', 'plots in Greater Noida', 'RERA verified property',
    '2BHK Lucknow', 'buy flat Noida', 'property dealer Lucknow', 'real estate UP', 'Orenzaa',
  ],
  openGraph: {
    title: 'Orenzaa — Find Where Life Belongs',
    description: 'AI-powered property platform for Lucknow, Noida and UP.',
    url: 'https://orenzaa.com',
    images: ['/og-image.jpg'],
    type: 'website',
    locale: 'en_IN',
    siteName: 'Orenzaa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Orenzaa — Find Where Life Belongs',
    description: 'AI-powered property platform for Lucknow, Noida and UP.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Orenzaa',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FB923C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh bg-[#FAFAF9] text-[#111827] antialiased">
        <ServiceWorkerRegister />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
