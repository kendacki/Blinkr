import Image from "next/image";
import Link from "next/link";

const LOGO = "/images/blinkr-logo.webp";

type LogoMarkProps = {
  href?: string;
  size?: number;
  className?: string;
  priority?: boolean;
  linkClassName?: string;
  wordmarkClassName?: string;
};

export function LogoMark({
  href = "/",
  size = 40,
  className = "",
  priority = false,
  linkClassName = "text-slate-900",
  wordmarkClassName = "text-purple-600",
}: LogoMarkProps) {
  const img = (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200/80 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO}
        alt="Blinkr"
        fill
        className="object-contain p-[18%]"
        sizes={`${size}px`}
        priority={priority}
      />
    </span>
  );

  if (!href) {
    return img;
  }

  return (
    <Link href={href} className={`inline-flex items-center gap-2 font-semibold ${linkClassName}`}>
      {img}
      <span className={`text-lg tracking-tight ${wordmarkClassName}`}>Blinkr</span>
    </Link>
  );
}
