"use client";

import { motion } from "framer-motion";
import { PrimaryButton, Pill } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";
import { HeroFlowVisual } from "@/components/marketing/HeroFlowVisual";

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-blinkr-muted/50 to-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(168,85,247,0.20),_transparent_60%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="space-y-6"
        >
          <motion.div variants={fadeUp}>
            <Pill>Solana-native cross-border payroll</Pill>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
          >
            Pay your global team instantly. Zero crypto knowledge required.
          </motion.h1>
          <motion.p variants={fadeUp} className="max-w-xl text-lg leading-relaxed text-slate-600">
            The Solana-native cross-border payroll protocol. Fund in USDC, recipients claim via FaceID and cash out to
            their local bank.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <PrimaryButton href="/dashboard/payroll" size="lg">
              Start Paying Now
            </PrimaryButton>
          </motion.div>
          <motion.ul variants={fadeUp} className="flex flex-wrap gap-4 text-sm text-slate-600">
            <li className="rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-slate-100">USDC funding</li>
            <li className="rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-slate-100">Passkey claim</li>
            <li className="rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-slate-100">Local bank cash-out</li>
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={viewportOnce}
          className="relative mx-auto w-full max-w-lg"
        >
          <HeroFlowVisual />
          <motion.div
            aria-hidden
            className="absolute -right-4 -bottom-4 hidden h-28 w-28 rounded-2xl border border-white bg-white/90 shadow-lg backdrop-blur lg:block"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex h-full flex-col justify-center gap-1 p-4 text-xs font-semibold text-slate-800">
              <span className="text-blinkr">Escrow on-chain</span>
              <span className="text-slate-500">Decimal-safe API</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
