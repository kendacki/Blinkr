"use client";

import { motion } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

export function FinalCtaSection() {
  return (
    <section
      id="final-cta"
      className="border-t border-slate-100 bg-gradient-to-br from-blinkr via-blinkr-dark to-slate-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger} className="space-y-6">
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Blink your next payroll run?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-blue-50">
            Create a free account, connect your employer wallet, and send your first USDC escrow in minutes. Blinkr keeps
            the ceremony short and the receipts on-chain.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/download" size="lg" tone="onDark">
              Create your free account
            </PrimaryButton>
            <SecondaryButton href="/about" tone="onDark">
              Read our story
            </SecondaryButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
