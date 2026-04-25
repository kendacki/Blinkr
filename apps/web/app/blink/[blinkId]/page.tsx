import { BlinkPageClient } from "./BlinkPageClient";

export const metadata = {
  title: "Claim payment",
  robots: { index: false, follow: false },
};

export default function BlinkClaimPage({ params }: { params: { blinkId: string } }) {
  return <BlinkPageClient blinkId={params.blinkId} />;
}
