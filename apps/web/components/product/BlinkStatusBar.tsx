"use client";

const ORDER = ["PENDING", "OPENED", "CLAIMED", "OFFRAMPED"] as const;

type Props = { status: string };

export function BlinkStatusBar({ status }: Props) {
  const idx = ORDER.indexOf(status as (typeof ORDER)[number]);
  const activeIdx = idx === -1 ? (status === "REFUNDED" || status === "EXPIRED" ? -2 : 0) : idx;

  return (
    <ol className="flex flex-wrap gap-2 text-xs font-medium text-slate-600" aria-label="Blink progress">
      {ORDER.map((step, i) => {
        const done = activeIdx >= i;
        const current = activeIdx === i;
        return (
          <li
            key={step}
            className={`rounded-full px-3 py-1 ${
              done ? "bg-blinkr text-white" : "bg-slate-100 text-slate-500"
            } ${current ? "ring-2 ring-blinkr ring-offset-2" : ""}`}
          >
            {step === "OFFRAMPED" ? "FIAT (optional)" : step}
          </li>
        );
      })}
      {(status === "REFUNDED" || status === "EXPIRED") && (
        <li className="rounded-full bg-amber-100 px-3 py-1 text-amber-900">{status}</li>
      )}
    </ol>
  );
}
