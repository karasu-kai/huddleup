"use client";

import { cn } from "@/lib/utils";

/** Black house icon with neon UP — scales with the wordmark. */
function UpHouse({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <svg viewBox="0 0 48 56" className="h-full w-full" aria-hidden>
        {/* Triangle roof */}
        <path fill="#121212" d="M24 2 44 24H4L24 2z" />
        {/* House body */}
        <rect x="7" y="24" width="34" height="30" rx="1" fill="#121212" />
      </svg>
      <span className="absolute inset-x-0 bottom-[20%] text-center text-[0.44em] font-extrabold leading-none tracking-[0.1em] text-neon">
        UP
      </span>
    </span>
  );
}

export function Logo({
  compact,
  centered,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center",
        compact ? "gap-1.5 text-xl" : "gap-2 text-[2rem] sm:text-4xl",
        centered && "justify-center",
      )}
      role="img"
      aria-label="Huddle Up"
    >
      <span className="font-bold uppercase leading-none tracking-[0.05em] text-text-primary">
        Huddle
      </span>
      <UpHouse className={compact ? "h-[1.12em] w-[0.92em]" : "h-[1.15em] w-[0.95em]"} />
    </div>
  );
}
