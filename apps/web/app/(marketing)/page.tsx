import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeatureSplitSection } from "@/components/marketing/FeatureSplitSection";
import { FeatureGridSection } from "@/components/marketing/FeatureGridSection";
import { TestimonialsSection } from "@/components/marketing/TestimonialsSection";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeatureGridSection />
      <FeatureSplitSection />
      <TestimonialsSection />
      <FaqSection />
      <FinalCtaSection />
    </>
  );
}
