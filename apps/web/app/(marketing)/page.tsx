import { HeroSection } from "@/components/marketing/HeroSection";
import { FeatureSplitSection } from "@/components/marketing/FeatureSplitSection";
import { FeatureGridSection } from "@/components/marketing/FeatureGridSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <FeatureSplitSection />
      <FeatureGridSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
