import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ALLOWED = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Layer-2 contractor surface: strict framing, no embeds (see project.md CSP guidance). */
const BLINK_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss:",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join("; ");

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/blink")) {
    const res = NextResponse.next();
    res.headers.set("Content-Security-Policy", BLINK_CSP);
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return res;
  }

  if (path.startsWith("/api")) {
    const origin = req.headers.get("origin");
    const res = NextResponse.next();
    if (origin && (ALLOWED.length === 0 || ALLOWED.includes(origin))) {
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Vary", "Origin");
    }
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: res.headers });
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/blink/:path*"],
};
