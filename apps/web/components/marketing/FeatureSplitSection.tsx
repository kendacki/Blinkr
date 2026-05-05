"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";
import { BadgeCheck, Shield } from "lucide-react";

export function FeatureSplitSection() {
  return (
    <section id="product" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={stagger}
              className="space-y-5"
            >
              <motion.h2
                variants={fadeUp}
                className="font-[var(--font-poppins)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              >
                Your payments are safe with Blinkr.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg leading-relaxed text-slate-600">
                Audited by top security firms. Funds are secured in non-custodial SPL Token-2022 Transfer Hook smart
                contracts. No hidden fees, no custodial risk.
              </motion.p>
              <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
                {[
                  { k: "Non-custodial", v: "Escrow contracts hold funds" },
                  { k: "Audited", v: "Security-reviewed design" },
                  { k: "Transparent", v: "On-chain receipts + status" },
                  { k: "Operator-friendly", v: "Clear states & retries" },
                ].map((b) => (
                  <div key={b.k} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{b.k}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{b.v}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.45 }}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-purple-500/15 blur-2xl" aria-hidden />
                <div className="absolute -left-12 -bottom-12 h-44 w-44 rounded-full bg-amber-400/15 blur-2xl" aria-hidden />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-700">
                    <Shield className="h-7 w-7" />
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    100% Audited
                  </div>
                </div>

                <h3 className="mt-6 font-[var(--font-poppins)] text-xl font-semibold text-slate-900">
                  Built for high-assurance payroll
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Blinkr keeps sensitive auth off chain while preserving verifiable settlement on chain. Claims are passkey
                  gated and escrows remain non custodial, so you can pay globally with modern UX and strong guarantees.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: "Contracts", v: "Token-2022 hooks" },
                    { k: "Identity", v: "WebAuthn passkeys" },
                    { k: "Receipts", v: "On-chain state" },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{x.k}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
