import { ImageResponse } from "next/og";

export const alt = "Blinkr — Solana-native cross-border payroll";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export const runtime = "edge";

function LogoMark() {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        borderRadius: 36,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 24px 80px rgba(147, 51, 234, 0.35)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 52,
            height: 120,
            borderRadius: 18,
            background: "#A855F7",
            transform: "rotate(-8deg)",
          }}
        />
        <div
          style={{
            width: 52,
            height: 120,
            borderRadius: 18,
            background: "#9333EA",
            opacity: 0.85,
            transform: "rotate(8deg)",
            marginLeft: -28,
          }}
        />
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(120deg, #0F172A 0%, #3B0764 45%, #9333EA 100%)",
          color: "#ffffff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 720,
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 800, letterSpacing: -2 }}>Blinkr</div>
          <div style={{ fontSize: 30, fontWeight: 600, color: "rgba(250, 204, 21, 0.92)" }}>
            Solana-native cross-border payroll
          </div>
          <div style={{ fontSize: 22, color: "rgba(255,255,255,0.86)", maxWidth: 640, lineHeight: 1.4 }}>
            USDC escrows, email-verified claims, and webhook-driven reconciliation for global teams.
          </div>
        </div>
        <LogoMark />
      </div>
    ),
    size,
  );
}
