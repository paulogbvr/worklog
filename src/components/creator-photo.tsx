"use client";

import Image from "next/image";
import { useState } from "react";

// Shows a shimmer placeholder of the exact same box size until the creator photo
// finishes loading, then crossfades it in — no layout shift.
export function CreatorPhoto({ alt, src }: { alt: string; src: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-lg border border-[color:var(--border)]">
      {!loaded ? <div className="worklog-skeleton absolute inset-0" /> : null}
      <Image
        alt={alt}
        className={[
          "h-full w-full object-cover object-[32%_center] transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0"
        ].join(" ")}
        height={460}
        onLoad={() => setLoaded(true)}
        priority
        src={src}
        width={460}
      />
    </div>
  );
}
