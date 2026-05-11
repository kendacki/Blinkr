"use client";

import { motion } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const tiers = [
  {
    name: "Starter",
    price: "Free to try",
    blurb: "Spin up Blink links, fund test escrows on devnet, and validate contractor email flows with your own team.",
    bullets: ["Guided Blink templates", "Email OTP verification", "Developer webhooks in sandbox"],
    cta: "Download app",
    href: "/download",
    variant: "secondary" as const,
  },
  {
    name: "Growth",
    price: "Usage-based",
    blurb: "Production payroll with higher limits, employer dashboards, and priority webhook delivery.",
    bullets: ["USDC mainnet escrows", "Off-ramp initiation APIs", "Cron reminders and expiry sweeps"],
    cta: "Subscribe",
    href: "/support",
    variant: "primary" as const,
    featured: true,
  },
  {
    name: "Scale",
    price: "Custom",
    blurb: "Dedicated relayer capacity, bespoke policy checks, and partner routing for regulated markets.",
    bullets: ["Volume-based pricing", "Custom Meso or banking routes", "Security review support"],
    cta: "Talk to sales",
    href: "/support",
    variant: "secondary" as const,
  },
];

export function PricingSection() {
  return (
    <section id="plans" className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Plans that match how you ship payroll.
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">
            Pick a lane for experiments, production traffic, or enterprise-grade controls. Each column is a Stitches +
            Tailwind variant-friendly layout you can extend with tokens, coupons, or download CTAs without restructuring
            the page.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12 grid gap-6 lg:grid-cols-3"
        >
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={fadeUp}
              className={`flex h-full flex-col rounded-2xl border bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                tier.featured ? "border-blinkr ring-2 ring-blinkr/20" : "border-slate-200"
              }`}
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-blinkr">{tier.name}</p>
                <p className="text-2xl font-bold text-slate-900">{tier.price}</p>
                <p className="text-sm leading-relaxed text-slate-600">{tier.blurb}</p>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
                {tier.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-blinkr" aria-hidden>
                      &#10003;
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {tier.variant === "primary" ? (
                  <PrimaryButton href={tier.href} className="w-full justify-center" pulse={!!tier.featured}>
                    {tier.cta}
                  </PrimaryButton>
                ) : (
                  <SecondaryButton href={tier.href} className="w-full justify-center">
                    {tier.cta}
                  </SecondaryButton>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
