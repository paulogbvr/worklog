import { Skeleton } from "@/components/skeleton";

// Matches the shape of the dashboard data area (metrics, chart, current
// operation). Used both as the Suspense fallback on first load and by
// DashboardData while a manual refresh is in flight.
export function DashboardSkeleton() {
  return (
    <>
      <section className="py-7">
        <div className="mb-4">
          <Skeleton className="h-3.5 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["m1", "m2", "m3"].map((key) => (
            <Skeleton className="h-[92px]" key={key} />
          ))}
        </div>
      </section>
      <Skeleton className="h-72 w-full" />
      <section className="mt-8 space-y-3">
        <Skeleton className="h-20 w-full" />
        {["r1", "r2", "r3"].map((key) => (
          <Skeleton className="h-16 w-full" key={key} />
        ))}
      </section>
    </>
  );
}
