import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { StitchesRegistry } from "@/components/StitchesRegistry";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: [{ url: "/images/blinkr-logo.webp", type: "image/webp" }],
    shortcut: ["/images/blinkr-logo.webp"],
    apple: [{ url: "/images/blinkr-logo.webp" }],
  },
  title: {
    default: "Blinkr — Solana-native cross-border payroll",
    template: "%s | Blinkr",
  },
  description:
    "Blinkr helps teams run USDC payroll on Solana with email-verified claims, Blink-native links, and webhook-driven status for finance operators.",
  openGraph: {
    title: "Blinkr — Solana-native cross-border payroll",
    description:
      "Fund escrows, verify contractors by email, and settle globally with Blinkr's Solana-first payroll stack.",
    url: siteUrl,
    siteName: "Blinkr",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Blinkr" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blinkr — Solana-native cross-border payroll",
    description:
      "USDC escrows, verified claims, and partner-ready off-ramps for teams that need modern global payouts.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased">
        <StitchesRegistry>{children}</StitchesRegistry>
      </body>
    </html>
  );
}
