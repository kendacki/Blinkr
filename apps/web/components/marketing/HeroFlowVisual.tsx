"use client";

import { motion } from "framer-motion";

const steps = [
  { label: "Employer", sub: "Phantom + /dashboard", tone: "from-slate-100 to-slate-200 text-slate-900" },
  { label: "Blink", sub: "Solana Action URL", tone: "from-blinkr to-blinkr-dark text-white" },
  { label: "Contractor", sub: "/blink/[id] + passkey", tone: "from-slate-100 to-slate-200 text-slate-900" },
];

export function HeroFlowVisual() {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-blinkr/15 ring-1 ring-slate-700/60"
      role="img"
      aria-label="Flow from employer dashboard through a Blink link to the contractor claim page"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(0,163,255,0.25),transparent_55%)]" />
      <div className="relative flex h-full flex-col p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Blinkr protocol</span>
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
            Non-custodial
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
              className={`flex flex-col rounded-xl bg-gradient-to-r px-4 py-3 shadow-md ${s.tone}`}
            >
              <span className="text-sm font-bold">{s.label}</span>
              <span className="text-xs opacity-80">{s.sub}</span>
            </motion.div>
          ))}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span>USDC escrow PDA</span>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.35 }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-slate-300 backdrop-blur-sm"
          >
            <span className="font-semibold text-white">Optional:</span> Meso or MoonPay off-ramp to local bank after
            claim.
          </motion.div>
        </div>
      </div>
    </div>
  );
}
