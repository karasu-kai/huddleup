"use client";

function UpMark({ compact }: { compact?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 52"
      className={
        compact
          ? "inline-block h-7 w-8 shrink-0"
          : "inline-block h-10 w-11 shrink-0"
      }
      aria-hidden
    >
      {/* Black house — peaked roof points up */}
      <path fill="#121212" d="M24 3 45 22v29H3V22L24 3z" />
      {/* Neon Up inside the house body */}
      <text
        x="24"
        y="37"
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
