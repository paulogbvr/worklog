"use client";

import { CalendarDays, Clock3 } from "lucide-react";

// Native date/time inputs carry an intrinsic min-width on iOS Safari that ignores
// width:100% and overflows narrow cards. These fields render our own visual shell
// and keep the real native input on top but fully transparent, used only to open
// the platform picker. The displayed text is rendered by us, so the layout is
// always controlled by CSS and never overflows.

const shellClass =
  "relative flex h-11 w-full min-w-0 items-center gap-2 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] px-3 text-sm text-[color:var(--app-text-strong)] transition-colors focus-within:border-[color:var(--border-focus)]";

// The native control sits above the shell, transparent, so a tap anywhere opens
// the picker. Keeping it font-size:16px prevents the iOS focus zoom.
const nativeInputClass =
  "absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-[16px] text-transparent opacity-0 outline-none";

function formatBrDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return null;
  }

  return `${day}/${month}/${year}`;
}

export function DateField({
  ariaLabel,
  max,
  onChange,
  placeholder = "Data",
  value
}: {
  ariaLabel: string;
  max?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const display = value ? formatBrDate(value) : null;

  return (
    <span className={shellClass}>
      <span
        className={[
          "min-w-0 flex-1 truncate text-left",
          display ? "" : "text-[color:var(--text-faint)]"
        ].join(" ")}
      >
        {display ?? placeholder}
      </span>
      <CalendarDays
        aria-hidden
        className="size-4 shrink-0 text-[color:var(--text-faint)]"
      />
      <input
        aria-label={ariaLabel}
        className={nativeInputClass}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </span>
  );
}

export function TimeField({
  ariaLabel,
  onChange,
  placeholder = "Hora",
  value
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <span className={shellClass}>
      <span
        className={[
          "min-w-0 flex-1 truncate text-left",
          value ? "" : "text-[color:var(--text-faint)]"
        ].join(" ")}
      >
        {value || placeholder}
      </span>
      <Clock3 aria-hidden className="size-4 shrink-0 text-[color:var(--text-faint)]" />
      <input
        aria-label={ariaLabel}
        className={nativeInputClass}
        onChange={(event) => onChange(event.target.value)}
        type="time"
        value={value}
      />
    </span>
  );
}
