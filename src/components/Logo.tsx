"use client";

function UpMark() {
  return (
    <span className="relative inline-flex h-[0.92em] w-[0.78em] shrink-0 translate-y-[0.06em] items-center justify-center">
      <svg
        viewBox="0 0 52 60"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {/* Up-pointing triangle roof — wider than the body */}
        <path fill="#121212" d="M26 1 50 29H2L26 1z" />
        {/* Rectangular house body below the roof */}
        <path fill="#121212" d="M8 29h36v29H8V29z" />
      </svg>
      <span className="relative z-10 translate-y-[22%] text-[0.34em] font-extrabold leading-none tracking-tight text-[#C8FF00]">
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
          ? "flex items-baseline gap-0.5 text-xl font-bold tracking-tight"
          : "flex items-baseline gap-1 text-3xl font-bold tracking-tight"
      }
    >
      <span className="text-text-primary">Huddle</span>
      <UpMark />
    </h1>
  );
}
