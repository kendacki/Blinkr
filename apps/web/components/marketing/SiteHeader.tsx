"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark } from "@/components/marketing/LogoMark";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";

const nav = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "About", href: "/about" },
  { label: "Support", href: "/support" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <LogoMark href="/" size={44} priority />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blinkr"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/download"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blinkr"
          >
            Download
          </Link>
          <Link
            href="/dashboard/payroll"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-blinkr"
          >
            Dashboard
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SecondaryButton href="/support">Talk to us</SecondaryButton>
          <PrimaryButton href="/download" size="md">
            Get started
          </PrimaryButton>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-slate-800" />
            <span className="h-0.5 w-5 bg-slate-800" />
            <span className="h-0.5 w-5 bg-slate-800" />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 bg-white md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {[...nav, { label: "Download", href: "/download" }, { label: "Dashboard", href: "/dashboard/payroll" }].map(
                (item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blinkr-muted hover:text-blinkr"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              <PrimaryButton href="/download" className="mt-2 justify-center" onClick={() => setOpen(false)}>
                Get started
              </PrimaryButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
