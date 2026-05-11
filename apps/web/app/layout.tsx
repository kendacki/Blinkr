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

function normalizeToOrigin(raw: string | undefined): URL | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim().replace(/\/$/, "");
  try {
    const withProto =
      trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`;
    return new URL(withProto);
  } catch {
    return null;
  }
}

/**
 * Crawlers require absolute og:image / og:url. Prefer env, then Vercel production URL,
 * then public marketing domain when running on Vercel without mis-set env (common OG bug).
 */
function resolveSiteOrigin(): URL {
  const fromEnv = [
    normalizeToOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeToOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    normalizeToOrigin(process.env.NEXT_PUBLIC_URL),
  ];
  for (const u of fromEnv) {
    if (u) return u;
  }
  if (process.env.VERCEL) {
    const marketing = normalizeToOrigin("https://blinkr.fun");
    if (marketing) return marketing;
    return normalizeToOrigin(`https://${process.env.VERCEL_URL}`) ?? new URL("http://localhost:3000");
  }
  return new URL("http://localhost:3000");
}

const siteOrigin = resolveSiteOrigin();
const metadataBase = siteOrigin;
const siteUrl = siteOrigin.href.replace(/\/$/, "");

const ogImagePath = "/images/blinkr-og-share.png";
const absoluteOgImageUrl = new URL(ogImagePath, siteOrigin).href;

const shareDescription =
  "Fund. Verify.  Settle globally. Meet Blinkr, the Solana-first payroll stack for modern teams.";

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
    description: shareDescription,
    url: siteUrl,
    siteName: "Blinkr",
    images: [
      {
        url: absoluteOgImageUrl,
        alt: "Blinkr — Pay your global team instantly. USDC payroll on Solana.",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blinkr — Solana-native cross-border payroll",
    description: shareDescription,
    images: [absoluteOgImageUrl],
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
