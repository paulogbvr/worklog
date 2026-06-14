"use client";

import { useEffect } from "react";

// Public share pages should always open at the very top. Some child components
// (filters, anchors) can nudge the scroll position while hydrating, so we reset
// it once on mount. Guarded for the client only, so SSR stays untouched.
export function ScrollToTopOnMount() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo(0, 0);
  }, []);

  return null;
}
