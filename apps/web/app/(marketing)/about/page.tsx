"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const values = [
  {
    title: "Chain-first accounting",
    body: "If it is not verifiable on Solana, it is not a payout. We design flows so finance teams can reconcile escrows with RPC data, not screenshots.",
  },
  {
    title: "Human-grade ceremonies",
    body: "Passkeys reduce phishing and seed mishandling. We invest in clear UX copy, timers, and error states so contractors know what each step does.",
  },
  {
    title: "Partner-aware off-ramps",
    body: "Moving to fiat is where compliance matters. Blinkr integrates with queue-backed workers and signed webhooks so you can plug the partners you trust.",
  },
];

const team = [
  { name: "Core protocol", role: "Rust, Anchor, and audited escrow semantics." },
  { name: "Product & design", role: "Blink surfaces, employer dashboards, and contractor clarity." },
  { name: "Infrastructure", role: "Next.js routes, Prisma models, Redis limits, and observability." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-blinkr-muted/50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:gap-12 lg:px-8 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="max-w-3xl space-y-5"
          >
            <motion.h1 variants={fadeUp} className="text-4xl font-bold tracking-tight text-slate-900">
              We believe payroll should move at the speed of the internet.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-600">
              Blinkr started from a simple frustration: global teams still depend on slow correspondent banking while their
              products ship in minutes. Our mission is to pair Solana settlement with passkey-grade identity so
              employers can fund once and contractors can claim with confidence anywhere on Earth.
            </motion.p>
            <motion.div variants={fadeUp}>
              <PrimaryButton href="/download">Join the beta</PrimaryButton>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportOnce}
            className="relative mx-auto mt-10 h-48 w-48 shrink-0 lg:mt-0"
          >
            <div className="absolute inset-0 rounded-3xl bg-white shadow-xl ring-1 ring-slate-100" />
            <Image src="/images/blinkr-logo.webp" alt="Blinkr" fill className="object-contain p-10" sizes="192px" />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
          className="text-2xl font-bold text-slate-900"
        >
          Values that shape every release
        </motion.h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Team</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Blinkr is built by a distributed crew across protocol engineering, applied cryptography, and fintech
            operations. Names and portraits will appear here as we grow the public roster—until then, these are the
            disciplines shipping each milestone.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blinkr-muted">
                  <Image src="/images/blinkr-logo.webp" alt="" width={36} height={36} className="object-contain p-1" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">{m.name}</p>
                <p className="mt-1 text-xs text-slate-600">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
