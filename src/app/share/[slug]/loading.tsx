import { BrandLogo } from "@/components/brand-logo";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[color:var(--app-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[var(--ambient-gradient)]" />
      <div className="relative mx-auto w-full max-w-5xl px-5 py-7 sm:px-8 lg:py-10">
        <header className="border-b border-[color:var(--border)] pb-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BrandLogo />
            <Skeleton className="h-9 w-40" />
          </div>
          <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-3 h-9 w-64 max-w-full" />
              <Skeleton className="mt-3 h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </header>

        <section className="py-7">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg sm:grid-cols-3 lg:grid-cols-5">
            {["a", "b", "c", "d", "e"].map((key) => (
              <Skeleton className="h-20" key={key} />
            ))}
          </div>
        </section>

        <section className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_.8fr]">
          <div className="space-y-3">
            <Skeleton className="h-6 w-56" />
            {["t1", "t2", "t3"].map((key) => (
              <Skeleton className="h-16" key={key} />
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-full" />
            {["p1", "p2", "p3", "p4"].map((key) => (
              <Skeleton className="h-14" key={key} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
