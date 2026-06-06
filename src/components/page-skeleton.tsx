import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/skeleton";
import { getServerEnvStatus } from "@/lib/env";

type PageSkeletonVariant = "list" | "metrics";

// Shown by route-level loading.tsx files while server data is fetched. The
// fixed page chrome (sidebar + header label) renders instantly and only the
// data-bound region shows the shimmer, so navigation feels immediate.
export function PageSkeleton({
  label,
  variant = "metrics"
}: {
  label: string;
  variant?: PageSkeletonVariant;
}) {
  return (
    <AppShell envStatus={getServerEnvStatus()}>
      <header className="border-b border-[color:var(--border)] pb-6">
        <p className="text-sm text-[color:var(--text-muted)]">{label}</p>
        <Skeleton className="mt-2 h-8 w-56 max-w-full" />
      </header>

      {variant === "metrics" ? (
        <div className="grid gap-4 py-7 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-24" key={index} />
          ))}
        </div>
      ) : (
        <div className="py-7">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-20" key={index} />
        ))}
      </div>
    </AppShell>
  );
}
