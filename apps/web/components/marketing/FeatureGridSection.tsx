"use client";

import { motion } from "framer-motion";
import { ArrowLeftRight, Gauge, Lock, ToggleLeft } from "lucide-react";
import { FeatureCard } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const items = [
  {
    title: "Zero Crypto Complexity",
    body: "Recipients don’t install wallets, memorize seed phrases, or learn gas. They claim with passkeys (FaceID/TouchID) in seconds.",
    kind: "toggle",
    span: "lg",
    icon: ToggleLeft,
  },
  {
    title: "Sub-10 Second Settlement",
    body: "Payroll funding and claims finalize at Solana speed—built for teams that need fast, predictable payouts.",
    kind: "speed",
    span: "sm",
    icon: Gauge,
  },
  {
    title: "Local Fiat Off-ramp",
    body: "Route USDC to local currency (NGN and more) via compliant partners—contractors cash out to their bank.",
    kind: "fx",
    span: "sm",
    icon: ArrowLeftRight,
  },
  {
    title: "Non-Custodial Escrow",
    body: "Funds live in smart-contract escrows you control—not a custodial wallet. Clear state, clear receipts, fewer surprises.",
    kind: "escrow",
    span: "wide",
    icon: Lock,
  },
];

export function FeatureGridSection() {
  return (
    <section id="features" className="border-t border-slate-100 bg-[#FAFAFA] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
            Modern payroll primitives—fast settlement, passkey claims, and local off-ramps—wrapped in a clean operator
            experience.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12 grid gap-6 lg:grid-cols-12"
        >
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className={[
                item.span === "lg" ? "lg:col-span-7" : "",
                item.span === "sm" ? "lg:col-span-5" : "",
                item.span === "wide" ? "lg:col-span-12" : "",
              ].join(" ")}
            >
              <FeatureCard
                className={[
                  "h-full space-y-4 !border-slate-200/80 !bg-white",
                ].join(" ")}
                css={{
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blinkr-muted text-blinkr">
                    <item.icon className="h-6 w-6" />
                  </div>
                  {item.kind === "speed" ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Settlement</div>
                      <div className="mt-1 text-2xl font-bold text-slate-900">~8s</div>
                      <div className="text-xs text-slate-500">Typical confirmation</div>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-[var(--font-poppins)] text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>

                {item.kind === "toggle" ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-700">Wallet setup</div>
                      <div className="text-xs font-semibold text-slate-500">Passkey</div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-9 flex-1 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
                      <div className="relative h-9 w-16 rounded-full bg-blinkr-muted ring-1 ring-purple-200">
                        <div className="absolute left-1 top-1 h-7 w-7 rounded-full bg-blinkr shadow-sm" />
                      </div>
                      <div className="h-9 flex-1 rounded-xl bg-white shadow-sm ring-1 ring-slate-200" />
                    </div>
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
                      <div className="mt-1 font-semibold text-slate-900">NGN</div>
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
              </FeatureCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
