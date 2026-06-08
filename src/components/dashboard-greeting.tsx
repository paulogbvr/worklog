"use client";

import { useEffect, useState } from "react";

// Greeting depends on the visitor's local clock, so it is resolved on the client
// after mount. The SSR/first paint shows a neutral fallback to avoid a hydration
// mismatch, then it swaps to the time-aware greeting. The name comes from the
// profile and is appended when configured.
function greetingForHour(hour: number, name: string | null) {
  // Late night gets its own playful greeting and intentionally skips the name.
  if (hour >= 0 && hour < 5) {
    return "Olá, coruja noturna";
  }

  const base =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return name ? `${base}, ${name}` : base;
}

export function DashboardGreeting({ name = null }: { name?: string | null }) {
  const [greeting, setGreeting] = useState(name ? `Olá, ${name}` : "Olá");

  useEffect(() => {
    // Resolve the time-aware greeting only on the client after mount to avoid a
    // hydration mismatch with the SSR fallback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingForHour(new Date().getHours(), name));
  }, [name]);

  return <>{greeting}</>;
}
