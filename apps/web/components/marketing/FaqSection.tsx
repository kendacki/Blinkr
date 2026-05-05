"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const faqs = [
  {
    q: "Is Blinkr secure for production payroll?",
    a: "Yes. Passkeys never leave the user device unverified: the backend completes WebAuthn checks, then issues a short-lived relayer signature that the on-chain program validates with Solana's ed25519 syscall. Escrow balances stay in program-derived accounts, not custodial spreadsheets.",
  },
  {
    q: "How fast do payouts settle?",
    a: "Blinkr targets Solana confirmation speeds for funding and claims. Exact wall-clock time depends on network load, priority fees, and partner off-ramp processing when you convert USDC to fiat. Status webhooks keep your dashboard aligned with chain events.",
  },
  {
    q: "Can contractors use multiple devices?",
    a: "Passkeys are bound to platform authenticators. Contractors can register multiple credentials per policy, and employers can require re-verification when risk signals change. The Blink page is a standard Next route, so it works anywhere a wallet or Blink client can open a link.",
  },
  {
    q: "Is there a free version?",
    a: "The Starter path is free for sandbox and integration testing. Production traffic on mainnet uses usage-based pricing so you only pay when escrows move and webhooks fire at scale.",
  },
  {
    q: "How do you prevent replayed claims?",
    a: "Each escrow carries a claim nonce and signed authorization includes expiry slots. The program rejects reused authorizations, so captured payloads cannot be replayed across escrows or time windows.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="font-[var(--font-poppins)] text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
            Straight answers about security, speed, pricing, and how Blinkr fits into your existing finance stack.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50/60"
        >
          {faqs.map((item, idx) => {
            const isOpen = open === idx;
            return (
              <motion.div key={item.q} variants={fadeUp} className="px-4 sm:px-6">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-semibold text-slate-900"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : idx)}
                >
                  <span>{item.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="text-blinkr" aria-hidden>
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
