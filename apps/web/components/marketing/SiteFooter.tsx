import Link from "next/link";
import { LogoMark } from "@/components/marketing/LogoMark";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/#hero" },
      { label: "Solutions", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#final-cta" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "https://github.com/kendacki/Blinkr" },
      { label: "Dashboard", href: "/dashboard/payroll" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/#faq" },
      { label: "Terms", href: "/#faq" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm space-y-4">
            <LogoMark href="/" size={36} />
            <p className="text-sm leading-relaxed text-slate-600">
              Blinkr is a Solana native global payroll protocol. Fund in USDC, send a link, recipients claim with
              passkeys, then cash out to their local bank.
            </p>
            <p className="text-xs text-slate-500">
              Built for modern fintech UX with non-custodial guarantees.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{col.title}</p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-700 transition-colors hover:text-blinkr"
                        {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Blinkr. All rights reserved.</p>
          <p className="text-xs">Built for high-assurance payroll on Solana.</p>
        </div>
      </div>
    </footer>
  );
}
