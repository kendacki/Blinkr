"use client";

import { motion } from "framer-motion";
import { FeatureCard } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const items = [
  {
    title: "Blink-native payouts",
    body: "Generate a Solana Action URL (Blink) and deliver it by email or social clients. The contractor sees amount, expiry, and claim steps inline—no iframe hacks; for email it is a standard Next.js page per the Actions spec.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12h16M12 4v16" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    title: "Passkey-secured claims",
    body: "SimpleWebAuthn-backed FIDO2 ceremonies stay off-chain. After verification, the API issues a relayer-signed Ed25519 authorization the program checks via Solana's native ed25519 instruction—never a raw WebAuthn blob on-chain.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Employer controls",
    body: "Layer 1 dashboard at /dashboard/* uses Phantom wallet auth plus JWT sessions. Employers sign create_escrow, watch USDC move into PDAs, and reconcile status with the same Decimal-safe fields stored in Postgres.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6h16v4H4zM4 14h10v4H4z" />
      </svg>
    ),
  },
  {
    title: "Off-ramp ready",
    body: "Meso Finance is the primary USDC-to-bank path with MoonPay as fallback. BullMQ workers and signed Meso webhooks keep Prisma in sync while contractors move to local fiat after a successful claim.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3v18M7 8l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Helius + Postgres truth",
    body: "Helius RPC and webhooks feed on-chain events back into Prisma so dashboards reflect confirmations, escrow state, and off-ramp progression without polling explorers manually.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 18h4l3-9 4 6 3-7h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Token-2022 + Squads path",
    body: "The architecture pairs SPL Token-2022 extensions (transfer hooks, confidential transfers where policy requires) with Squads Protocol v4 smart wallets so passkey-derived identities can map to non-custodial wallet infrastructure.",
    icon: (
      <svg className="h-8 w-8 text-blinkr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l8 4v10l-8 4-8-4V7l8-4z" strokeLinejoin="round" />
        <path d="M12 12l8-4M12 12v10M12 12L4 8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function FeatureGridSection() {
  return (
    <section id="features" className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need for compliant global pay.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
            Primitives from the Blinkr blueprint—Blinks, WebAuthn, SPL Token-2022, Squads, Meso/MoonPay, Helius, and
            queue-backed jobs—are composed so finance and engineering share one coherent system.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => (
            <motion.div key={item.title} variants={fadeUp}>
              <FeatureCard className="h-full space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blinkr-muted">{item.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.body}</p>
              </FeatureCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
