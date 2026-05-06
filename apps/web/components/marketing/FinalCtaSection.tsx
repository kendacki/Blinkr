"use client";

import { motion } from "framer-motion";
import { Building2, Mail, Sparkles, User } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

export function FinalCtaSection() {
  return (
    <section
      id="final-cta"
      className="border-t border-slate-100 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7] via-[#9333EA] to-[#7C3AED] text-white shadow-[0_30px_80px_rgba(147,51,234,0.28)]">
            <div className="relative px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-amber-300/15 blur-2xl" />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={stagger}
                className="grid items-center gap-8 lg:grid-cols-[1.3fr,0.7fr]"
              >
                <div className="space-y-5">
                  <motion.h2
                    variants={fadeUp}
                    className="font-[var(--font-poppins)] text-3xl font-bold tracking-tight sm:text-4xl"
                  >
                    Join the Blinkr waitlist.
                  </motion.h2>
                  <motion.p variants={fadeUp} className="max-w-2xl text-lg text-white/90">
                    Effortless funding, one-tap claims, and instant tracking. Tell us a bit about your team and we'll
                    reach out when your spot is ready.
                  </motion.p>
                  <motion.ul variants={fadeUp} className="grid gap-3 sm:grid-cols-2">
                    {[
                      { k: "Passkey claims", v: "Secure, device-bound verification" },
                      { k: "Instant visibility", v: "Real-time status tracking" },
                      { k: "Non-custodial rails", v: "You keep control of funds" },
                      { k: "Local cash out", v: "Payout to bank accounts" },
                    ].map((x) => (
                      <li
                        key={x.k}
                        className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur"
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-white/70">{x.k}</div>
                        <div className="mt-1 font-semibold text-white">{x.v}</div>
                      </li>
                    ))}
                  </motion.ul>
                  <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                    <PrimaryButton href="#waitlist-form" size="md" tone="onDark">
                      Join Waitlist
                    </PrimaryButton>
                    <SecondaryButton href="/#faq" tone="onDark">
                      Read FAQs
                    </SecondaryButton>
                  </motion.div>
                </div>

                <motion.div
                  variants={fadeUp}
                  className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    Waitlist request
                  </div>

                  <form id="waitlist-form" className="mt-5 space-y-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-white/80">Work email</span>
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <Mail className="h-4 w-4 text-white/70" aria-hidden />
                        <input
                          type="email"
                          name="email"
                          placeholder="name@company.com"
                          autoComplete="email"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-white/80">Your name</span>
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <User className="h-4 w-4 text-white/70" aria-hidden />
                        <input
                          type="text"
                          name="name"
                          placeholder="Full name"
                          autoComplete="name"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold text-white/80">Company</span>
                      <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                        <Building2 className="h-4 w-4 text-white/70" aria-hidden />
                        <input
                          type="text"
                          name="company"
                          placeholder="Company name"
                          autoComplete="organization"
                          className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                        />
                      </div>
                    </label>

                    <div className="pt-2">
                      <PrimaryButton href="/dashboard/payroll" size="md" tone="onDark" className="w-full justify-center">
                        Request access
                      </PrimaryButton>
                      <div className="mt-3 text-xs text-white/60">
                        We'll email you when onboarding opens. No spam.
                      </div>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
