import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "@/index.css";
import "@/performance-optimizations.css";
import { Providers } from "@/components/Providers";
import InitialLoader from "@/components/InitialLoader";
import PageTransitionLoader from "@/components/PageTransitionLoader";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import JsonLdSchema from "@/components/seo/JsonLdSchema";
import SmoothScrollToTop from "@/components/SmoothScrollToTop";
import { constructMetadata } from "@/lib/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = constructMetadata();

export const viewport: Viewport = {
  themeColor: "#0066cc",
  width: "device-width",
  initialScale: 1,
};

import Script from "next/script";
import FloatingContactButtons from "@/components/ui/FloatingContactButtons";
import RecentActivityToast from "@/components/ui/RecentActivityToast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakarta.variable} ${outfit.variable}`}>
      <head>
        <JsonLdSchema />
      </head>
      <body className="min-h-screen bg-slate-950 font-sans antialiased text-slate-100">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
