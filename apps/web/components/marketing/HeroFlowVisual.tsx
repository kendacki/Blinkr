"use client";

import { motion } from "framer-motion";

const floatEase = { duration: 3.8, repeat: Infinity, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] };

type HeroFlowVisualProps = {
  variant?: "light" | "cosmic";
};

export function HeroFlowVisual({ variant = "light" }: HeroFlowVisualProps) {
  const cosmic = variant === "cosmic";

  const shell = cosmic
    ? "relative aspect-[10/9] overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl shadow-purple-950/50 ring-1 ring-white/10 backdrop-blur-xl"
    : "relative aspect-[10/9] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-purple-500/10 ring-1 ring-slate-200";

  return (
    <div className={shell} role="img" aria-label="Phone mock with floating payroll status cards">
      {cosmic ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(250,204,21,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(168,85,247,0.25),transparent_45%)]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(168,85,247,0.18),transparent_58%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white to-transparent" />
        </>
      )}

      <div
        className={
          cosmic
            ? "relative mx-auto mt-10 h-[78%] w-[58%] rounded-[2.2rem] border border-white/15 bg-slate-950/45 shadow-lg backdrop-blur-md"
            : "relative mx-auto mt-10 h-[78%] w-[58%] rounded-[2.2rem] border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-lg"
        }
      >
        <div
          className={cosmic ? "mx-auto mt-2 h-1 w-16 rounded-full bg-white/25" : "mx-auto mt-2 h-1 w-16 rounded-full bg-slate-200"}
        />
        <div className="px-5 pt-6">
          <div className="flex items-center justify-between">
            <div className={cosmic ? "text-xs font-semibold text-violet-100" : "text-xs font-semibold text-slate-900"}>
              Blinkr
            </div>
            <div
              className={
                cosmic
                  ? "rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                  : "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
              }
            >
              Live
            </div>
          </div>
          <div
            className={
              cosmic
                ? "mt-5 rounded-2xl border border-white/15 bg-slate-950/50 p-4 shadow-sm backdrop-blur-sm"
                : "mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            }
          >
            <div
              className={
                cosmic
                  ? "text-[10px] font-medium uppercase tracking-wide text-violet-200/80"
                  : "text-[10px] font-medium uppercase tracking-wide text-slate-500"
              }
            >
              Next payroll
            </div>
            <div className={cosmic ? "mt-1 text-2xl font-bold text-white" : "mt-1 text-2xl font-bold text-slate-900"}>
              31
            </div>
            <div className={cosmic ? "text-xs text-violet-200/75" : "text-xs text-slate-500"}>seconds to settlement</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div
                className={
                  cosmic ? "rounded-xl border border-white/10 bg-white/5 p-3" : "rounded-xl bg-slate-50 p-3"
                }
              >
                <div
                  className={
                    cosmic ? "text-[10px] uppercase text-violet-200/70" : "text-[10px] uppercase text-slate-500"
                  }
                >
                  Fund
                </div>
                <div className={cosmic ? "mt-1 font-semibold text-white" : "mt-1 font-semibold text-slate-900"}>USDC</div>
              </div>
              <div
                className={
                  cosmic ? "rounded-xl border border-white/10 bg-white/5 p-3" : "rounded-xl bg-slate-50 p-3"
                }
              >
                <div
                  className={
                    cosmic ? "text-[10px] uppercase text-violet-200/70" : "text-[10px] uppercase text-slate-500"
                  }
                >
                  Cash-out
                </div>
                <div className={cosmic ? "mt-1 font-semibold text-white" : "mt-1 font-semibold text-slate-900"}>
                  Local bank
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className={
          cosmic
            ? "absolute left-5 top-16 w-56 rounded-2xl border border-white/20 bg-slate-950/55 p-4 shadow-lg shadow-purple-950/30 backdrop-blur-md"
            : "absolute left-5 top-16 w-56 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur"
        }
        animate={{ y: [0, -10, 0] }}
        transition={{ ...floatEase }}
      >
        <div className="flex items-center justify-between">
          <div className={cosmic ? "text-xs font-semibold text-white" : "text-xs font-semibold text-slate-900"}>
            USDC Deposit Confirmed
          </div>
          <span
            className={
              cosmic
                ? "rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200"
                : "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
            }
          >
            Confirmed
          </span>
        </div>
        <div className={cosmic ? "mt-2 text-xs text-violet-200/80" : "mt-2 text-xs text-slate-600"}>Amount</div>
        <div className={cosmic ? "text-sm font-bold text-amber-200" : "text-sm font-bold text-slate-900"}>1,250 USDC</div>
      </motion.div>

      <motion.div
        className={
          cosmic
            ? "absolute -right-2 top-24 w-60 rounded-2xl border border-white/20 bg-slate-950/55 p-4 shadow-lg shadow-purple-950/30 backdrop-blur-md"
            : "absolute -right-2 top-24 w-60 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur"
        }
        animate={{ y: [0, 12, 0] }}
        transition={{ ...floatEase, duration: 4.2 }}
      >
        <div className="flex items-center justify-between">
          <div className={cosmic ? "text-xs font-semibold text-white" : "text-xs font-semibold text-slate-900"}>Status</div>
          <span
            className={
              cosmic
                ? "rounded-full bg-fuchsia-400/25 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-100"
                : "rounded-full bg-purple-600/15 px-2 py-0.5 text-[10px] font-semibold text-purple-700"
            }
          >
            Claimed
          </span>
        </div>
        <div className={cosmic ? "mt-2 text-xs text-violet-200/80" : "mt-2 text-xs text-slate-600"}>Claim method</div>
        <div className={cosmic ? "text-sm font-bold text-violet-100" : "text-sm font-bold text-slate-900"}>
          Claimed via Passkey
        </div>
      </motion.div>
    </div>
  );
}
