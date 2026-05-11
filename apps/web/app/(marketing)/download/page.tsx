"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

const platforms = [
  {
    name: "iOS",
    detail: "TestFlight builds for Blink pages and employer tools on modern iOS devices.",
    action: "Notify me",
    href: "/support",
  },
  {
    name: "Android",
    detail: "Chrome-first Blink pages with deep links into wallet clients where needed.",
    action: "Notify me",
    href: "/support",
  },
  {
    name: "Desktop",
    detail: "macOS, Windows, and Linux builds for finance teams managing escrows alongside their browsers.",
    action: "Download .dmg / .msi",
    href: "/support",
  },
  {
    name: "Web",
    detail: "Run the employer dashboard and Blink pages directly from Blinkr-hosted Next routes—no install required.",
    action: "Open web app",
    href: "/",
  },
];

export default function DownloadPage() {
  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="max-w-2xl space-y-4"
          >
            <motion.h1 variants={fadeUp} className="text-4xl font-bold tracking-tight text-slate-900">
              Download Blinkr where you work.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-slate-600">
              Pick the surface that matches your role: contractors stay mobile, employers get desktop controls, and
              everyone can fall back to the web app when onboarding new regions.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <PrimaryButton href="/support">Join the early access list</PrimaryButton>
              <SecondaryButton href="/">Back to home</SecondaryButton>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportOnce}
            className="relative mx-auto h-40 w-40 shrink-0"
          >
            <div className="absolute inset-0 rounded-full bg-blinkr-muted shadow-inner ring-2 ring-white" />
            <Image src="/images/blinkr-logo.webp" alt="Blinkr" fill className="object-contain p-6" sizes="160px" />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {platforms.map((p) => (
            <motion.article
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-slate-900">{p.name}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{p.detail}</p>
              <div className="mt-6">
                <Link
                  href={p.href}
                  className="inline-flex items-center justify-center rounded-full bg-blinkr px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blinkr-dark"
                >
                  {p.action}
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
