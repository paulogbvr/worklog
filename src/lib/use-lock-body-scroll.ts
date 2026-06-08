"use client";

import { useEffect } from "react";

// Locks background scroll while a modal/drawer is open and restores the previous
// overflow on close (and on unmount), so the page never gets stuck without scroll.
export function useLockBodyScroll(active = true) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
