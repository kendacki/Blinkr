import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blinkr API",
  description: "Blinkr backend (Layer 3)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
