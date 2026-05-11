/** Raster PNG data URI for `@react-pdf/renderer` (PNG/JPEG only; converts WebP via canvas). */
export async function fetchBlinkrLogoPngDataUri(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  const origin = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "") || window.location.origin;
  const paths = ["/images/blinkr-logo.webp", "/images/blinkr.webp"];
  for (const path of paths) {
    try {
      const res = await fetch(`${origin}${path}`);
      if (!res.ok) continue;
      const blob = await res.blob();
      const bmp = await createImageBitmap(blob);
      const maxW = 180;
      const scale = Math.min(1, maxW / bmp.width);
      const w = Math.max(1, Math.round(bmp.width * scale));
      const h = Math.max(1, Math.round(bmp.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(bmp, 0, 0, w, h);
      bmp.close?.();
      return canvas.toDataURL("image/png");
    } catch {
      /* try next path */
    }
  }
  return undefined;
}
