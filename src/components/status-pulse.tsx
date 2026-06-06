export type StatusTone =
  | "attention"
  | "done"
  | "error"
  | "info"
  | "neutral"
  | "success"
  | "warning";

const toneClasses: Record<StatusTone, { core: string; ring: string }> = {
  attention: {
    core: "bg-orange-500",
    ring: "bg-orange-400/35"
  },
  done: {
    core: "bg-emerald-600",
    ring: "bg-emerald-500/40"
  },
  error: {
    core: "bg-red-500",
    ring: "bg-red-400/35"
  },
  info: {
    core: "bg-blue-500",
    ring: "bg-blue-400/35"
  },
  neutral: {
    core: "bg-zinc-400",
    ring: "bg-zinc-400/20"
  },
  success: {
    core: "bg-emerald-500",
    ring: "bg-emerald-400/35"
  },
  warning: {
    core: "bg-amber-400",
    ring: "bg-amber-300/35"
  }
};

export function StatusPulse({
  className = "",
  tone = "neutral"
}: {
  className?: string;
  tone?: StatusTone;
}) {
  const classes = toneClasses[tone];

  return (
    <span
      aria-hidden
      className={["relative inline-flex size-3 shrink-0 items-center justify-center", className].join(
        " "
      )}
    >
      <span
        className={[
          "absolute size-3 rounded-full motion-safe:animate-[status-pulse_2.2s_ease-out_infinite]",
          classes.ring
        ].join(" ")}
      />
      <span className={["relative size-1.5 rounded-full", classes.core].join(" ")} />
    </span>
  );
}
