"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SecondaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const categories = ["Funding escrows", "Passkey errors", "Webhook signatures", "Off-ramp statuses", "Employer auth"];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q.length === 0 ? categories : categories.filter((c) => c.toLowerCase().includes(q));

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOnce} variants={stagger} className="max-w-3xl space-y-4">
            <motion.h1 variants={fadeUp} className="text-4xl font-bold tracking-tight text-slate-900">
              Help center for Blinkr operators
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-600">
              Search guides on funding flows, passkey recovery, and partner webhooks. If you are blocked in production,
              email support with your blink ID and recent transaction signatures so we can trace the relayer path.
            </motion.p>
          </motion.div>
          <div className="mt-10">
            <label htmlFor="support-search" className="sr-only">
              Search help articles
            </label>
            <input
              id="support-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics like “escrow expiry” or “Helius webhook”"
              autoComplete="off"
              aria-controls="support-category-list"
              className="w-full max-w-2xl rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-inner outline-none transition focus:border-blinkr focus:ring-2 focus:ring-blinkr/30"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="lg:col-span-1"
          >
            <motion.h2 variants={fadeUp} className="text-lg font-semibold text-slate-900">
              Popular categories
            </motion.h2>
            <ul id="support-category-list" className="mt-4 space-y-2 text-sm text-blinkr">
              {filtered.length === 0 ? (
                <motion.li variants={fadeUp} className="text-slate-500" role="status" aria-live="polite">
                  No categories match that search.
                </motion.li>
              ) : (
                filtered.map((c) => (
                  <motion.li key={c} variants={fadeUp}>
                    <button
                      type="button"
                      className="text-left font-medium hover:underline"
                      onClick={() => setQuery(c)}
                    >
                      {c}
                    </button>
                  </motion.li>
                ))
              )}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <motion.h2 variants={fadeUp} className="text-lg font-semibold text-slate-900">
              Contact the Blinkr team
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-2 text-sm text-slate-600">
              Have a specific question? Send us a message and our support team will get back to you within 24 hours.
            </motion.p>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr focus:ring-2 focus:ring-blinkr/25"
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr focus:ring-2 focus:ring-blinkr/25"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr focus:ring-2 focus:ring-blinkr/25"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-blinkr px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blinkr-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blinkr"
                >
                  Submit request
                </button>
                <SecondaryButton href="mailto:support@blinkr.example">support@blinkr.example</SecondaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
