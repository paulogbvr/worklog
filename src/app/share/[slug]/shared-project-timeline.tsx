"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CircleDollarSign, History } from "lucide-react";

export type SharedTimelineFilter = "all" | "payments" | "updates";

export type SharedTimelineItem = {
  category: Exclude<SharedTimelineFilter, "all">;
  dateLabel: string;
  detail: string;
  id: string;
  title: string;
};

function readFilter(value: string | null): SharedTimelineFilter {
  return value === "payments" || value === "updates" ? value : "all";
}

export function SharedProjectTimeline({
  initialFilter,
  items
}: {
  initialFilter: SharedTimelineFilter;
  items: SharedTimelineItem[];
}) {
  const [filter, setFilter] = useState(initialFilter);
  const filtersRef = useRef<HTMLDivElement>(null);
  // Skip the very first render so the filter strip doesn't scroll itself into
  // view on mount — that was pulling the public page down to the metrics area.
  const hasInteractedRef = useRef(false);
  const counts = useMemo(
    () => ({
      all: items.length,
      payments: items.filter((item) => item.category === "payments").length,
      updates: items.filter((item) => item.category === "updates").length
    }),
    [items]
  );
  const visibleItems = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [filter, items]
  );

  useEffect(() => {
    function syncFromHistory() {
      setFilter(readFilter(new URL(window.location.href).searchParams.get("filter")));
    }

    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  useEffect(() => {
    if (!hasInteractedRef.current) {
      return;
    }

    const active = filtersRef.current?.querySelector<HTMLButtonElement>(
      `[data-filter="${filter}"]`
    );
    active?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [filter]);

  function selectFilter(nextFilter: SharedTimelineFilter) {
    hasInteractedRef.current = true;
    const url = new URL(window.location.href);
    url.searchParams.set("filter", nextFilter);
    window.history.replaceState(window.history.state, "", url);
    setFilter(nextFilter);
  }

  const emptyMessage =
    filter === "payments"
      ? "Nenhum pagamento registrado."
      : filter === "updates"
        ? "Nenhuma atualização encontrada."
        : "Nenhuma informação encontrada.";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <History className="size-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-amber-400">Histórico de atualizações</h2>
      </div>

      <div
        className="-mx-1 mt-4 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={filtersRef}
      >
        <div className="inline-flex w-max gap-0.5 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1">
          {(
            [
              ["all", "Todos"],
              ["updates", "Atualizações"],
              ["payments", "Pagamentos"]
            ] as const
          ).map(([value, label]) => (
            <button
              aria-pressed={filter === value}
              className={[
                "inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded px-2.5 text-xs transition-all duration-200 ease-out active:scale-95",
                filter === value
                  ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)] shadow-sm"
                  : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
              ].join(" ")}
              data-filter={value}
              key={value}
              onClick={() => selectFilter(value)}
              type="button"
            >
              {label}
              <span className="text-[10px] tabular-nums opacity-60">{counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 space-y-0 border-y border-[color:var(--border)]">
        {visibleItems.length > 0 ? (
          visibleItems.map((item) => (
            <article
              className="border-b border-[color:var(--border)] py-4 last:border-0"
              key={item.id}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="inline-flex items-center gap-2 text-sm font-medium">
                  {item.category === "payments" ? (
                    <CircleDollarSign className="size-3.5 text-emerald-400" />
                  ) : null}
                  {item.title}
                </h3>
                <span className="shrink-0 text-[10px] text-[color:var(--text-faint)]">
                  {item.dateLabel}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[color:var(--text-soft)]">
                {item.detail}
              </p>
            </article>
          ))
        ) : (
          <p className="py-8 text-sm text-[color:var(--text-soft)]">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
