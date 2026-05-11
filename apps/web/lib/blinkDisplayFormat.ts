export function truncateMiddle(s: string | null | undefined, head = 6, tail = 4): string {
  if (!s) return "—";
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export function formatBlinkDateTime(iso: string): { dateLine: string; timeLine: string } {
  const d = new Date(iso);
  return {
    dateLine: d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    timeLine: `At ${d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}`,
  };
}

export function dicebearInitialsUrl(seed: string): string {
  const q = new URLSearchParams({
    seed,
    backgroundColor: "e9d5ff",
    textColor: "9333ea",
  });
  return `https://api.dicebear.com/7.x/initials/svg?${q.toString()}`;
}
