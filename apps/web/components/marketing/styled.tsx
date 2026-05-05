"use client";

import { styled, pulseGlow } from "@/lib/stitches";

export const PrimaryButton = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "$2",
  fontWeight: 600,
  fontSize: "$sm",
  fontFamily: "$heading",
  padding: "$3 $5",
  borderRadius: "$pill",
  backgroundColor: "$primary",
  color: "white",
  textDecoration: "none",
  boxShadow: "$md",
  transition:
    "transform 160ms ease, background-color 160ms ease, color 160ms ease, box-shadow 200ms ease",
  "&:hover": {
    backgroundColor: "$primaryHover",
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: "2px solid $colors$primary",
    outlineOffset: "2px",
  },
  variants: {
    tone: {
      default: {},
      onDark: {
        backgroundColor: "white",
        color: "$primary",
        boxShadow: "$sm",
        "&:hover": {
          backgroundColor: "$primaryHover",
          color: "white",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12), 0 0 0 2px white",
        },
        "&:focus-visible": {
          outlineColor: "white",
        },
      },
    },
    pulse: {
      true: {
        animation: `${pulseGlow} 2.4s ease-in-out infinite`,
      },
    },
    size: {
      md: { fontSize: "$sm", padding: "$3 $5" },
      lg: { fontSize: "$md", padding: "$4 $6" },
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export const SecondaryButton = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "$2",
  fontWeight: 600,
  fontSize: "$sm",
  fontFamily: "$heading",
  padding: "$3 $5",
  borderRadius: "$pill",
  backgroundColor: "$surface",
  color: "$ink",
  textDecoration: "none",
  border: "1px solid $border",
  boxShadow: "$sm",
  transition: "transform 160ms ease, border-color 160ms ease, color 160ms ease",
  "&:hover": {
    borderColor: "$primary",
    color: "$primary",
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: "2px solid $colors$primary",
    outlineOffset: "2px",
  },
  variants: {
    tone: {
      default: {},
      onDark: {
        backgroundColor: "transparent",
        color: "white",
        borderColor: "rgba(255,255,255,0.45)",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.08)",
          borderColor: "white",
          color: "white",
        },
        "&:focus-visible": {
          outlineColor: "white",
        },
      },
    },
  },
  defaultVariants: {
    tone: "default",
  },
});

export const GhostButton = styled("a", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  fontSize: "$sm",
  fontFamily: "$heading",
  padding: "$2 $3",
  borderRadius: "$md",
  color: "$primary",
  textDecoration: "none",
  transition: "background-color 160ms ease",
  "&:hover": {
    backgroundColor: "$primaryMuted",
  },
  "&:focus-visible": {
    outline: "2px solid $colors$primary",
    outlineOffset: "2px",
  },
});

export const FeatureCard = styled("div", {
  backgroundColor: "$surface",
  borderRadius: "$lg",
  border: "1px solid $border",
  padding: "$6",
  boxShadow: "$sm",
  transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "$md",
    borderColor: "rgba(0, 163, 255, 0.35)",
  },
});

export const Pill = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "$xs",
  fontWeight: 600,
  fontFamily: "$heading",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "$primary",
  backgroundColor: "$primaryMuted",
  borderRadius: "$pill",
  padding: "$1 $3",
});
