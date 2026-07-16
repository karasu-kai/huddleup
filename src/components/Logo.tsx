"use client";

import { cn } from "@/lib/utils";

/** Classic house: triangle roof + rectangular body, neon UP inside. */
function HouseUpIcon({ size }: { size: number }) {
  const height = Math.round(size * 1.15);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 80 92"
      className="shrink-0"
      aria-hidden
    >
      <path fill="#121212" d="M40 4 74 42H6L40 4z" />
      <path fill="#121212" d="M14 42h52v46H14V42z" />
      <text
        x="40"
        y="68"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#C8FF00"
        fontSize="22"
        fontWeight="800"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        letterSpacing="0.06em"
      >
        UP
      </text>
    </svg>
  );
}

export function Logo({
  compact,
  centered,
}: {
  compact?: boolean;
  centered?: boolean;
}) {
  const houseSize = compact ? 40 : 64;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 sm:gap-3",
        centered && "justify-center",
      )}
      role="img"
      aria-label="Huddle Up"
    >
      <span
        className={cn(
          "font-bold uppercase tracking-[0.06em] text-text-primary",
          compact ? "text-lg sm:text-xl" : "text-3xl sm:text-[2.5rem]",
        )}
      >
        Huddle
      </span>
      <HouseUpIcon size={houseSize} />
    </div>
  );
}
