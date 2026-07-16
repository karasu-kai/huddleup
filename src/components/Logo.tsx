"use client";

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
      <span
        className={
          compact
            ? "rounded-md bg-neon px-1.5 py-0.5 font-extrabold text-text-primary shadow-[0_1px_0_rgba(0,0,0,0.06)]"
            : "rounded-lg bg-neon px-2 py-0.5 font-extrabold text-text-primary shadow-[0_1px_0_rgba(0,0,0,0.06)]"
        }
      >
        Up
      </span>
    </h1>
  );
}
