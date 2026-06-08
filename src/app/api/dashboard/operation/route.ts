import { NextResponse } from "next/server";
import { getDashboardSummary, type DashboardPeriod } from "@/server/dashboard/summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parsePeriod(value: string | null): DashboardPeriod {
  if (value === "30d" || value === "all") {
    return value;
  }

  return "7d";
}

// Powers the "Operação atual" section's own local period filter, independent of
// the dashboard's global filter. Returns only the rows + counters that section
// needs for the requested period.
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const period = parsePeriod(url.searchParams.get("period"));
    const project = url.searchParams.get("project") || undefined;
    const summary = await getDashboardSummary(period, project);

    return NextResponse.json({
      activeProjects: summary.activeProjects,
      ok: true,
      pendingProjects: summary.pendingProjects,
      periodDedicatedLabel: summary.periodDedicatedLabel,
      periodWakaTimeLabel: summary.periodWakaTimeLabel,
      projects: summary.projects
    });
  } catch {
    return NextResponse.json(
      {
        error: "Não foi possível carregar a operação atual.",
        ok: false
      },
      { status: 500 }
    );
  }
}
