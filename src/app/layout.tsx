import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tyfixautosales.com'),
  title: {
    default: "Cash Cars for Sale in Brooklyn NY — TyFix Auto Sales",
    template: "%s | TyFix Auto Sales",
  },
  description:
    "Quality Used Cars Under $5,000 at TyFix Auto Sales in Brooklyn, NY. No credit checks, no interest, no hidden fees. Cash and drive today.",
  keywords: [
    "used cars Brooklyn",
    "cash cars Brooklyn",
    "cars under $5000",
    "TyFix Auto Sales",
    "no credit check cars Brooklyn",
    "cheap cars NYC",
    "cash only car dealer Brooklyn",
    "affordable used cars Brooklyn",
  ],
  openGraph: {
    title: "Cash Cars for Sale in Brooklyn NY — TyFix Auto Sales",
    description:
      "Quality Used Cars Under $5,000. No credit checks. No interest. No hidden fees. Drive away today.",
    type: "website",
    siteName: "TyFix Auto Sales",
    url: "https://tyfixautosales.com",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cash Cars for Sale in Brooklyn NY — TyFix Auto Sales",
    description:
      "Quality Used Cars Under $5,000. No credit checks. No interest. No hidden fees.",
  },
  alternates: {
    canonical: "https://tyfixautosales.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  },
};

import ChatBot from "@/components/public/ChatBot";
import LoadingScreen from "@/components/public/LoadingScreen";
import { GTMHead, GTMBody, GA4Script } from "@/components/analytics/GoogleTagManager";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { Analytics } from "@vercel/analytics/react";


import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <GTMHead />
        <GA4Script />
        <MetaPixel />
      </head>
      <body className="min-h-screen antialiased">
        <GTMBody />
        <LoadingScreen />
        {children}
        <ChatBot />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
