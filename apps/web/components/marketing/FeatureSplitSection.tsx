"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";
import { ArchitectureLayersVisual } from "@/components/marketing/ArchitectureLayersVisual";

const bullets = [
  "Employer dashboard and contractor Blink widget stay separate: different auth, CSP, and performance budgets.",
  "BlinkRemit API (Next.js) validates with Zod, persists with Prisma, and queues work through BullMQ and Redis.",
  "Programs enforce create_escrow, relayer-bound claim_escrow, and refund paths; Helius and Meso integrate at Layer 5.",
];

export function FeatureSplitSection() {
  return (
    <section id="product" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="space-y-5"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Five layers, one audited payroll story.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg leading-relaxed text-slate-600">
            Blinkr is structured so authenticated employer tooling never shares the same threat model as the zero-crypto
            contractor page. The API server signs relayer authorizations only after WebAuthn succeeds; the chain verifies
            Ed25519 payloads and nonces so escrows cannot be replayed or silently redirected.
          </motion.p>
          <motion.ul variants={fadeUp} className="space-y-3 text-sm text-slate-700">
            {bullets.map((b) => (
              <li key={b} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blinkr" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.45 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <ArchitectureLayersVisual />
        </motion.div>
      </div>
    </section>
  );
}
