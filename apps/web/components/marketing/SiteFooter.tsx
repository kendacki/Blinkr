import Link from "next/link";
import { LogoMark } from "@/components/marketing/LogoMark";

const columns = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Support", href: "/support" },
      { label: "Download", href: "/download" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Payroll Blinks", href: "/#product" },
      { label: "Passkey payouts", href: "/#features" },
      { label: "Settlement & off-ramp", href: "/#plans" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "https://github.com/kendacki/Blinkr" },
      { label: "Status", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/support" },
      { label: "Terms", href: "/support" },
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
              Blinkr is a Solana-native cross-border payroll layer: employers fund USDC escrows, contractors claim with
              passkeys, and settlement routes through compliant off-ramp partners when you need local currency.
            </p>
            <p className="text-xs text-slate-500">
              Social placeholders: follow updates on X and GitHub for release notes and integration guides.
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
