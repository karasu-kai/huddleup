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
        "app-card min-w-0 overflow-hidden p-4",
        muted && "border-border/80 bg-surface-muted",
        className,
      )}
    >
      {children}
    </div>
  );
}
