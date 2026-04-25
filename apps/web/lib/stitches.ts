import { createStitches } from "@stitches/react";

export const {
  styled,
  css,
  keyframes,
  theme,
  config,
  getCssText,
  globalCss,
} = createStitches({
  theme: {
    colors: {
      primary: "#00A3FF",
      primaryHover: "#0088D9",
      primaryMuted: "#E6F7FF",
      ink: "#0F172A",
      inkMuted: "#475569",
      surface: "#FFFFFF",
      surfaceAlt: "#F8FAFC",
      border: "#E2E8F0",
    },
    fonts: {
      sans: "var(--font-inter), system-ui, -apple-system, sans-serif",
    },
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    radii: {
      sm: "6px",
      md: "10px",
      lg: "16px",
      pill: "9999px",
    },
    shadows: {
      sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
      md: "0 8px 24px rgba(15, 23, 42, 0.08)",
      glow: "0 0 0 1px rgba(0, 163, 255, 0.25), 0 12px 40px rgba(0, 163, 255, 0.15)",
    },
    space: {
      1: "4px",
      2: "8px",
      3: "12px",
      4: "16px",
      5: "24px",
      6: "32px",
      7: "48px",
      8: "64px",
      9: "96px",
    },
  },
  media: {
    sm: "(min-width: 640px)",
    md: "(min-width: 768px)",
    lg: "(min-width: 1024px)",
    xl: "(min-width: 1280px)",
  },
});

export const pulseGlow = keyframes({
  "0%, 100%": { boxShadow: "$shadows$glow" },
  "50%": { boxShadow: "0 0 0 1px rgba(0, 163, 255, 0.45), 0 16px 48px rgba(0, 163, 255, 0.22)" },
});
