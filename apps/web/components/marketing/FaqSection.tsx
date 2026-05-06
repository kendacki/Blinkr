"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const faqs = [
  {
    q: "Is Blinkr secure for production payroll?",
    a: "Yes. Hardware-level security with instant verification. Your biometric data never leaves your device. Our system simply confirms your identity through a secure digital handshake, instantly unlocking your funds. Everything is settled directly on the blockchain for total transparency.",
  },
  {
    q: "How fast do payouts settle?",
    a: "Most funding and claims happen in seconds. While external bank transfers can vary, our real-time dashboard keeps you updated every step of the way so you're never left guessing.",
  },
  {
    q: "Can contractors use multiple devices?",
    a: "Contractors can sign in with their device's built-in security (like a fingerprint) and add backup devices so they never get locked out. For employers, we've added \"smart verification\" that triggers only when needed. Plus, because our payment pages are standard web links, you can open them on any device, anywhere.",
  },
  {
    q: "Is there a free version?",
    a: "Start for free. Scale when you're ready. Get everything set up and tested at zero cost. When you start sending real payments, you only pay based on your actual volume. No hidden fees.",
  },
  {
    q: "How do you prevent replayed claims?",
    a: "Every payout has a unique Blink URL. Once a payment is claimed, that fingerprint expires instantly, making it impossible for anyone to reuse or intercept the data.",
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
          <motion.p variants={fadeUp} className="mt-4 text-base text-slate-600">
            Find out how Blinkr works and how easily it connects to your existing Payment solutions.
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
