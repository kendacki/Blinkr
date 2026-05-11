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

const siteUrlRaw =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
const siteUrl = siteUrlRaw.replace(/\/$/, "");
const metadataBase = (() => {
  try {
    return new URL(siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

/** Same artwork as `HeroSection` (first homepage container) for link previews. */
const defaultOgImage = "/images/hero-cosmic.png";

export const metadata: Metadata = {
  metadataBase,
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
    images: [
      {
        url: defaultOgImage,
        alt: "Blinkr — Pay your global team instantly with USDC payroll on Solana",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blinkr — Solana-native cross-border payroll",
    description:
      "USDC escrows, verified claims, and partner-ready off-ramps for teams that need modern global payouts.",
    images: [defaultOgImage],
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
