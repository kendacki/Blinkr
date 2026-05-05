"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/marketing/styled";
import { fadeUp, stagger, viewportOnce } from "@/components/marketing/motion";
import { HeroFlowVisual } from "@/components/marketing/HeroFlowVisual";

const textShadow =
  "0 2px 14px rgba(0,0,0,0.85), 0 4px 28px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.9)";

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

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:gap-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="space-y-6 text-white"
        >
          <motion.h1
            variants={fadeUp}
            className="font-[var(--font-poppins)] text-4xl font-bold tracking-tight text-white sm:text-5xl"
            style={{ textShadow }}
          >
            Pay your global team instantly.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="max-w-xl text-lg leading-relaxed text-white"
            style={{ textShadow }}
          >
            Fund payroll in USDC. Send a link. Recipients claim with FaceID and cash out to their local bank.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
            <PrimaryButton href="/dashboard/payroll" size="lg" tone="onDark">
              Start Paying Now
            </PrimaryButton>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={viewportOnce}
          className="relative mx-auto w-full max-w-lg"
        >
          <HeroFlowVisual variant="cosmic" />
        </motion.div>
      </div>
    </section>
  );
}
