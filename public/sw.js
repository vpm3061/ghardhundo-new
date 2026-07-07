const CACHE_NAME = 'orenzaa-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return
  if (event.request.url.includes('chrome-extension')) return
  if (event.request.url.includes('supabase')) return
  if (event.request.url.includes('razorpay')) return
})
