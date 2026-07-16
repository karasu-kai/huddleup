"use client";

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <h1
      className={
        compact
          ? "text-xl font-bold tracking-tight"
          : "text-3xl font-bold tracking-tight"
      }
    >
      <span className="text-text-primary">Huddle</span>
      <span className="text-neon">Up</span>
    </h1>
  );
}
