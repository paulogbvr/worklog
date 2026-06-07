import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/skeleton";
import { getServerEnvStatus } from "@/lib/env";

type PageSkeletonVariant = "list" | "metrics";

// Shown by route-level loading.tsx files while server data is fetched. The
// fixed page chrome (sidebar + the real title/description) renders instantly and
// only the data-bound region shows the shimmer, so navigation feels immediate.
export function PageSkeleton({
  description,
  label,
  title,
  variant = "metrics"
}: {
  description?: string;
  label: string;
  title: string;
  variant?: PageSkeletonVariant;
}) {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
        <h1 className="mt-1 text-2xl font-semibold leading-tight text-[color:var(--app-text-strong)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--text-soft)]">
            {description}
          </p>
        ) : null}
      </header>

      {variant === "metrics" ? (
        <div className="grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3">
          {["m1", "m2", "m3"].map((key) => (
            <Skeleton className="h-24" key={key} />
          ))}
        </div>
      ) : (
        <div className="py-7">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      )}

      <div className="space-y-3">
        {["r1", "r2", "r3", "r4"].map((key) => (
          <Skeleton className="h-20" key={key} />
        ))}
      </div>
    </AppShell>
  );
}
