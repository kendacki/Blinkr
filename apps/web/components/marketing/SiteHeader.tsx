"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark } from "@/components/marketing/LogoMark";
import { PrimaryButton, SecondaryButton } from "@/components/marketing/styled";

const nav = [
  { label: "Home", href: "/#hero" },
  { label: "Solutions", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#final-cta" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(() => nav, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 transition-colors",
        scrolled ? "border-b border-slate-200/70 bg-white/80 backdrop-blur-xl" : "border-b border-transparent bg-white/0",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <LogoMark href="/" size={44} priority />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-blinkr"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <SecondaryButton href="/dashboard/payroll">Log In</SecondaryButton>
          <PrimaryButton href="/dashboard/payroll" size="md">
            Sign Up
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
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blinkr-muted hover:text-blinkr"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <SecondaryButton href="/dashboard/payroll" className="justify-center" onClick={() => setOpen(false)}>
                  Log In
                </SecondaryButton>
                <PrimaryButton href="/dashboard/payroll" className="justify-center" onClick={() => setOpen(false)}>
                  Sign Up
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
