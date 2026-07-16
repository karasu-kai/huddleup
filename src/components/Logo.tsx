"use client";

function UpMark({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 56"
      className={
        compact
          ? "inline-block h-8 w-[1.85rem] shrink-0"
          : "inline-block h-11 w-10 shrink-0"
      }
      aria-hidden
    >
      {/* Triangle roof — solid up arrow */}
      <path fill="#121212" d="M24 2 44 24H4L24 2z" />
      {/* Rectangular house body */}
      <path fill="#121212" d="M4 24h40v28H4V24z" />
      {/* Neon Up inside the house body */}
      <text
        x="24"
        y="40"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#C8FF00"
        fontSize={compact ? 11 : 14}
        fontWeight="800"
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        Up
      </text>
    </svg>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <h1
      className={
        compact
          ? "flex items-baseline gap-0.5 text-xl font-bold tracking-tight"
          : "flex items-baseline gap-1 text-3xl font-bold tracking-tight"
      }
    >
      <span className="text-text-primary">Huddle</span>
      <UpMark compact={compact} />
    </h1>
  );
}
