"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";
import { Shield } from "lucide-react";

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
              className="space-y-5 pt-6 sm:pt-8 lg:pt-10"
            >
              <motion.h2
                variants={fadeUp}
                className="font-[var(--font-poppins)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
              >
                Your payments are safe with Blinkr.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg leading-relaxed text-slate-600">
                Verified by Certik, our smart contracts ensure you always keep control of your money. Zero hidden fees.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.45 }}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <Shield className="h-7 w-7 shrink-0 text-blinkr" aria-hidden />

                <h3 className="mt-6 font-[var(--font-poppins)] text-xl font-semibold text-slate-900">
                  Built for high-assurance payroll
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Global payments with a click. We use passkeys to keep your money safe and accessible only to you. You get
                  the speed of modern apps with the unshakeable security of the blockchain.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: "Contracts", v: "Token-2022 hooks" },
                    { k: "Identity", v: "WebAuthn passkeys" },
                    { k: "Receipts", v: "On-chain state" },
                  ].map((x) => (
                    <div key={x.k} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
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
