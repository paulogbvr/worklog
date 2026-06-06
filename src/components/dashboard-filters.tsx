"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { DashboardPeriod } from "@/server/dashboard/summary";

export function DashboardFilters({
  basePath = "/",
  period,
  projectId,
  projects
}: {
  basePath?: string;
  period: DashboardPeriod;
  projectId: string | null;
  projects: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();

  function buildHref(nextPeriod: DashboardPeriod) {
    const query = new URLSearchParams({
      period: nextPeriod
    });

    if (projectId) {
      query.set("project", projectId);
    }

    return `${basePath}?${query.toString()}${basePath === "/" ? "#dashboard" : ""}`;
  }

  function selectProject(nextProjectId: string) {
    const query = new URLSearchParams({
      period
    });

    if (nextProjectId) {
      query.set("project", nextProjectId);
    }

    router.push(`${basePath}?${query.toString()}${basePath === "/" ? "#dashboard" : ""}`, {
      scroll: false
    });
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      <label className="relative block min-w-52">
        <span className="sr-only">Filtrar por projeto</span>
        <select
          className="h-11 w-full appearance-none rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] px-3 pr-10 text-sm text-[color:var(--app-text-strong)] outline-none transition-colors focus:border-[color:var(--border-focus)]"
          onChange={(event) => selectProject(event.target.value)}
          value={projectId ?? ""}
        >
          <option value="">Todos os projetos</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[color:var(--text-faint)]"
        />
      </label>

      <nav
        aria-label="Filtrar dashboard por período"
        className="grid w-fit grid-cols-3 rounded-md border border-[color:var(--border)] bg-[var(--surface-subtle)] p-1"
      >
        {(
          [
            ["7d", "7D"],
            ["30d", "30D"],
            ["all", "ALL"]
          ] as const
        ).map(([value, label]) => (
          <Link
            aria-current={period === value ? "page" : undefined}
            className={[
              "min-w-12 rounded px-3 py-2 text-center text-xs font-medium transition-colors",
              period === value
                ? "bg-[var(--active-bg)] text-[color:var(--app-text-strong)]"
                : "text-[color:var(--text-muted)] hover:text-[color:var(--app-text-strong)]"
            ].join(" ")}
            href={buildHref(value)}
            key={value}
            prefetch
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
