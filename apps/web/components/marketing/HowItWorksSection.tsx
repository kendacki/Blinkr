"use client";

import Image from "next/image";
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
    <section id="how-it-works" className="overflow-x-hidden border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
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
            Hassle.
          </motion.p>
        </motion.div>

        <div className="relative mt-12 w-screen max-w-[100vw] left-1/2 right-1/2 -translate-x-1/2 flex justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.5 }}
            className="relative aspect-[464/830] w-full max-w-[min(1920px,calc(100vw-2rem))] drop-shadow-[0_30px_80px_rgba(168,85,247,0.22)]"
          >
            <Image
              src="/images/how-it-works-dashboard.png"
              alt="Dashboard preview: balances, activity, and client payouts in the Blinkr app"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1920px) 100vw, 1920px"
            />
          </motion.div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-14">
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

