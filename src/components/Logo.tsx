"use client";

import { cn } from "@/lib/utils";

/** App icon — black tile, neon house. All neon lives here. */
function HuddleMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="shrink-0"
      aria-hidden
    >
      <rect x="1" y="1" width="46" height="46" rx="11" fill="#121212" />
      <path fill="#C8FF00" d="M24 11 37 24H11L24 11z" />
      <rect x="13" y="24" width="22" height="15" rx="1.5" fill="#C8FF00" />
    </svg>
  );
}

function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "font-semibold leading-none tracking-tight text-text-primary",
        compact ? "text-lg sm:text-xl" : "text-2xl sm:text-[1.75rem]",
      )}
    >
      Huddle<span className="font-bold"> Up</span>
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
  const markSize = compact ? 28 : 44;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 sm:gap-3",
        centered && "justify-center",
      )}
      role="img"
      aria-label="Huddle Up"
    >
      <HuddleMark size={markSize} />
      <Wordmark compact={compact} />
    </div>
  );
}
