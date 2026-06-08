"use client";

import { useEffect, useState } from "react";

// Greeting depends on the visitor's local clock, so it is resolved on the client
// after mount. The SSR/first paint shows a neutral fallback to avoid a hydration
// mismatch, then it swaps to the time-aware greeting.
function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) {
    return "Bom dia";
  }

  if (hour >= 12 && hour < 18) {
    return "Boa tarde";
  }

  if (hour >= 18 && hour < 24) {
    return "Boa noite";
  }

  return "Olá, coruja noturna";
}

export function DashboardGreeting() {
  const [greeting, setGreeting] = useState("Visão financeira");

  useEffect(() => {
    // Resolve the time-aware greeting only on the client after mount to avoid a
    // hydration mismatch with the SSR fallback.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return <>{greeting}</>;
}
