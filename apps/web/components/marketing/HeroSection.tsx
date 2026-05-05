"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative isolate min-h-[520px] overflow-hidden sm:min-h-[580px] lg:min-h-[640px]"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/hero-cosmic.png"
          alt=""
          fill
          priority
          quality={100}
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="max-w-3xl space-y-8 text-white"
        >
          <motion.h1
            variants={fadeUp}
            className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Pay your global team instantly.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-base leading-relaxed text-white sm:text-lg lg:text-xl"
          >
            Fund payroll in USDC. Send a link. Recipients claim with Verification and cash out to their local bank.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <PrimaryButton href="/dashboard/payroll" size="md" tone="onDark">
              Blink Now
            </PrimaryButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
