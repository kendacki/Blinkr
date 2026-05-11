type FeatureCard = {
  title: string;
  body: string;
  illustration: React.ReactNode;
};

function PaymentsIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-32 w-full"
    >
      <defs>
        <linearGradient id="card-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="14" y="40" width="140" height="80" rx="14" fill="#f5f3ff" />
      <rect x="30" y="28" width="140" height="80" rx="14" fill="url(#card-grad)" />
      <rect x="44" y="46" width="50" height="8" rx="4" fill="white" fillOpacity="0.7" />
      <rect x="44" y="62" width="78" height="6" rx="3" fill="white" fillOpacity="0.45" />
      <circle cx="148" cy="80" r="10" fill="white" fillOpacity="0.85" />
      <circle cx="138" cy="80" r="10" fill="white" fillOpacity="0.55" />
      <path
        d="M104 92 L122 92 L116 86 M122 92 L116 98"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="170" cy="34" r="6" fill="#fbbf24" />
      <circle cx="22" cy="118" r="4" fill="#c4b5fd" />
    </svg>
  );
}

function BlinksIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-32 w-full"
    >
      <defs>
        <linearGradient id="bolt-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect x="22" y="32" width="156" height="76" rx="14" fill="#f5f3ff" />
      <rect x="36" y="48" width="48" height="44" rx="8" fill="white" />
      <rect x="42" y="56" width="32" height="6" rx="3" fill="#ddd6fe" />
      <rect x="42" y="68" width="24" height="6" rx="3" fill="#ede9fe" />
      <rect x="42" y="80" width="28" height="6" rx="3" fill="#ede9fe" />
      <rect x="96" y="48" width="68" height="44" rx="8" fill="white" />
      <path
        d="M118 56 L108 78 L120 78 L114 92 L132 70 L120 70 Z"
        fill="url(#bolt-grad)"
      />
      <circle cx="156" cy="64" r="3" fill="#fbbf24" />
      <circle cx="156" cy="76" r="3" fill="#a855f7" />
      <circle cx="156" cy="88" r="3" fill="#ddd6fe" />
      <circle cx="22" cy="120" r="4" fill="#c4b5fd" />
      <circle cx="178" cy="28" r="5" fill="#fbbf24" />
    </svg>
  );
}

function SecurityIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-32 w-full"
    >
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="118" rx="60" ry="6" fill="#ede9fe" />
      <path
        d="M100 24 L150 40 V78 C150 102 128 118 100 124 C72 118 50 102 50 78 V40 Z"
        fill="url(#shield-grad)"
      />
      <path
        d="M100 32 L142 46 V78 C142 96 124 110 100 116 C76 110 58 96 58 78 V46 Z"
        fill="white"
        fillOpacity="0.12"
      />
      <path
        d="M82 78 L96 92 L122 64"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="38" r="5" fill="#fbbf24" />
      <circle cx="166" cy="32" r="4" fill="#c4b5fd" />
      <circle cx="174" cy="90" r="3" fill="#a855f7" />
    </svg>
  );
}

const CARDS: FeatureCard[] = [
  {
    title: "Seamless Payroll",
    body: "Distribute crypto payroll effortlessly with a single click.",
    illustration: <PaymentsIllustration />,
  },
  {
    title: "Create Blinks",
    body: "Generate actionable Blinks to streamline your team's workflow.",
    illustration: <BlinksIllustration />,
  },
  {
    title: "Secure Access",
    body: "Connect your Phantom wallet for non-custodial, passkey-grade security.",
    illustration: <SecurityIllustration />,
  },
];

export function DisconnectedWalletState() {
  return (
    <section className="font-[var(--font-poppins)]">
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hello User,
          </h2>
          <p className="max-w-2xl text-base text-slate-600">
            Welcome to your Blinkr dashboard. Connect your wallet to start sending payroll, creating
            Blinks, and tracking payouts in real time.
          </p>
          <p className="mt-5 text-xs text-slate-500">
            Non-custodial. Your keys never leave your wallet.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <article
            key={card.title}
            className="group flex flex-col rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
          >
            <div className="mb-5 flex aspect-[5/3] w-full items-center justify-center rounded-2xl bg-purple-50/70">
              {card.illustration}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
