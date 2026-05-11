"use client";

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function PayrollDashboardSkeleton() {
  return (
    <section
      className="mb-8 font-[var(--font-poppins)]"
      role="status"
      aria-busy="true"
      aria-label="Loading payroll dashboard"
    >
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-56" />
          <Shimmer className="h-4 w-72" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Shimmer className="h-10 w-10 rounded-full" />
          <Shimmer className="h-10 w-48 rounded-full" />
          <Shimmer className="h-10 w-36 rounded-full" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <div className="flex flex-col gap-5 md:col-span-12 lg:col-span-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Shimmer className="h-6 w-24 rounded-full" />
                <Shimmer className="h-7 w-7 rounded-full" />
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <Shimmer className="h-4 w-32" />
                  <Shimmer className="h-8 w-40" />
                  <Shimmer className="h-3 w-24" />
                </div>
                <Shimmer className="h-16 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-12 lg:col-span-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Shimmer className="h-7 w-28 rounded-full" />
              {[0, 1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
            <Shimmer className="h-10 w-full rounded-full" />
            <Shimmer className="h-64 w-full sm:h-72" />
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <div className="flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <Shimmer className="h-5 w-32" />
              <Shimmer className="h-7 w-7 rounded-full" />
            </div>
            <div className="flex -space-x-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Shimmer key={i} className="h-11 w-11 rounded-full" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <Shimmer className="h-3 w-16" />
                  <Shimmer className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <Shimmer className="h-5 w-44" />
              <Shimmer className="h-4 w-28" />
            </div>
            <Shimmer className="h-44 w-full" />
          </div>
        </div>
      </div>

      <span className="sr-only">Loading payroll dashboard…</span>
    </section>
  );
}
