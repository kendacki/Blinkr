"use client";

import { useServerInsertedHTML } from "next/navigation";
import { getCssText } from "@/lib/stitches";

export function StitchesRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => (
    <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
  ));
  return <>{children}</>;
}
