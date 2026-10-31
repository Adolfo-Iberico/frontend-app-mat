
"use client";

import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

function InfiniteMarquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
}: PropsWithChildren<{
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
}>) {
  const [paused, setPaused] = useState(false);
  const onEnter = pauseOnHover ? () => setPaused(true) : undefined;
  const onLeave = pauseOnHover ? () => setPaused(false) : undefined;

  const items = useMemo(() => React.Children.toArray(children), [children]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        pauseOnHover && "[&:hover_.marquee-track]:[animation-play-state:paused]",
        className
      )}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div
        className={cn(
          "marquee-track flex min-w-max shrink-0 items-stretch gap-4",
          "[animation:marquee_var(--duration)_linear_infinite]",
          reverse && "[animation-direction:reverse]",
          paused && "[animation-play-state:paused]"
        )}
      >
        <div className="flex min-w-max items-stretch gap-4">{items}</div>
        <div className="flex min-w-max items-stretch gap-4" aria-hidden>
          {items}
        </div>
      </div>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

export { InfiniteMarquee as Marquee };
