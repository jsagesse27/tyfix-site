import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TyFix Auto Sales | Quality Cash Cars Under $5,000 in Brooklyn",
  description:
    "Shop reliable, inspected used cars under $5,000 at TyFix Auto Sales in Brooklyn, NY. No credit checks, no interest, no hidden fees. Cash and drive today.",
  keywords: ["used cars Brooklyn", "cash cars", "cars under $5000", "TyFix Auto Sales", "no credit check cars"],
  openGraph: {
    title: "TyFix Auto Sales | Quality Cash Cars Under $5,000",
    description: "No credit checks. No interest. No hidden fees. Drive away today.",
    type: "website",
  },
};

import ChatBot from "@/components/public/ChatBot";
import LoadingScreen from "@/components/public/LoadingScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <LoadingScreen />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
