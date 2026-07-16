"use client";

function UpBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "relative inline-flex h-7 w-8 shrink-0 items-center justify-center"
          : "relative inline-flex h-10 w-11 shrink-0 items-center justify-center"
      }
    >
      <svg
        viewBox="0 0 44 48"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* Up arrow with house base — black mark behind the word */}
        <path
          fill="#121212"
          d="M22 2 40 22 31 22 31 46 13 46 13 22 4 22Z"
        />
      </svg>
      <span
        className={
          compact
            ? "relative z-10 text-[10px] font-extrabold leading-none tracking-tight text-neon"
            : "relative z-10 text-sm font-extrabold leading-none tracking-tight text-neon"
        }
      >
        Up
      </span>
    </span>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <h1
      className={
        compact
          ? "flex items-center gap-1 text-xl font-bold tracking-tight"
          : "flex items-center gap-1.5 text-3xl font-bold tracking-tight"
      }
    >
      <span className="text-text-primary">Huddle</span>
      <UpBadge compact={compact} />
    </h1>
  );
}
