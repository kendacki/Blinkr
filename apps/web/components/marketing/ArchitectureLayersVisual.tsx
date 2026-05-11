"use client";

import { motion } from "framer-motion";

const layers = [
  { n: 1, title: "Employer dashboard", detail: "Phantom, JWT session, /dashboard/*", accent: "bg-sky-500/15 text-sky-100 border-sky-400/30" },
  { n: 2, title: "Contractor Blink widget", detail: "Public /blink/[id], email OTP, strict CSP", accent: "bg-blinkr/20 text-sky-50 border-blinkr/40" },
  { n: 3, title: "BlinkRemit API", detail: "Next.js routes, Zod, Prisma, BullMQ", accent: "bg-violet-500/15 text-violet-100 border-violet-400/25" },
  { n: 4, title: "On-chain programs", detail: "Escrow PDAs, SPL Token, Ed25519 verify", accent: "bg-amber-500/15 text-amber-100 border-amber-400/25" },
  { n: 5, title: "External services", detail: "Helius, Meso, Redis, Postgres, Resend", accent: "bg-slate-500/20 text-slate-100 border-slate-400/25" },
];

export function ArchitectureLayersVisual() {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-lg ring-1 ring-slate-800"
      role="img"
      aria-label="Five-layer architecture: employer UI, contractor widget, API, blockchain, and external services"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0)_0%,rgba(15,23,42,0.85)_100%)]" />
      <div className="relative flex h-full flex-col gap-2 p-5 sm:p-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Five-layer model</p>
        <div className="flex flex-1 flex-col justify-center gap-2">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.n}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${layer.accent}`}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-black/30 text-xs font-bold text-white">
                {layer.n}
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{layer.title}</p>
                <p className="mt-0.5 text-xs opacity-85">{layer.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
