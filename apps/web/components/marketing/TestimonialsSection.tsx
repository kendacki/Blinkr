"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const testimonials = [
  {
    name: "Elena Vasquez",
    title: "Head of Finance, Northwind Labs",
    quote:
      "We replaced a patchwork of wire fees with Blinkr escrows. Contractors in three continents see the same Blink, claim with passkeys, and we finally have one ledger that matches the chain.",
  },
  {
    name: "Marcus Chen",
    title: "Lead engineer, RemoteCraft",
    quote:
      "The relayer-signed claim flow is exactly what we needed: users never touch raw seeds, and our risk team can audit every authorization payload off-chain before it hits Solana.",
  },
  {
    name: "Amira Khan",
    title: "Contractor, product design",
    quote:
      "I used to wait days for invoices. With Blinkr I open the Blink, verify with my passkey, and USDC hits my wallet in minutes. The expiry timer is clear, so I never guess if a payout is still live.",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What teams say about Blinkr
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
            Finance, engineering, and contractors all touch the same flow. Here is how they describe the experience.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12 grid gap-6 lg:grid-cols-3"
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm"
            >
              <div className="flex items-center gap-1 text-amber-400" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} aria-hidden>
                    &#9733;
                  </span>
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-700">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blinkr-muted ring-2 ring-white">
                  <Image
                    src="/images/blinkr-logo.webp"
                    alt=""
                    width={48}
                    height={48}
                    className="object-contain p-1.5"
                    aria-hidden
                  />
                  <span className="sr-only">Avatar placeholder for {t.name}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.title}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
