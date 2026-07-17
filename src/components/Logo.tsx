"use client";

import { cn } from "@/lib/utils";

/** App icon — black tile, neon house (roof points up). */
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
      <path fill="#C8FF00" d="M24 12 36 24H12L24 12z" />
      <rect x="14" y="24" width="20" height="14" rx="1.5" fill="#C8FF00" />
    </svg>
  );
}

function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <span
      className={cn(
        "leading-none tracking-tight",
        compact ? "text-[1.15rem] sm:text-xl" : "text-[1.75rem] sm:text-[2rem]",
      )}
    >
      <span className="font-semibold text-text-primary">huddle </span>
      <span className="font-bold text-neon">up</span>
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
  const markSize = compact ? 30 : 52;

  if (compact) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2.5",
          centered && "justify-center",
        )}
        role="img"
        aria-label="Huddle Up"
      >
        <HuddleMark size={markSize} />
        <Wordmark compact />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-3 sm:gap-3.5",
        centered && "justify-center",
      )}
      role="img"
      aria-label="Huddle Up"
    >
      <HuddleMark size={markSize} />
      <Wordmark />
    </div>
  );
}
