import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'orzvwpiqsvjzbbxiejfu.supabase.co' },
      { protocol: 'https', hostname: 'cdn.tyfixautosales.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: 'https://orzvwpiqsvjzbbxiejfu.supabase.co/storage/:path*',
      },
    ];
  },

  // ── Security Headers ────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Prevent clickjacking — allow framing only from same origin
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Control referrer info sent with requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Restrict browser features / device APIs
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=()' },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self + Turnstile + Calendly + Leaflet + EmbedSocial
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://assets.calendly.com https://unpkg.com https://embedsocial.com",
              // Styles: self + inline + Leaflet + fonts
              "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com",
              // Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // Images: self + Supabase + Unsplash + data URIs + tiles
              "img-src 'self' data: blob: https://cdn.tyfixautosales.com https://orzvwpiqsvjzbbxiejfu.supabase.co https://images.unsplash.com https://*.basemaps.cartocdn.com https://i.pravatar.cc",
              // Frames: Calendly + EmbedSocial + Turnstile
              "frame-src 'self' https://calendly.com https://embedsocial.com https://challenges.cloudflare.com",
              // API/fetch calls: self + Supabase + NHTSA + Turnstile + AI providers
              "connect-src 'self' https://orzvwpiqsvjzbbxiejfu.supabase.co https://*.supabase.co https://vpic.nhtsa.dot.gov https://challenges.cloudflare.com https://api.groq.com https://generativelanguage.googleapis.com",
              // Workers (Turnstile uses workers)
              "worker-src 'self' blob:",
              // Restrict object/embed
              "object-src 'none'",
              // Restrict base URI
              "base-uri 'self'",
              // Restrict form action targets
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
