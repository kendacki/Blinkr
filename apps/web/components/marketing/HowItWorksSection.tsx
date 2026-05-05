"use client";

import { motion } from "framer-motion";
import { Fingerprint, Link2, Wallet } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const steps = [
  {
    n: "Step 1",
    title: "Deposit USDC",
    body: "Employer deposits via Phantom.",
    icon: Wallet,
    side: "left",
  },
  {
    n: "Step 2",
    title: "Send a Blink",
    body: "Contractor clicks a unique URL.",
    icon: Link2,
    side: "right",
  },
  {
    n: "Step 3",
    title: "Biometric Claim",
    body: "Contractor authenticates via WebAuthn/FaceID to their smart wallet.",
    icon: Fingerprint,
    side: "right",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
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
            How it works
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
            A simple three step flow from USDC funding to passkey claim. Built for teams that want global payouts without
            crypto setup.
          </motion.p>
        </motion.div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-3">
          <div className="space-y-4">
            {steps
              .filter((s) => s.side === "left")
              .map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.45 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blinkr-muted text-blinkr">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.n}</div>
                        <div className="text-base font-semibold text-slate-900">{s.title}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.body}</p>
                  </motion.div>
                );
              })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="relative mx-auto aspect-[10/18] w-full rounded-[2.6rem] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_30px_80px_rgba(168,85,247,0.18)]">
              <div className="absolute left-1/2 top-3 h-1 w-20 -translate-x-1/2 rounded-full bg-white/15" />
              <div className="absolute inset-0 rounded-[2.6rem] bg-[radial-gradient(ellipse_at_30%_15%,rgba(168,85,247,0.28),transparent_55%)]" />
              <div className="relative h-full p-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white/90">Recipient Bank Details</div>
                  <div className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                    Verified
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Account name</div>
                    <div className="mt-1 text-sm font-semibold text-white">Alex Contractor</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Claim method</div>
                    <div className="mt-1 text-sm font-semibold text-white">Passkey (FaceID)</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">Status</div>
                    <div className="mt-1 text-sm font-semibold text-white">Ready to claim</div>
                  </div>
                </div>
                <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900">
                  Continue
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            {steps
              .filter((s) => s.side === "right")
              .map((s, idx) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.45, delay: idx * 0.06 }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blinkr-muted text-blinkr">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.n}</div>
                        <div className="text-base font-semibold text-slate-900">{s.title}</div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.body}</p>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}

