"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeftRight, Gauge, Lock } from "lucide-react";
import { FeatureCard } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const items = [
  {
    title: "Zero Crypto Complexity",
    body: "Recipients don’t install wallets, memorize seed phrases, or learn gas. They claim with passkeys (FaceID/TouchID) in seconds.",
    kind: "solana",
    span: "third",
  },
  {
    title: "Under 10 Second Settlement",
    body: "Payroll funding and claims finalize at Solana speed. Fast payouts with clear status updates.",
    kind: "speed",
    span: "third",
    icon: Gauge,
  },
  {
    title: "Local Fiat Off-ramp",
    body: "Convert USDC to local currency through compliant partners. Contractors cash out to their bank.",
    kind: "fx",
    span: "third",
    icon: ArrowLeftRight,
  },
  {
    title: "Non Custodial Escrow",
    body: "Funds live in smart contract escrows you control. Clear state, clear receipts, fewer surprises.",
    kind: "escrow",
    span: "wide",
    icon: Lock,
  },
];

export function FeatureGridSection() {
  return (
    <section id="features" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="font-[var(--font-poppins)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Key benefits
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
              Fast settlement, passkey claims, and local cash out. Built for modern payroll operations.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch"
          >
            {items.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className={[
                  item.span === "third" ? "lg:col-span-4" : "",
                  item.span === "wide" ? "lg:col-span-12" : "",
                ].join(" ")}
              >
                <FeatureCard
                  className={[
                    "flex h-full min-h-[260px] flex-col gap-4 !border-slate-200/80 !bg-white",
                  ].join(" ")}
                  css={{
                    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  }}
                >
                {"icon" in item && item.icon ? (
                  <div className="flex items-start justify-between gap-4">
                    <item.icon className="h-6 w-6 shrink-0 text-blinkr" aria-hidden />
                  </div>
                ) : null}

                <div>
                  <h3 className="font-[var(--font-poppins)] text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>

                <div className="mt-auto">
                  {item.kind === "speed" ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Settlement</div>
                        <div className="mt-1 text-2xl font-bold text-slate-900">~8s</div>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-purple-500 to-purple-700" />
                      </div>
                      <div className="mt-2 text-xs text-slate-500">Typical confirmation</div>
                    </div>
                  ) : null}

                  {item.kind === "solana" ? (
                    <div className="relative mx-auto mt-2 aspect-square w-full max-w-[200px]">
                      <Image
                        src="/images/key-benefit-solana-coin.png"
                        alt="Solana"
                        fill
                        className="object-contain object-center"
                        sizes="200px"
                      />
                    </div>
                  ) : null}

                  {item.kind === "fx" ? (
                    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                      <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
                        <div className="text-[10px] uppercase text-slate-500">From</div>
                        <div className="mt-1 font-semibold text-slate-900">USDC</div>
                      </div>
                      <div className="flex items-center justify-center text-slate-500">→</div>
                      <div className="rounded-xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
                        <div className="text-[10px] uppercase text-slate-500">To</div>
                        <div className="mt-1 font-semibold text-slate-900">EUR</div>
                      </div>
                    </div>
                  ) : null}

                  {item.kind === "escrow" ? (
                    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-3">
                      {[
                        { k: "Fund", v: "USDC escrow" },
                        { k: "Claim", v: "Passkey verified" },
                        { k: "Settle", v: "On-chain receipt" },
                      ].map((b) => (
                        <div key={b.k} className="rounded-xl bg-white px-3 py-3 shadow-sm ring-1 ring-slate-200">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{b.k}</div>
                          <div className="mt-1 text-sm font-semibold text-slate-900">{b.v}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </FeatureCard>
            </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
