import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent the page from being embedded in iframes (clickjacking protection)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Prevent browsers from MIME-sniffing the content type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer information sent with requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable access to sensitive browser APIs not needed by this app
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enable DNS prefetching for performance
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  // Serves the app under kisten.com.br/tools without touching internal route structure —
  // Next.js prefixes all next/link hrefs with this automatically at build time.
  basePath: '/tools',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
