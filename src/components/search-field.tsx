"use client";

import { Search, X } from "lucide-react";

// Reusable search box used to filter lists in real time. Kept presentational so
// it can be reused across clients, projects, payments and operations later.
export function SearchField({
  ariaLabel = "Buscar",
  onChange,
  placeholder = "Buscar...",
  value
}: {
  ariaLabel?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
      />
      <input
        aria-label={ariaLabel}
        className="h-11 w-full min-w-0 rounded-md border border-[color:var(--border)] bg-[var(--input-bg)] pl-9 pr-9 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors placeholder:text-[color:var(--text-faint)] focus:border-[color:var(--border-focus)]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {value ? (
        <button
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-[color:var(--text-muted)] transition-all duration-200 ease-out hover:bg-[var(--hover-bg)] hover:text-[color:var(--app-text-strong)] active:scale-[0.95]"
          onClick={() => onChange("")}
          type="button"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
