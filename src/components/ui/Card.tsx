"use client";

import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  muted,
}: {
  className?: string;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
        muted && "bg-surface-muted opacity-70",
        className,
      )}
    >
      {children}
    </div>
  );
}
