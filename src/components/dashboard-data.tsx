"use client";

import { useEffect, useState, type ReactNode } from "react";
import { DASHBOARD_REFRESHING_EVENT } from "@/components/wakatime/sync-now-button";

// Wraps the data-bound dashboard sections (metrics, charts, current operation).
// When a sync/refresh is in flight it swaps the real content for a skeleton of
// the same shape, giving a real "updating" sensation without touching the fixed
// chrome (title, filters, refresh button, last sync).
export function DashboardData({
  children,
  skeleton
}: {
  children: ReactNode;
  skeleton: ReactNode;
}) {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    function onRefreshing(event: Event) {
      setRefreshing(Boolean((event as CustomEvent<boolean>).detail));
    }

    window.addEventListener(DASHBOARD_REFRESHING_EVENT, onRefreshing);
    return () => window.removeEventListener(DASHBOARD_REFRESHING_EVENT, onRefreshing);
  }, []);

  if (refreshing) {
    return (
      <div aria-busy="true" className="motion-safe:animate-[toast-enter_.2s_ease-out]">
        {skeleton}
      </div>
    );
  }

  return <>{children}</>;
}
